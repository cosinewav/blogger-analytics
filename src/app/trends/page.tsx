'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/skeleton';
import { AnimatedNumber, formatChineseNumber } from '@/components/ui/animated-number';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';

interface TrendData {
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

interface KeywordPerformance {
  keyword: string;
  count: number;
  totalPlayCount: number;
  avgPlayCount: number;
  avgSpreadIndex: number;
}

interface SpreadDistribution {
  name: string;
  value: number;
  color: string;
}

function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString();
}

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [keywordPerformance, setKeywordPerformance] = useState<KeywordPerformance[]>([]);
  const [spreadDistribution, setSpreadDistribution] = useState<SpreadDistribution[]>([]);
  const [topKeywords, setTopKeywords] = useState<KeywordPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const playCountChartRef = useRef<ReactECharts>(null);
  const interactionChartRef = useRef<ReactECharts>(null);
  const contentChartRef = useRef<ReactECharts>(null);
  const avgPlayChartRef = useRef<ReactECharts>(null);
  const spreadChartRef = useRef<ReactECharts>(null);
  const keywordChartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => setTrendData(data));

    fetch('/api/keywords-performance')
      .then(res => res.json())
      .then(data => {
        setKeywordPerformance(data.keywordPerformance);
        setSpreadDistribution(data.spreadDistribution);
        setTopKeywords(data.topKeywords);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        setLoading(false);
      });
  }, []);

  const goToMonth = (date: string) => {
    router.push(`/videos?date=${date}`);
  };

  const exportChartAsPNG = (chartRef: React.RefObject<ReactECharts | null>, fileName: string) => {
    const instance = chartRef.current?.getEchartsInstance();
    if (instance) {
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#1f2937',
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // 播放量趋势配置
  const playCountOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const data = params[0];
        return `
          <div style="padding: 8px;">
            <p style="font-weight: bold; margin-bottom: 8px;">${data.name}</p>
            <p style="color: #3b82f6;">播放量: ${formatNumber(data.value)}</p>
            <button onclick="window.goToMonth('${data.name}')" style="margin-top: 8px; padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              查看该月视频 →
            </button>
          </div>
        `;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date),
      axisLabel: { color: '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 12, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series: [{
      name: '播放量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: trendData.map(d => d.playCount),
      lineStyle: { color: '#3b82f6', width: 3 },
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.8)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.1)' },
        ]),
      },
    }],
  };

  // 互动数据趋势配置
  const interactionOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
    },
    legend: {
      data: ['点赞数', '评论数', '分享数'],
      textStyle: { color: '#9ca3af' },
      top: 0,
      selected: { '点赞数': true, '评论数': true, '分享数': true },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series: [
      {
        name: '点赞数',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.likes),
        lineStyle: { color: '#f43f5e', width: 2 },
        itemStyle: { color: '#f43f5e' },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '评论数',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.comments),
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '分享数',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.shares),
        lineStyle: { color: '#06b6d4', width: 2 },
        itemStyle: { color: '#06b6d4' },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  };

  // 内容产出与爆款趋势配置
  const contentOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
    },
    legend: {
      data: ['总视频数', '爆款数量', '优质内容'],
      textStyle: { color: '#9ca3af' },
      top: 0,
      selected: { '总视频数': true, '爆款数量': true, '优质内容': true },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series: [
      {
        name: '总视频数',
        type: 'bar',
        data: trendData.map(d => d.videoCount),
        itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '爆款数量',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.hotCount),
        lineStyle: { color: '#ef4444', width: 2 },
        itemStyle: { color: '#ef4444' },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '优质内容',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.qualityCount),
        lineStyle: { color: '#22c55e', width: 2 },
        itemStyle: { color: '#22c55e' },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  };

  // 平均播放量趋势配置
  const avgPlayOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => `${params[0].name}<br/>平均播放量: ${formatNumber(params[0].value)}`,
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series: [{
      name: '平均播放量',
      type: 'line',
      smooth: true,
      data: trendData.map(d => d.avgPlayCount),
      lineStyle: { color: '#10b981', width: 2 },
      itemStyle: { color: '#10b981' },
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.8)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.1)' },
        ]),
      },
    }],
  };

  // 传播指数趋势配置
  const spreadOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => `${params[0].name}<br/>传播指数: ${params[0].value?.toFixed(2)}`,
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series: [{
      name: '传播指数',
      type: 'line',
      smooth: true,
      data: trendData.map(d => d.avgSpreadIndex),
      lineStyle: { color: '#f59e0b', width: 3 },
      itemStyle: { color: '#f59e0b' },
      symbol: 'circle',
      symbolSize: 8,
    }],
  };

  // 关键词排行配置
  const topKeywordsData = keywordPerformance.slice(0, 20);
  const keywordOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: topKeywordsData.map(d => d.keyword).reverse(),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    dataZoom: [
      { type: 'slider', yAxisIndex: 0, start: 0, end: 100, right: 10 },
      { type: 'inside', yAxisIndex: 0, start: 0, end: 100 },
    ],
    series: [{
      name: '平均播放量',
      type: 'bar',
      data: topKeywordsData.map((d, i) => ({
        value: d.avgPlayCount,
        itemStyle: {
          color: i < 3 ? '#f59e0b' : i < 10 ? '#3b82f6' : '#6366f1',
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
    }],
  };

  // 全局暴露跳转函数
  if (typeof window !== 'undefined') {
    (window as any).goToMonth = goToMonth;
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">📈 趋势分析</h1>
        <p className="text-gray-600 mb-8">深入分析内容表现、关键词效果与传播趋势</p>

        {/* 核心指标卡片 */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最高频关键词</div>
              <div className="text-2xl font-bold mt-2">{topKeywords[0]?.keyword || '-'}</div>
              <div className="text-xs opacity-70 mt-1">使用 {topKeywords[0]?.count || 0} 次</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最高播放关键词</div>
              <div className="text-2xl font-bold mt-2">{keywordPerformance[0]?.keyword || '-'}</div>
              <div className="text-xs opacity-70 mt-1">平均 {formatNumber(keywordPerformance[0]?.avgPlayCount || 0)} 播放</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/keywords')}>
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">最佳传播关键词</div>
              <div className="text-2xl font-bold mt-2">
                {[...keywordPerformance].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.keyword || '-'}
              </div>
              <div className="text-xs opacity-70 mt-1">
                平均指数 {[...keywordPerformance].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.avgSpreadIndex.toFixed(2) || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="text-sm opacity-80">爆款内容占比</div>
              <div className="text-2xl font-bold mt-2">
                {(() => {
                  const total = spreadDistribution.reduce((sum, d) => sum + d.value, 0);
                  const hot = spreadDistribution.filter(d => d.name.includes('爆款')).reduce((sum, d) => sum + d.value, 0);
                  return total > 0 ? `${((hot / total) * 100).toFixed(1)}%` : '0%';
                })()}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {spreadDistribution.filter(d => d.name.includes('爆款')).reduce((sum, d) => sum + d.value, 0)} 个爆款视频
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速月份选择器 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              快速跳转到某月
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendData.slice(-12).map((item) => (
                <Button
                  key={item.date}
                  variant="outline"
                  onClick={() => goToMonth(item.date)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  {item.date}
                  <span className="ml-2 text-xs text-gray-500">({item.videoCount}条)</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 播放量趋势 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                播放量趋势
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(playCountChartRef, 'play-count-trend')}>
                导出PNG
              </Button>
            </div>
            <p className="text-sm text-gray-600">支持缩放和拖拽查看</p>
          </CardHeader>
          <CardContent>
            <ReactECharts
              ref={playCountChartRef}
              option={playCountOption}
              style={{ height: 400 }}
              opts={{ renderer: 'canvas' }}
            />
          </CardContent>
        </Card>

        {/* 双列布局 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* 互动数据趋势 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  互动数据趋势
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(interactionChartRef, 'interaction-trend')}>
                  导出PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={interactionChartRef}
                option={interactionOption}
                style={{ height: 350 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>

          {/* 内容产出与爆款趋势 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  内容产出与爆款趋势
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(contentChartRef, 'content-trend')}>
                  导出PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={contentChartRef}
                option={contentOption}
                style={{ height: 350 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 第二行 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* 平均播放量趋势 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📈</span>
                  平均播放量趋势
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(avgPlayChartRef, 'avg-play-trend')}>
                  导出PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={avgPlayChartRef}
                option={avgPlayOption}
                style={{ height: 300 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>

          {/* 传播指数趋势 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  传播指数趋势
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(spreadChartRef, 'spread-index-trend')}>
                  导出PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={spreadChartRef}
                option={spreadOption}
                style={{ height: 300 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 关键词播放量排行 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                关键词播放量排行 TOP 20
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(keywordChartRef, 'keyword-ranking')}>
                导出PNG
              </Button>
            </div>
            <p className="text-sm text-gray-600">按平均播放量排序，发现高价值关键词</p>
          </CardHeader>
          <CardContent>
            <ReactECharts
              ref={keywordChartRef}
              option={keywordOption}
              style={{ height: 400 }}
              opts={{ renderer: 'canvas' }}
            />
          </CardContent>
        </Card>

        {/* 月度数据表格 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              月度数据详情
            </CardTitle>
            <p className="text-sm text-gray-600">点击行跳转到视频列表</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">月份</th>
                    <th className="text-right py-3 px-4 font-medium">视频数</th>
                    <th className="text-right py-3 px-4 font-medium">总播放量</th>
                    <th className="text-right py-3 px-4 font-medium">平均播放量</th>
                    <th className="text-right py-3 px-4 font-medium">传播指数</th>
                    <th className="text-right py-3 px-4 font-medium">点赞</th>
                    <th className="text-right py-3 px-4 font-medium">评论</th>
                    <th className="text-right py-3 px-4 font-medium">爆款</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.slice(-12).reverse().map((item) => (
                    <tr
                      key={item.date}
                      className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                      onClick={() => goToMonth(item.date)}
                    >
                      <td className="py-3 px-4 font-medium text-blue-600">{item.date}</td>
                      <td className="py-3 px-4 text-right">{item.videoCount}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatNumber(item.playCount)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.avgPlayCount)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${item.avgSpreadIndex > 15 ? 'text-green-500' : item.avgSpreadIndex > 10 ? 'text-yellow-500' : 'text-gray-500'}`}>
                          {item.avgSpreadIndex.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.likes)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.comments)}</td>
                      <td className="py-3 px-4 text-right">
                        {item.hotCount > 0 && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                            🔥 {item.hotCount}
                          </span>
                        )}
                      </td>
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
