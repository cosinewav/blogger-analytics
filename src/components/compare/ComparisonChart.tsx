'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Download } from 'lucide-react';

interface ChartDataItem {
  label: string;
  values: Record<string, number>;
}

interface ComparisonChartProps {
  title: string;
  icon?: React.ReactNode;
  data: ChartDataItem[];
  accounts: { key: string; label: string }[];
  type?: 'bar' | 'line' | 'radar';
  unit?: string;
  showExport?: boolean;
}

const ACCOUNT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
];

export function ComparisonChart({
  title,
  icon,
  data,
  accounts,
  type = 'bar',
  unit = '%',
  showExport = true,
}: ComparisonChartProps) {
  const chartRef = useRef<ReactECharts>(null);

  const exportChart = () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (instance) {
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#1f2937',
      });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-')}-comparison.png`;
      link.href = url;
      link.click();
    }
  };

  const getChartOption = (): echarts.EChartsOption => {
    const labels = data.map(d => d.label);

    if (type === 'radar') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1f2937',
          borderColor: '#374151',
          textStyle: { color: '#fff' },
        },
        legend: {
          data: accounts.map(a => a.label),
          bottom: 0,
          textStyle: { color: '#9ca3af' },
        },
        radar: {
          indicator: labels.map(label => ({
            name: label,
            max: Math.max(...data.flatMap(d => Object.values(d.values))) * 1.2,
          })),
          center: ['50%', '50%'],
          radius: '60%',
          axisName: { color: '#9ca3af', fontSize: 11 },
          splitArea: {
            areaStyle: {
              color: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.2)'],
            },
          },
          axisLine: { lineStyle: { color: '#374151' } },
          splitLine: { lineStyle: { color: '#374151' } },
        },
        series: [{
          type: 'radar',
          data: accounts.map((account, index) => ({
            value: data.map(d => d.values[account.key] || 0),
            name: account.label,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: ACCOUNT_COLORS[index], width: 2 },
            areaStyle: { color: `${ACCOUNT_COLORS[index]}40` },
            itemStyle: { color: ACCOUNT_COLORS[index] },
          })),
        }],
      };
    }

    if (type === 'line') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1f2937',
          borderColor: '#374151',
          textStyle: { color: '#fff' },
          axisPointer: { type: 'cross' },
        },
        legend: {
          data: accounts.map(a => a.label),
          bottom: 0,
          textStyle: { color: '#9ca3af' },
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#9ca3af', fontSize: 11 },
          axisLine: { lineStyle: { color: '#374151' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#9ca3af', formatter: `{value}${unit}` },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        series: accounts.map((account, index) => ({
          name: account.label,
          type: 'line',
          data: data.map(d => d.values[account.key] || 0),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: ACCOUNT_COLORS[index], width: 3 },
          itemStyle: { color: ACCOUNT_COLORS[index] },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${ACCOUNT_COLORS[index]}40` },
              { offset: 1, color: `${ACCOUNT_COLORS[index]}05` },
            ]),
          },
        })),
      };
    }

    // Default: grouped bar chart
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const items = params.map((p: any) => `${p.seriesName}: ${p.value}${unit}`);
          return `${params[0].axisValue}<br/>${items.join('<br/>')}`;
        },
      },
      legend: {
        data: accounts.map(a => a.label),
        bottom: 0,
        textStyle: { color: '#9ca3af' },
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: '#9ca3af', fontSize: 11, interval: 0, rotate: labels.length > 6 ? 30 : 0 },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9ca3af', formatter: `{value}${unit}` },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
      },
      series: accounts.map((account, index) => ({
        name: account.label,
        type: 'bar',
        data: data.map(d => d.values[account.key] || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ACCOUNT_COLORS[index] },
            { offset: 1, color: `${ACCOUNT_COLORS[index]}80` },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 40,
      })),
    };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          {showExport && (
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ReactECharts
          ref={chartRef}
          option={getChartOption()}
          style={{ height: 350 }}
          opts={{ renderer: 'canvas' }}
        />
      </CardContent>
    </Card>
  );
}
