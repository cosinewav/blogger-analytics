'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  BarChart,
} from 'recharts';
import { useRouter } from 'next/navigation';

interface TrendData {
  date: string;
  playCount: number;
  videoCount: number;
  avgSpreadIndex: number;
  likes: number;
  comments: number;
  shares: number;
  favorites: number;
  hotCount: number;
  qualityCount: number;
  avgPlayCount: number;
  likeRate: number;
  commentRate: number;
}

interface KeywordPerformance {
  keyword: string;
  count: number;
  totalPlayCount: number;
  avgPlayCount: number;
  avgSpreadIndex: number;
}

interface SpreadDistribution {
  name: string;
  value: number;
  color: string;
}

function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString();
}

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [keywordPerformance, setKeywordPerformance] = useState<KeywordPerformance[]>([]);
  const [spreadDistribution, setSpreadDistribution] = useState<SpreadDistribution[]>([]);
  const [topKeywords, setTopKeywords] = useState<KeywordPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => setTrendData(data));

    fetch('/api/keywords-performance')
      .then(res => res.json())
      .then(data => {
        setKeywordPerformance(data.keywordPerformance);
        setSpreadDistribution(data.spreadDistribution);
        setTopKeywords(data.topKeywords);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        setLoading(false);
      });
  }, []);

  // 跳转到某月的视频列表
  const goToMonth = (date: string) => {
    router.push(`/videos?date=${date}`);
  };

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
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">📈 趋势分析</h1>
        <p className="text-gray-600 mb-8">深入分析内容表现、关键词效果与传播趋势</p>

        {/* 核心指标卡片 */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最高频关键词</div>
              <div className="text-2xl font-bold mt-2">{topKeywords[0]?.keyword || '-'}</div>
              <div className="text-xs opacity-70 mt-1">使用 {topKeywords[0]?.count || 0} 次</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最高播放关键词</div>
              <div className="text-2xl font-bold mt-2">{keywordPerformance[0]?.keyword || '-'}</div>
              <div className="text-xs opacity-70 mt-1">平均 {formatNumber(keywordPerformance[0]?.avgPlayCount || 0)} 播放</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最佳传播关键词</div>
              <div className="text-2xl font-bold mt-2">
                {[...keywordPerformance].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.keyword || '-'}
              </div>
              <div className="text-xs opacity-70 mt-1">
                平均指数 {[...keywordPerformance].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.avgSpreadIndex.toFixed(2) || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">爆款内容占比</div>
              <div className="text-2xl font-bold mt-2">
                {(() => {
                  const total = spreadDistribution.reduce((sum, d) => sum + d.value, 0);
                  const hot = spreadDistribution.filter(d => d.name.includes('爆款')).reduce((sum, d) => sum + d.value, 0);
                  return total > 0 ? `${((hot / total) * 100).toFixed(1)}%` : '0%';
                })()}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {spreadDistribution.filter(d => d.name.includes('爆款')).reduce((sum, d) => sum + d.value, 0)} 个爆款视频
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速月份选择器 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              快速跳转到某月
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendData.slice(-12).map((item) => (
                <Button
                  key={item.date}
                  variant="outline"
                  onClick={() => goToMonth(item.date)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  {item.date}
                  <span className="ml-2 text-xs text-gray-500">({item.videoCount}条)</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 播放量趋势 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              播放量趋势
            </CardTitle>
            <p className="text-sm text-gray-600">悬停查看详情，点击上方月份按钮跳转</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart 
                data={trendData}
                onMouseMove={(e) => {
                  if (e?.activePayload?.[0]?.payload?.date) {
                    setActiveDate(e.activePayload[0].payload.date);
                  }
                }}
                onMouseLeave={() => setActiveDate(null)}
              >
                <defs>
                  <linearGradient id="colorPlayCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                          <p className="text-white font-bold mb-2">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{ color: entry.color }} className="text-sm">
                              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 
                                ? formatNumber(entry.value) 
                                : entry.value?.toFixed?.(2) || entry.value}
                            </p>
                          ))}
                          <Button
                            size="sm"
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => goToMonth(label)}
                          >
                            查看该月视频 →
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="playCount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPlayCount)" 
                  name="播放量"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 双列布局 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* 互动数据趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                互动数据趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-bold mb-2">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} style={{ color: entry.color }} className="text-sm">
                                {entry.name}: {formatNumber(entry.value)}
                              </p>
                            ))}
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => goToMonth(label)}
                            >
                              查看该月视频 →
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="likes" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }} name="点赞数" />
                  <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} name="评论数" />
                  <Line type="monotone" dataKey="shares" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} name="分享数" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 内容产出与爆款趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                内容产出与爆款趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-bold mb-2">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} style={{ color: entry.color }} className="text-sm">
                                {entry.name}: {entry.value}
                              </p>
                            ))}
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => goToMonth(label)}
                            >
                              查看该月视频 →
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="videoCount" fill="#6366f1" name="总视频数" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="hotCount" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} name="爆款数量" />
                  <Line type="monotone" dataKey="qualityCount" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }} name="优质内容" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 第二行 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* 平均播放量趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                平均播放量趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAvgPlay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-bold mb-2">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} style={{ color: entry.color }} className="text-sm">
                                {entry.name}: {formatNumber(entry.value)}
                              </p>
                            ))}
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => goToMonth(label)}
                            >
                              查看该月视频 →
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="avgPlayCount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAvgPlay)" name="平均播放量" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 传播指数趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                传播指数趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-bold mb-2">{label}</p>
                            <p className="text-amber-500 text-sm">传播指数: {payload[0]?.value?.toFixed(2)}</p>
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => goToMonth(label)}
                            >
                              查看该月视频 →
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="avgSpreadIndex" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }} name="传播指数" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 关键词播放量排行 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏷️</span>
              关键词播放量排行 TOP 20
            </CardTitle>
            <p className="text-sm text-gray-600">按平均播放量排序，发现高价值关键词</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={keywordPerformance.slice(0, 20)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                <YAxis dataKey="keyword" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                  formatter={(value: number, name: string) => [
                    name === 'avgPlayCount' ? formatNumber(value) : value,
                    name === 'avgPlayCount' ? '平均播放量' : name === 'count' ? '使用次数' : '传播指数'
                  ]}
                />
                <Bar dataKey="avgPlayCount" fill="#3b82f6" radius={[0, 4, 4, 0]} name="平均播放量">
                  {keywordPerformance.slice(0, 20).map((entry, index) => (
                    <cell key={`cell-${index}`} fill={index < 3 ? '#f59e0b' : index < 10 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 月度数据表格 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              月度数据详情
            </CardTitle>
            <p className="text-sm text-gray-600">点击行跳转到视频列表</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">月份</th>
                    <th className="text-right py-3 px-4 font-medium">视频数</th>
                    <th className="text-right py-3 px-4 font-medium">总播放量</th>
                    <th className="text-right py-3 px-4 font-medium">平均播放量</th>
                    <th className="text-right py-3 px-4 font-medium">传播指数</th>
                    <th className="text-right py-3 px-4 font-medium">点赞</th>
                    <th className="text-right py-3 px-4 font-medium">评论</th>
                    <th className="text-right py-3 px-4 font-medium">爆款</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.slice(-12).reverse().map((item) => (
                    <tr 
                      key={item.date} 
                      className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                      onClick={() => goToMonth(item.date)}
                    >
                      <td className="py-3 px-4 font-medium text-blue-600">{item.date}</td>
                      <td className="py-3 px-4 text-right">{item.videoCount}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatNumber(item.playCount)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.avgPlayCount)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${item.avgSpreadIndex > 15 ? 'text-green-500' : item.avgSpreadIndex > 10 ? 'text-yellow-500' : 'text-gray-500'}`}>
                          {item.avgSpreadIndex.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.likes)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.comments)}</td>
                      <td className="py-3 px-4 text-right">
                        {item.hotCount > 0 && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                            🔥 {item.hotCount}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
