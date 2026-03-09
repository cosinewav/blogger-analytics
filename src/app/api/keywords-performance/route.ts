import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { VideoData } from '@/types';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const videos: VideoData[] = JSON.parse(data);

    // 计算关键词表现
    const keywordMap = new Map<string, { 
      count: number; 
      totalPlayCount: number; 
      totalSpreadIndex: number;
      videos: VideoData[];
    }>();

    videos.forEach(v => {
      v.keywords.forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, { 
            count: 0, 
            totalPlayCount: 0, 
            totalSpreadIndex: 0,
            videos: [] 
          });
        }
        const stat = keywordMap.get(keyword)!;
        stat.count++;
        stat.totalPlayCount += v.playCount;
        stat.totalSpreadIndex += v.spreadIndex;
        stat.videos.push(v);
      });
    });

    // 转换为数组并计算平均值
    // 过滤掉出现次数少于3次的关键词，避免偶然性
    const keywordPerformance = Array.from(keywordMap.entries())
      .map(([keyword, stat]) => ({
        keyword,
        count: stat.count,
        totalPlayCount: stat.totalPlayCount,
        avgPlayCount: Math.round(stat.totalPlayCount / stat.count),
        avgSpreadIndex: Number((stat.totalSpreadIndex / stat.count).toFixed(2)),
      }))
      .filter(k => k.count >= 3) // 至少出现3次才纳入统计
      .sort((a, b) => b.avgPlayCount - a.avgPlayCount);

    // 传播等级分布
    const spreadLevelMap = new Map<string, number>();
    videos.forEach(v => {
      const level = v.spreadLevel || '未知';
      spreadLevelMap.set(level, (spreadLevelMap.get(level) || 0) + 1);
    });

    const spreadDistribution = Array.from(spreadLevelMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: getSpreadColor(name),
      }))
      .sort((a, b) => b.value - a.value);

    // 高频关键词排行（按使用次数）
    const topKeywords = [...keywordPerformance]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const response = NextResponse.json({
      keywordPerformance,
      spreadDistribution,
      topKeywords,
    });
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取关键词表现数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

function getSpreadColor(level: string): string {
  if (level.includes('超级爆款')) return '#ef4444';
  if (level.includes('大爆款')) return '#f97316';
  if (level.includes('小爆款')) return '#eab308';
  if (level.includes('优质')) return '#22c55e';
  if (level.includes('正常')) return '#3b82f6';
  if (level.includes('待优化')) return '#6b7280';
  return '#9ca3af';
}
