'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  playCount: number;
  likes: number;
  comments: number;
  shares: string;
  favorites: number;
  spreadIndex: number;
  spreadLevel: string;
  keywords: string[];
  publishedAt: string | null;
  douyinUrl: string;
}

function VideosContent() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [spreadLevelFilter, setSpreadLevelFilter] = useState('all');
  const [sortField, setSortField] = useState<'playCount' | 'spreadIndex' | 'publishedAt'>('playCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [playCountRange, setPlayCountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const itemsPerPage = 20;
  
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');

  // 获取数据
  useEffect(() => {
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('获取数据失败:', error);
        setLoading(false);
      });
  }, []);

  // 筛选和排序
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // 日期筛选（从趋势页跳转）
    if (dateFilter) {
      result = result.filter((video) => {
        if (!video.publishedAt) return false;
        const videoDate = new Date(video.publishedAt);
        const videoMonth = `${videoDate.getFullYear()}-${String(videoDate.getMonth() + 1).padStart(2, '0')}`;
        return videoMonth === dateFilter;
      });
    }

    // 搜索
    if (searchQuery) {
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 传播等级筛选
    if (spreadLevelFilter !== 'all') {
      result = result.filter((video) => video.spreadLevel === spreadLevelFilter);
    }

    // 播放量范围筛选
    if (playCountRange.min || playCountRange.max) {
      const min = parseInt(playCountRange.min) || 0;
      const max = parseInt(playCountRange.max) || Infinity;
      result = result.filter((video) => video.playCount >= min && video.playCount <= max);
    }

    // 排序
    result.sort((a, b) => {
      let aVal: number, bVal: number;
      
      if (sortField === 'publishedAt') {
        aVal = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        bVal = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [videos, searchQuery, spreadLevelFilter, sortField, sortOrder, dateFilter, playCountRange]);

  // 分页
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatNumber = (num: number): string => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toLocaleString();
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  // 快速筛选按钮
  const quickFilters = [
    { label: '🔥 爆款', filter: () => setSpreadLevelFilter('🔥 超级爆款') },
    { label: '🚀 大爆款', filter: () => setSpreadLevelFilter('🚀 大爆款') },
    { label: '📈 优质', filter: () => setSpreadLevelFilter('📈 优质内容') },
    { label: '📝 待优化', filter: () => setSpreadLevelFilter('📝 待优化') },
    { label: '💯 百万播放', filter: () => setPlayCountRange({ min: '1000000', max: '' }) },
    { label: '🔥 十万播放', filter: () => setPlayCountRange({ min: '100000', max: '' }) },
  ];

  // 清除所有筛选
  const clearAllFilters = () => {
    setSearchQuery('');
    setSpreadLevelFilter('all');
    setPlayCountRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || spreadLevelFilter !== 'all' || playCountRange.min || playCountRange.max;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">📹 内容列表</h1>
        <p className="text-gray-600 mb-8">查看所有视频内容数据</p>

        {/* 日期筛选提示 */}
        {dateFilter && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-blue-600 font-medium">📅 正在筛选 {dateFilter} 月的内容</span>
              <span className="text-gray-600 ml-2">（共 {filteredVideos.length} 条）</span>
            </div>
            <a
              href="/videos"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              清除筛选
            </a>
          </div>
        )}

        {/* 快速筛选按钮 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickFilters.map((qf, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={qf.filter}
              className="hover:bg-blue-50"
            >
              {qf.label}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              清除筛选
            </Button>
          )}
        </div>

        {/* 主筛选栏 */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索标题或关键词..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          <select
            value={spreadLevelFilter}
            onChange={(e) => {
              setSpreadLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">全部等级</option>
            <option value="🔥 超级爆款">🔥 超级爆款</option>
            <option value="🚀 大爆款">🚀 大爆款</option>
            <option value="⭐ 小爆款">⭐ 小爆款</option>
            <option value="📈 优质内容">📈 优质内容</option>
            <option value="✅ 正常表现">✅ 正常表现</option>
            <option value="📝 待优化">📝 待优化</option>
          </select>

          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortField(field as any);
              setSortOrder(order as any);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="playCount-desc">播放量 ↓</option>
            <option value="playCount-asc">播放量 ↑</option>
            <option value="spreadIndex-desc">传播指数 ↓</option>
            <option value="spreadIndex-asc">传播指数 ↑</option>
            <option value="publishedAt-desc">时间 ↓</option>
            <option value="publishedAt-asc">时间 ↑</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            高级筛选
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* 高级筛选 */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">播放量范围：</span>
                <Input
                  type="number"
                  placeholder="最小"
                  value={playCountRange.min}
                  onChange={(e) => {
                    setPlayCountRange({ ...playCountRange, min: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-28"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="最大"
                  value={playCountRange.max}
                  onChange={(e) => {
                    setPlayCountRange({ ...playCountRange, max: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-28"
                />
              </div>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="text-sm text-gray-600 mb-4 flex items-center gap-4">
          <span>
            共 <strong className="text-blue-600">{filteredVideos.length}</strong> 条记录
            {filteredVideos.length !== videos.length && (
              <span>（已从 {videos.length} 条中筛选）</span>
            )}
          </span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">当前筛选：</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  关键词: {searchQuery}
                </Badge>
              )}
              {spreadLevelFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {spreadLevelFilter}
                </Badge>
              )}
              {(playCountRange.min || playCountRange.max) && (
                <Badge variant="secondary" className="text-xs">
                  播放量: {playCountRange.min || '0'} - {playCountRange.max || '∞'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 表格 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium">标题</th>
                <th className="text-left py-3 px-4 font-medium">发布时间</th>
                <th className="text-right py-3 px-4 font-medium">播放量</th>
                <th className="text-right py-3 px-4 font-medium">点赞</th>
                <th className="text-right py-3 px-4 font-medium">评论</th>
                <th className="text-right py-3 px-4 font-medium">传播指数</th>
                <th className="text-left py-3 px-4 font-medium">传播等级</th>
                <th className="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVideos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    没有找到匹配的视频
                  </td>
                </tr>
              ) : (
                paginatedVideos.map((video) => (
                  <tr key={video.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 max-w-md truncate font-medium">
                      {video.title || '-'}
                    </td>
                    <td className="py-3 px-4">{formatDate(video.publishedAt)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatNumber(video.playCount)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(video.likes)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(video.comments)}</td>
                    <td className="py-3 px-4 text-right font-medium">{video.spreadIndex.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          video.spreadLevel?.includes('爆款')
                            ? 'destructive'
                            : video.spreadLevel?.includes('优质')
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {video.spreadLevel || '-'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {video.douyinUrl && (
                        <a
                          href={video.douyinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 inline" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <VideosContent />
    </Suspense>
  );
}
