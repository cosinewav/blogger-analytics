'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';

interface KeywordStat {
  keyword: string;
  count: number;
  avgPlayCount: number;
  avgSpreadIndex: number;
}

function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString();
}

export default function KeywordsPage() {
  const [keywordStats, setKeywordStats] = useState<KeywordStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordCloudLoaded, setWordCloudLoaded] = useState(false);

  const wordCloudChartRef = useRef<ReactECharts>(null);
  const scatterChartRef = useRef<ReactECharts>(null);

  // Dynamically import echarts-wordcloud on client side only
  useEffect(() => {
    import('echarts-wordcloud').then(() => {
      setWordCloudLoaded(true);
    });
  }, []);

  useEffect(() => {
    fetch('/api/keywords')
      .then(res => res.json())
      .then(data => {
        setKeywordStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        setLoading(false);
      });
  }, []);

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

  if (loading || !wordCloudLoaded) {
    return <PageSkeleton />;
  }

  // 词云图配置
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wordCloudOption: any = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `<div style="padding: 8px;">
          <p style="font-weight: bold; margin-bottom: 4px;">${params.name}</p>
          <p>使用次数: ${params.value}</p>
          <p>平均播放: ${formatNumber(keywordStats.find(k => k.keyword === params.name)?.avgPlayCount || 0)}</p>
        </div>`;
      },
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [14, 60],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#f43f5e', '#10b981'];
          return colors[Math.floor(Math.random() * colors.length)];
        },
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333',
        },
      },
      data: keywordStats.slice(0, 80).map(item => ({
        name: item.keyword,
        value: item.count,
        textStyle: {
          color: item.avgPlayCount > 50000 ? '#f59e0b' : item.avgPlayCount > 20000 ? '#3b82f6' : undefined,
        },
      })),
    }],
  };

  // 关键词散点图：播放量 vs 传播指数
  const scatterOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `<div style="padding: 8px;">
          <p style="font-weight: bold; margin-bottom: 4px;">${params.data[2]}</p>
          <p>平均播放: ${formatNumber(params.data[0])}</p>
          <p>传播指数: ${params.data[1].toFixed(2)}</p>
          <p>使用次数: ${params.data[3]}</p>
        </div>`;
      },
    },
    grid: { left: '3%', right: '10%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'log',
      name: '平均播放量',
      nameTextStyle: { color: '#9ca3af', fontSize: 12 },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (v: number) => formatNumber(v),
      },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      name: '传播指数',
      nameTextStyle: { color: '#9ca3af', fontSize: 12 },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'inside', yAxisIndex: 0, start: 0, end: 100 },
    ],
    visualMap: {
      show: true,
      dimension: 3,
      min: 1,
      max: Math.max(...keywordStats.map(k => k.count)),
      inRange: {
        color: ['#67e0e3', '#37a2da', '#ffdb5c', '#ff9f7f', '#fb7293'],
      },
      textStyle: { color: '#9ca3af' },
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['高频', '低频'],
      calculable: true,
    },
    series: [{
      type: 'scatter',
      symbolSize: (val: number[]) => Math.sqrt(val[3]) * 3 + 10,
      data: keywordStats.slice(0, 50).map(item => [
        item.avgPlayCount,
        item.avgSpreadIndex,
        item.keyword,
        item.count,
      ]),
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(25, 100, 150, 0.5)',
        shadowOffsetY: 5,
      },
      emphasis: {
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    }],
  };

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🏷️ 关键词分析</h1>
        <p className="text-gray-600 mb-8">发现高效关键词，优化内容策略</p>

        {/* 核心指标卡片 */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StaggerItem>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">关键词总数</div>
                <div className="text-2xl font-bold mt-2">{keywordStats.length}</div>
                <div className="text-xs opacity-70 mt-1">个关键词</div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">最高频关键词</div>
                <div className="text-lg font-bold mt-2">{keywordStats[0]?.keyword || '-'}</div>
                <div className="text-xs opacity-70 mt-1">使用 {keywordStats[0]?.count || 0} 次</div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">平均播放量最高</div>
                <div className="text-lg font-bold mt-2">
                  {[...keywordStats].sort((a, b) => b.avgPlayCount - a.avgPlayCount)[0]?.keyword || '-'}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  平均 {formatNumber([...keywordStats].sort((a, b) => b.avgPlayCount - a.avgPlayCount)[0]?.avgPlayCount || 0)} 播放
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">传播指数最高</div>
                <div className="text-lg font-bold mt-2">
                  {[...keywordStats].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.keyword || '-'}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  平均指数 {[...keywordStats].sort((a, b) => b.avgSpreadIndex - a.avgSpreadIndex)[0]?.avgSpreadIndex?.toFixed(2) || 0}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* 词云图 */}
        {wordCloudLoaded && (
          <FadeIn>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">☁️</span>
                    关键词词云
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(wordCloudChartRef, 'keyword-wordcloud')}>
                    导出PNG
                  </Button>
                </div>
                <p className="text-sm text-gray-600">关键词大小代表使用频率，黄色代表高播放量关键词</p>
              </CardHeader>
              <CardContent>
                <ReactECharts
                  ref={wordCloudChartRef}
                  option={wordCloudOption}
                  style={{ height: 450 }}
                  opts={{ renderer: 'canvas' }}
                />
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* 关键词效果散点图 */}
        <FadeIn>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  关键词效果分布
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(scatterChartRef, 'keyword-scatter')}>
                  导出PNG
                </Button>
              </div>
              <p className="text-sm text-gray-600">横轴为平均播放量，纵轴为传播指数，颜色代表使用频率，支持缩放拖拽</p>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={scatterChartRef}
                option={scatterOption}
                style={{ height: 450 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>
        </FadeIn>

        {/* 关键词排行表格 */}
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>关键词排行 TOP 50</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">#</th>
                      <th className="text-left py-3 px-4 font-medium">关键词</th>
                      <th className="text-right py-3 px-4 font-medium">使用次数</th>
                      <th className="text-right py-3 px-4 font-medium">平均播放量</th>
                      <th className="text-right py-3 px-4 font-medium">平均传播指数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordStats.slice(0, 50).map((item, index) => (
                      <tr key={item.keyword} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{item.keyword}</td>
                        <td className="py-3 px-4 text-right">{item.count}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatNumber(item.avgPlayCount)}</td>
                        <td className="py-3 px-4 text-right font-medium">{item.avgSpreadIndex.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </main>
  );
}
