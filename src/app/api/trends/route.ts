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

    const monthlyData = new Map<string, { 
      playCount: number; 
      videoCount: number; 
      spreadIndexes: number[]; 
      likes: number; 
      comments: number;
      shares: number;
      favorites: number;
      hotCount: number;
      qualityCount: number;
      videos: VideoData[];
    }>();

    videos.forEach(v => {
      if (v.publishedAt) {
        const date = new Date(v.publishedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { 
            playCount: 0, 
            videoCount: 0, 
            spreadIndexes: [], 
            likes: 0, 
            comments: 0,
            shares: 0,
            favorites: 0,
            hotCount: 0,
            qualityCount: 0,
            videos: []
          });
        }

        const stat = monthlyData.get(monthKey)!;
        stat.playCount += v.playCount;
        stat.videoCount++;
        stat.spreadIndexes.push(v.spreadIndex);
        stat.likes += v.likes;
        stat.comments += v.comments;
        stat.favorites += v.favorites || 0;
        stat.videos.push(v);
        
        // 统计爆款和优质内容
        if (v.spreadLevel?.includes('爆款')) {
          stat.hotCount++;
        }
        if (v.spreadLevel?.includes('优质')) {
          stat.qualityCount++;
        }
        
        // 解析 shares 字符串
        const sharesNum = typeof v.shares === 'string' ? parseInt(v.shares) || 0 : (v.shares || 0);
        stat.shares += sharesNum;
      }
    });

    const trendData = Array.from(monthlyData.entries())
      .map(([date, stat]) => ({
        date,
        playCount: stat.playCount,
        videoCount: stat.videoCount,
        avgSpreadIndex: Number((stat.spreadIndexes.reduce((sum, s) => sum + s, 0) / stat.videoCount).toFixed(2)),
        likes: stat.likes,
        comments: stat.comments,
        shares: stat.shares,
        favorites: stat.favorites,
        hotCount: stat.hotCount,
        qualityCount: stat.qualityCount,
        avgPlayCount: Math.round(stat.playCount / stat.videoCount),
        likeRate: Number(((stat.likes / stat.playCount) * 100).toFixed(2)),
        commentRate: Number(((stat.comments / stat.playCount) * 100).toFixed(3)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const response = NextResponse.json(trendData);
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json({ error: '获取趋势数据失败' }, { status: 500 });
  }
}
