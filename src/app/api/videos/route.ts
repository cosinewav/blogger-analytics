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

    // 转换为前端需要的格式
    const formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      playCount: v.playCount,
      likes: v.likes,
      comments: v.comments,
      shares: v.shares,
      favorites: v.favorites,
      spreadIndex: v.spreadIndex,
      spreadLevel: v.spreadLevel,
      keywords: v.keywords,
      publishedAt: v.publishedAt,
      douyinUrl: typeof v.douyinUrl === 'object' && v.douyinUrl !== null ? (v.douyinUrl as { link: string }).link : v.douyinUrl as string,
    }));

    const response = NextResponse.json(formattedVideos);
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取视频数据失败:', error);
    // Return empty array instead of error for better UX
    const emptyResponse = NextResponse.json([]);
    emptyResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return emptyResponse;
  }
}
