import fs from 'fs';
import path from 'path';
import { VideoData, DashboardStats, KeywordStat, TrendData, SpreadLevelDist } from '@/types';

// 读取本地数据
export function getVideos(): VideoData[] {
  const dataPath = path.join(process.cwd(), 'data', 'videos.json');
  
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
}

// 计算统计数据
export function getDashboardStats(videos: VideoData[]): DashboardStats {
  if (videos.length === 0) {
    return {
      totalVideos: 0,
      totalPlayCount: 0,
      avgPlayCount: 0,
      avgEngagementRate: 0,
      avgSpreadIndex: 0,
      maxSpreadIndex: 0,
      topKeywords: [],
      recentTrend: [],
      spreadLevelDistribution: [],
    };
  }

  // 基础统计
  const totalPlayCount = videos.reduce((sum, v) => sum + v.playCount, 0);
  const avgPlayCount = Math.round(totalPlayCount / videos.length);
  
  // 平均互动率
  const engagementRates = videos
    .map(v => parseFloat(v.engagementRate.replace('%', '')))
    .filter(r => !isNaN(r));
  const avgEngagementRate = engagementRates.length > 0
    ? engagementRates.reduce((sum, r) => sum + r, 0) / engagementRates.length
    : 0;

  // 传播指数
  const spreadIndexes = videos.filter(v => v.spreadIndex > 0).map(v => v.spreadIndex);
  const avgSpreadIndex = spreadIndexes.length > 0
    ? spreadIndexes.reduce((sum, s) => sum + s, 0) / spreadIndexes.length
    : 0;
  const maxSpreadIndex = spreadIndexes.length > 0
    ? Math.max(...spreadIndexes)
    : 0;

  // 关键词统计
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

  const topKeywords: KeywordStat[] = Array.from(keywordMap.entries())
    .map(([keyword, stat]) => ({
      keyword,
      count: stat.count,
      avgPlayCount: Math.round(stat.playCounts.reduce((sum, p) => sum + p, 0) / stat.count),
      avgSpreadIndex: Number((stat.spreadIndexes.reduce((sum, s) => sum + s, 0) / stat.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 趋势数据（按月份聚合）
  const monthlyData = new Map<string, { playCount: number; videoCount: number; spreadIndexes: number[] }>();
  
  videos.forEach(v => {
    if (v.publishedAt) {
      const date = new Date(v.publishedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { playCount: 0, videoCount: 0, spreadIndexes: [] });
      }
      
      const stat = monthlyData.get(monthKey)!;
      stat.playCount += v.playCount;
      stat.videoCount++;
      stat.spreadIndexes.push(v.spreadIndex);
    }
  });

  const recentTrend: TrendData[] = Array.from(monthlyData.entries())
    .map(([date, stat]) => ({
      date,
      playCount: stat.playCount,
      videoCount: stat.videoCount,
      avgSpreadIndex: Number((stat.spreadIndexes.reduce((sum, s) => sum + s, 0) / stat.videoCount).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12); // 最近12个月

  // 传播等级分布
  const spreadLevelCounts = new Map<string, number>();
  videos.forEach(v => {
    if (v.spreadLevel) {
      spreadLevelCounts.set(v.spreadLevel, (spreadLevelCounts.get(v.spreadLevel) || 0) + 1);
    }
  });

  const spreadLevelDistribution: SpreadLevelDist[] = Array.from(spreadLevelCounts.entries())
    .map(([level, count]) => ({
      level,
      count,
      percentage: Number(((count / videos.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalVideos: videos.length,
    totalPlayCount,
    avgPlayCount,
    avgEngagementRate,
    avgSpreadIndex,
    maxSpreadIndex,
    topKeywords,
    recentTrend,
    spreadLevelDistribution,
  };
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}
