'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';

// 中国地图 GeoJSON 数据 URL（使用 unpkg CDN）
const CHINA_MAP_URL = 'https://unpkg.com/echarts@5.4.3/map/json/china.json';

interface ProfileItem {
  label: string;
  value: number;
}

interface AccountProfile {
  '性别分布': ProfileItem[];
  '年龄分布': ProfileItem[];
  '省份分布': ProfileItem[];
  '城市分布': ProfileItem[];
  '城市级别': ProfileItem[];
  '八大人群分布': ProfileItem[];
  '商品类型偏好': ProfileItem[];
  '商品价格偏好': ProfileItem[];
}

type ProfilesData = Record<string, AccountProfile>;

const ACCOUNTS = [
  { key: '哈佛亮爸', label: '哈佛亮爸' },
  { key: '哈佛亮爸英语信息差', label: '英语信息差' },
  { key: '哈佛亮爸(直播号)', label: '直播号' },
];

const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
};

export default function ProfilesPage() {
  const [profilesData, setProfilesData] = useState<ProfilesData | null>(null);
  const [activeAccount, setActiveAccount] = useState('哈佛亮爸');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  const genderChartRef = useRef<ReactECharts>(null);
  const mapChartRef = useRef<ReactECharts>(null);
  const ageChartRef = useRef<ReactECharts>(null);
  const cityLevelChartRef = useRef<ReactECharts>(null);
  const crowdChartRef = useRef<ReactECharts>(null);
  const provinceChartRef = useRef<ReactECharts>(null);
  const cityChartRef = useRef<ReactECharts>(null);
  const priceChartRef = useRef<ReactECharts>(null);
  const productChartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    fetch('/api/fan-profiles')
      .then(res => res.json())
      .then(data => {
        setProfilesData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        setLoading(false);
      });
  }, []);

  // 加载中国地图
  useEffect(() => {
    fetch(CHINA_MAP_URL)
      .then(res => res.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson);
        setMapLoaded(true);
      })
      .catch(err => {
        console.error('加载地图数据失败:', err);
        setMapLoaded(true); // 即使失败也继续显示
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

  if (loading || !profilesData) {
    return <PageSkeleton />;
  }

  const currentData = profilesData[activeAccount];

  // 性别分布饼图
  const genderOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}% ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#9ca3af' },
    },
    series: [{
      name: '性别分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#1f2937',
        borderWidth: 2,
      },
      label: {
        show: true,
        position: 'center',
        formatter: `{b}\n{c}%`,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
        },
      },
      data: currentData['性别分布'].map((item, index) => ({
        value: item.value,
        name: item.label,
        itemStyle: { color: index === 0 ? CHART_COLORS.pink : CHART_COLORS.primary },
      })),
    }],
  };

  // 年龄分布柱状图
  const ageOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}<br/>${params[0].value}%`,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: currentData['年龄分布'].map(d => d.label),
      axisLabel: { color: '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 12, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    series: [{
      name: '占比',
      type: 'bar',
      data: currentData['年龄分布'].map(d => d.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#8b5cf6' },
          { offset: 1, color: '#3b82f6' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '50%',
    }],
  };

  // 城市级别柱状图
  const cityLevelOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}<br/>${params[0].value}%`,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: currentData['城市级别'].map(d => d.label),
      axisLabel: { color: '#9ca3af', fontSize: 11, rotate: 15 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 12, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    series: [{
      name: '占比',
      type: 'bar',
      data: currentData['城市级别'].map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6'][i],
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barWidth: '50%',
    }],
  };

  // 八大人群雷达图
  const crowdOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
    },
    radar: {
      indicator: currentData['八大人群分布'].map(d => ({
        name: d.label,
        max: 35,
      })),
      center: ['50%', '55%'],
      radius: '65%',
      axisName: {
        color: '#9ca3af',
        fontSize: 11,
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.25)', 'rgba(59, 130, 246, 0.3)'],
        },
      },
      axisLine: {
        lineStyle: { color: '#374151' },
      },
      splitLine: {
        lineStyle: { color: '#374151' },
      },
    },
    series: [{
      name: '人群分布',
      type: 'radar',
      data: [{
        value: currentData['八大人群分布'].map(d => d.value),
        name: '占比',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#3b82f6',
          width: 2,
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.8)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.2)' },
          ]),
        },
        itemStyle: {
          color: '#3b82f6',
        },
      }],
    }],
  };

  // 省份TOP10横向柱状图
  const provinceOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}: ${params[0].value}%`,
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: currentData['省份分布'].map(d => d.label).reverse(),
      axisLabel: { color: '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      name: '占比',
      type: 'bar',
      data: currentData['省份分布'].map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: i < 3 ? '#f59e0b' : i < 5 ? '#3b82f6' : '#6366f1',
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#9ca3af',
        fontSize: 11,
      },
    }],
  };

  // 城市TOP10横向柱状图
  const cityOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}: ${params[0].value}%`,
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: currentData['城市分布'].map(d => d.label).reverse(),
      axisLabel: { color: '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      name: '占比',
      type: 'bar',
      data: currentData['城市分布'].map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: i < 3 ? '#ef4444' : i < 5 ? '#f97316' : '#22c55e',
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#9ca3af',
        fontSize: 11,
      },
    }],
  };

  // 商品价格偏好条形图
  const priceOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}: ${params[0].value}%`,
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: currentData['商品价格偏好'].map(d => `${d.label}元`).reverse(),
      axisLabel: { color: '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      name: '占比',
      type: 'bar',
      data: currentData['商品价格偏好'].map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ec4899' },
            { offset: 1, color: '#f43f5e' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#9ca3af',
        fontSize: 11,
      },
    }],
  };

  // 商品类型偏好
  const productOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => `${params[0].name}: ${params[0].value}%`,
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: currentData['商品类型偏好'].map(d => d.label).reverse(),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      name: '偏好指数',
      type: 'bar',
      data: currentData['商品类型偏好'].map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: ['#06b6d4', '#14b8a6', '#10b981'][i] || '#6366f1',
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      barWidth: '50%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#9ca3af',
        fontSize: 11,
      },
    }],
  };

  // 中国地图 - 粉丝地域分布
  const mapOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.value) {
          return `<div style="padding: 8px;">
            <p style="font-weight: bold; margin-bottom: 4px;">${params.name}</p>
            <p>占比: ${params.value}%</p>
          </div>`;
        }
        return params.name;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(...currentData['省份分布'].map(d => d.value)),
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      textStyle: { color: '#9ca3af' },
      inRange: {
        color: ['#3b82f6', '#8b5cf6', '#ec4899'],
      },
      calculable: true,
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      center: [104, 36],
      scaleLimit: { min: 0.5, max: 5 },
      label: {
        show: false,
        color: '#fff',
        fontSize: 10,
      },
      emphasis: {
        label: {
          show: true,
          color: '#fff',
        },
        itemStyle: {
          areaColor: '#f59e0b',
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      itemStyle: {
        areaColor: '#374151',
        borderColor: '#1f2937',
        borderWidth: 1,
      },
    },
    series: [{
      name: '粉丝占比',
      type: 'map',
      map: 'china',
      geoIndex: 0,
      data: currentData['省份分布'].map(d => ({
        name: d.label,
        value: d.value,
      })),
    }],
  };

  // 获取关键数据摘要
  const getSummary = () => {
    const femalePercent = currentData['性别分布'].find(d => d.label === '女性')?.value || 0;
    const topAge = currentData['年龄分布'][0];
    const topProvince = currentData['省份分布'][0];
    const topCrowd = currentData['八大人群分布'][0];
    const topCityLevel = currentData['城市级别'][0];
    return { femalePercent, topAge, topProvince, topCrowd, topCityLevel };
  };

  const summary = getSummary();

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">👥 粉丝画像</h1>
        <p className="text-gray-600 mb-6">深入了解粉丝的性别、年龄、地域与消费偏好</p>

        {/* 账号切换标签 */}
        <div className="flex gap-2 mb-6">
          {ACCOUNTS.map((account) => (
            <Button
              key={account.key}
              variant={activeAccount === account.key ? 'default' : 'outline'}
              onClick={() => setActiveAccount(account.key)}
              className={activeAccount === account.key ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {account.label}
            </Button>
          ))}
        </div>

        {/* 核心指标卡片 */}
        <StaggerContainer className="grid gap-4 md:grid-cols-5 mb-8">
          <StaggerItem>
            <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">女性占比</div>
                <div className="text-2xl font-bold mt-2">{summary.femalePercent.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">主力年龄段</div>
                <div className="text-2xl font-bold mt-2">{summary.topAge.label}岁</div>
                <div className="text-xs opacity-70 mt-1">占比 {summary.topAge.value}%</div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">粉丝最多省份</div>
                <div className="text-2xl font-bold mt-2">{summary.topProvince.label}</div>
                <div className="text-xs opacity-70 mt-1">占比 {summary.topProvince.value}%</div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">主要人群</div>
                <div className="text-2xl font-bold mt-2">{summary.topCrowd.label}</div>
                <div className="text-xs opacity-70 mt-1">占比 {summary.topCrowd.value}%</div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="text-sm opacity-80">城市分布</div>
                <div className="text-2xl font-bold mt-2">{summary.topCityLevel.label}</div>
                <div className="text-xs opacity-70 mt-1">占比 {summary.topCityLevel.value}%</div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* 第一行：性别、年龄、城市级别 */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">👩</span>
                  性别分布
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(genderChartRef, `gender-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={genderChartRef} option={genderOption} style={{ height: 280 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🎂</span>
                  年龄分布
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(ageChartRef, `age-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={ageChartRef} option={ageOption} style={{ height: 280 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🏙️</span>
                  城市级别
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(cityLevelChartRef, `city-level-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={cityLevelChartRef} option={cityLevelOption} style={{ height: 280 }} />
            </CardContent>
          </Card>
        </div>

        {/* 第二行：八大人群雷达图 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                八大人群分布
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(crowdChartRef, `crowd-${activeAccount}`)}>
                导出PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReactECharts ref={crowdChartRef} option={crowdOption} style={{ height: 400 }} />
          </CardContent>
        </Card>

        {/* 第三行：省份和城市TOP10 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  省份 TOP 10
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(provinceChartRef, `province-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={provinceChartRef} option={provinceOption} style={{ height: 350 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  城市 TOP 10
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(cityChartRef, `city-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={cityChartRef} option={cityOption} style={{ height: 350 }} />
            </CardContent>
          </Card>
        </div>

        {/* 中国地图 - 粉丝地域分布 */}
        {mapLoaded && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🇨🇳</span>
                  粉丝地域分布地图
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(mapChartRef, `map-${activeAccount}`)}>
                  导出PNG
                </Button>
              </div>
              <p className="text-sm text-gray-600">支持缩放和拖拽查看，颜色深浅代表粉丝占比</p>
            </CardHeader>
            <CardContent>
              <ReactECharts
                ref={mapChartRef}
                option={mapOption}
                style={{ height: 500 }}
                opts={{ renderer: 'canvas' }}
              />
            </CardContent>
          </Card>
        )}

        {/* 第四行：消费偏好 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  商品价格偏好
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(priceChartRef, `price-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={priceChartRef} option={priceOption} style={{ height: 300 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  商品类型偏好
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportChartAsPNG(productChartRef, `product-${activeAccount}`)}>
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReactECharts ref={productChartRef} option={productOption} style={{ height: 300 }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
