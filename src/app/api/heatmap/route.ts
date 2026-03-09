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

    // 统计每个时间段的视频数量和播放量
    // heatmap[hour][dayOfWeek] = { count, totalPlayCount }
    const heatmapData: Record<number, Record<number, { count: number; totalPlayCount: number }>> = {};

    // 初始化 24小时 x 7天
    for (let hour = 0; hour < 24; hour++) {
      heatmapData[hour] = {};
      for (let day = 0; day < 7; day++) {
        heatmapData[hour][day] = { count: 0, totalPlayCount: 0 };
      }
    }

    // 遍历视频数据
    videos.forEach(v => {
      if (v.publishedAt) {
        const date = new Date(v.publishedAt);
        const hour = date.getHours();
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

        heatmapData[hour][dayOfWeek].count++;
        heatmapData[hour][dayOfWeek].totalPlayCount += v.playCount;
      }
    });

    // 转换为 ECharts 热力图格式 [dayOfWeek, hour, value]
    const videoCountData: [number, number, number][] = [];
    const avgPlayCountData: [number, number, number][] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        const stat = heatmapData[hour][day];
        videoCountData.push([day, hour, stat.count]);
        const avgPlay = stat.count > 0 ? Math.round(stat.totalPlayCount / stat.count) : 0;
        avgPlayCountData.push([day, hour, avgPlay]);
      }
    }

    // 计算最大值用于色阶
    const maxVideoCount = Math.max(...videoCountData.map(d => d[2]));
    const maxAvgPlay = Math.max(...avgPlayCountData.map(d => d[2]));

    const response = NextResponse.json({
      videoCountData,
      avgPlayCountData,
      maxVideoCount,
      maxAvgPlay,
      days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    });

    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取热力图数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
