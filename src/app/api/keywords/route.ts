import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { VideoData } from '@/types';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');

    // Check if file exists before reading
    if (!fs.existsSync(dataPath)) {
      console.warn('视频数据文件不存在:', dataPath);
      const emptyResponse = NextResponse.json([]);
      emptyResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return emptyResponse;
    }

    const data = fs.readFileSync(dataPath, 'utf-8');
    const videos: VideoData[] = JSON.parse(data);

    // 计算关键词统计
    const keywordMap = new Map<string, {
      count: number;
      playCounts: number[];
      spreadIndexes: number[];
    }>();

    videos.forEach(v => {
      v.keywords.forEach(keyword => {
        // 过滤无效关键词
        if (!keyword ||
            keyword === '无法提炼关键词' ||
            keyword.trim() === '' ||
            keyword.includes('无法') ||
            keyword.length < 2) {
          return;
        }

        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            count: 0,
            playCounts: [],
            spreadIndexes: [],
          });
        }
        const stat = keywordMap.get(keyword)!;
        stat.count++;
        stat.playCounts.push(v.playCount);
        stat.spreadIndexes.push(v.spreadIndex);
      });
    });

    // 转换为数组并计算平均值
    const keywordStats = Array.from(keywordMap.entries())
      .map(([keyword, stat]) => ({
        keyword,
        count: stat.count,
        avgPlayCount: Math.round(stat.playCounts.reduce((sum, p) => sum + p, 0) / stat.count),
        avgSpreadIndex: Number((stat.spreadIndexes.reduce((sum, s) => sum + s, 0) / stat.count).toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count);

    const response = NextResponse.json(keywordStats);
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取关键词数据失败:', error);
    // Return empty array instead of error for better UX
    const emptyResponse = NextResponse.json([]);
    emptyResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return emptyResponse;
  }
}
