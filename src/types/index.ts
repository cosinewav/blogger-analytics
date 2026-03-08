// 视频数据类型
export interface VideoData {
  id: string;
  title: string;
  author: string[];
  publishedAt: string | null;
  douyinUrl: string;
  videoUrl: string;
  duration: string;
  status: string;
  playCount: number;
  likes: number;
  comments: number;
  shares: string;
  favorites: number;
  engagementTotal: string;
  engagementRate: string;
  spreadIndex: number;
  spreadLevel: string;
  keywords: string[];
  content: string;
  summary: string;
  coverUrl: string;
  imageUrl: string;
  domain: string;
  recordYear: string;
  recordMonth: string;
  recordDay: string;
}

// 统计数据类型
export interface DashboardStats {
  totalVideos: number;
  totalPlayCount: number;
  avgPlayCount: number;
  avgEngagementRate: number;
  avgSpreadIndex: number;
  maxSpreadIndex: number;
  topKeywords: KeywordStat[];
  recentTrend: TrendData[];
  spreadLevelDistribution: SpreadLevelDist[];
}

export interface KeywordStat {
  keyword: string;
  count: number;
  avgPlayCount: number;
  avgSpreadIndex: number;
}

export interface TrendData {
  date: string;
  playCount: number;
  videoCount: number;
  avgSpreadIndex: number;
}

export interface SpreadLevelDist {
  level: string;
  count: number;
  percentage: number;
}
