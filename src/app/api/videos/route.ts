import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { VideoData } from '@/types';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
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
      douyinUrl: typeof v.douyinUrl === 'object' ? v.douyinUrl?.link : v.douyinUrl,
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error('获取视频数据失败:', error);
    return NextResponse.json({ error: '获取视频数据失败' }, { status: 500 });
  }
}
