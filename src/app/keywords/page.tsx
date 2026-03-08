import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoData } from '@/types';

function getKeywordStats(videos: VideoData[]) {
  const keywordMap = new Map<string, { count: number; playCounts: number[]; spreadIndexes: number[] }>();

  videos.forEach(v => {
    v.keywords.forEach(keyword => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, { count: 0, playCounts: [], spreadIndexes: [] });
      }
      const stat = keywordMap.get(keyword)!;
      stat.count++;
      stat.playCounts.push(v.playCount);
      stat.spreadIndexes.push(v.spreadIndex);
    });
  });

  return Array.from(keywordMap.entries())
    .map(([keyword, stat]) => ({
      keyword,
      count: stat.count,
      avgPlayCount: Math.round(stat.playCounts.reduce((sum, p) => sum + p, 0) / stat.count),
      avgSpreadIndex: Number((stat.spreadIndexes.reduce((sum, s) => sum + s, 0) / stat.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);
}

function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString();
}

export default function KeywordsPage() {
  const dataPath = path.join(process.cwd(), 'data', 'videos.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  const videos: VideoData[] = JSON.parse(data);
  const keywordStats = getKeywordStats(videos);

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🏷️ 关键词分析</h1>
        <p className="text-gray-600 mb-8">发现高效关键词，优化内容策略</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">关键词总数</div>
              <div className="text-2xl font-bold mt-2">{keywordStats.length}</div>
              <div className="text-xs text-gray-500 mt-1">个关键词</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">最高频关键词</div>
              <div className="text-lg font-bold mt-2">{keywordStats[0]?.keyword || '-'}</div>
              <div className="text-xs text-gray-500 mt-1">使用 {keywordStats[0]?.count || 0} 次</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">平均播放量最高</div>
              <div className="text-lg font-bold mt-2">
                {[...keywordStats].sort((a, b) => b.avgPlayCount - a.avgPlayCount)[0]?.keyword || '-'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                平均 {formatNumber([...keywordStats].sort((a, b) => b.avgPlayCount - a.avgPlayCount)[0]?.avgPlayCount || 0)} 播放
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">传播指数最高</div>
              <div className="text-lg font-bold mt-2">
                {[...keywordStats].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.keyword || '-'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                平均指数 {[...keywordStats].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.avgSpreadIndex || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 关键词排行表格 */}
        <Card>
          <CardHeader>
            <CardTitle>关键词排行 TOP 50</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">关键词</th>
                    <th className="text-right py-3 px-4 font-medium">使用次数</th>
                    <th className="text-right py-3 px-4 font-medium">平均播放量</th>
                    <th className="text-right py-3 px-4 font-medium">平均传播指数</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordStats.slice(0, 50).map((item, index) => (
                    <tr key={item.keyword} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-medium">{item.keyword}</td>
                      <td className="py-3 px-4 text-right">{item.count}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatNumber(item.avgPlayCount)}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.avgSpreadIndex}</td>
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
