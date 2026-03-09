import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

// SWR global config for data caching
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // Dedupe requests within 1 minute
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

// Video data type
export interface Video {
  id: string;
  title: string;
  playCount: number;
  likes: number;
  comments: number;
  shares: string;
  favorites: number;
  spreadIndex: number;
  spreadLevel: string;
  keywords: string[];
  publishedAt: string | null;
  douyinUrl: string;
}

// Hook for fetching videos with SWR caching
export function useVideos() {
  const { data, error, isLoading, mutate } = useSWR<Video[]>(
    '/api/videos',
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    videos: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Trend data type
export interface TrendData {
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

// Hook for fetching trends with SWR caching
export function useTrends() {
  const { data, error, isLoading, mutate } = useSWR<TrendData[]>(
    '/api/trends',
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    trends: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Keyword performance data type
export interface KeywordPerformance {
  keyword: string;
  count: number;
  totalPlayCount: number;
  avgPlayCount: number;
  avgSpreadIndex: number;
}

export interface SpreadDistribution {
  name: string;
  value: number;
  color: string;
}

export interface KeywordsData {
  keywordPerformance: KeywordPerformance[];
  spreadDistribution: SpreadDistribution[];
  topKeywords: KeywordPerformance[];
}

// Hook for fetching keywords performance with SWR caching
export function useKeywordsPerformance() {
  const { data, error, isLoading, mutate } = useSWR<KeywordsData>(
    '/api/keywords-performance',
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data: data ?? {
      keywordPerformance: [],
      spreadDistribution: [],
      topKeywords: [],
    },
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Fan profile data type
export interface FanProfile {
  id: string;
  name: string;
  avatar: string;
  [key: string]: unknown;
}

// Hook for fetching fan profiles with SWR caching
export function useFanProfiles() {
  const { data, error, isLoading, mutate } = useSWR<FanProfile[]>(
    '/api/fan-profiles',
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    profiles: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
