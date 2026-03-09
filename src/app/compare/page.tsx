'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import {
  AccountSelector,
  ComparisonChart,
  FanProfileCompare,
  DiffHighlight,
} from '@/components/compare';
import {
  Users,
  CircleUser,
  Calendar,
  MapPin,
  Building,
  Target,
  ShoppingBag,
  DollarSign,
  Download,
  TrendingUp,
  TrendingDown,
  GitCompare,
} from 'lucide-react';

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

const ACCOUNT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];

export default function ComparePage() {
  const [profilesData, setProfilesData] = useState<ProfilesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['哈佛亮爸', '哈佛亮爸英语信息差']);

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

  const transformDataForChart = (
    profileKey: keyof AccountProfile,
    accounts: string[]
  ) => {
    if (!profilesData) return [];

    const allLabels = new Set<string>();
    accounts.forEach(accountKey => {
      const data = profilesData[accountKey]?.[profileKey] || [];
      data.forEach(item => allLabels.add(item.label));
    });

    return Array.from(allLabels).map(label => {
      const values: Record<string, number> = {};
      accounts.forEach(accountKey => {
        const data = profilesData[accountKey]?.[profileKey] || [];
        const item = data.find(d => d.label === label);
        values[accountKey] = item?.value || 0;
      });
      return { label, values };
    });
  };

  const getDiffData = (
    profileKey: keyof AccountProfile,
    baseAccount: string,
    compareAccount: string
  ) => {
    if (!profilesData) return [];

    const baseData = profilesData[baseAccount]?.[profileKey] || [];
    const compareData = profilesData[compareAccount]?.[profileKey] || [];

    return baseData.slice(0, 5).map(item => {
      const compareItem = compareData.find(d => d.label === item.label);
      return {
        label: item.label,
        baseValue: item.value,
        compareValue: compareItem?.value || 0,
        unit: '%',
      };
    });
  };

  const selectedAccountObjs = ACCOUNTS.filter(a => selectedAccounts.includes(a.key));

  // 雷达图配置 - 八大人群对比
  const radarOption: echarts.EChartsOption = useMemo(() => {
    if (selectedAccounts.length < 2 || !profilesData) return {};

    const indicators = profilesData[selectedAccounts[0]]?.['八大人群分布'].map(d => ({
      name: d.label,
      max: 35,
    })) || [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: selectedAccountObjs.map(a => a.label),
        bottom: 0,
        textStyle: { color: '#9ca3af' },
      },
      radar: {
        indicator: indicators,
        center: ['50%', '50%'],
        radius: '65%',
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
        data: selectedAccounts.map((accountKey, index) => ({
          value: profilesData[accountKey]?.['八大人群分布'].map(d => d.value) || [],
          name: ACCOUNTS.find(a => a.key === accountKey)?.label,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: ACCOUNT_COLORS[index], width: 2 },
          areaStyle: { color: `${ACCOUNT_COLORS[index]}40` },
          itemStyle: { color: ACCOUNT_COLORS[index] },
        })),
      }],
    };
  }, [selectedAccounts, profilesData, selectedAccountObjs]);

  // 对比摘要数据
  const summaryData = useMemo(() => {
    if (!profilesData || selectedAccounts.length < 2) return null;

    const base = profilesData[selectedAccounts[0]];
    const compare = profilesData[selectedAccounts[1]];

    if (!base || !compare) return null;

    const femaleBase = Number(base['性别分布'].find(d => d.label === '女性')?.value || 0);
    const femaleCompare = Number(compare['性别分布'].find(d => d.label === '女性')?.value || 0);

    const topAgeBase = base['年龄分布'][0];
    const topAgeCompare = compare['年龄分布'][0];

    const topProvinceBase = base['省份分布'][0];
    const topProvinceCompare = compare['省份分布'][0];

    const topCrowdBase = base['八大人群分布'][0];
    const topCrowdCompare = compare['八大人群分布'][0];

    return {
      female: { base: femaleBase, compare: femaleCompare },
      topAge: { base: topAgeBase, compare: topAgeCompare },
      topProvince: { base: topProvinceBase, compare: topProvinceCompare },
      topCrowd: { base: topCrowdBase, compare: topCrowdCompare },
    };
  }, [selectedAccounts, profilesData]);

  if (loading || !profilesData) {
    return <PageSkeleton />;
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-2">📊 账号对比分析</h1>
          <p className="text-gray-600 mb-6">多维度对比不同账号的粉丝画像差异</p>
        </FadeIn>

        {/* 账号选择器 */}
        <div className="mb-6">
          <AccountSelector
            accounts={ACCOUNTS}
            selectedAccounts={selectedAccounts}
            onSelectionChange={setSelectedAccounts}
            maxSelection={3}
          />
        </div>

        {selectedAccounts.length < 2 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GitCompare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">请至少选择2个账号进行对比</h3>
              <p className="text-gray-500">选择账号后，将显示详细的对比分析数据</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 核心指标对比卡片 */}
            {summaryData && (
              <StaggerContainer className="grid gap-4 md:grid-cols-4 mb-6">
                <StaggerItem>
                  <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CircleUser className="w-5 h-5 text-pink-500" />
                        <span className="text-sm text-gray-600">女性占比对比</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{(summaryData.female?.base || 0).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">{selectedAccountObjs[0]?.label}</div>
                        </div>
                        <div className="text-gray-400 pb-1">vs</div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{(summaryData.female?.compare || 0).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">{selectedAccountObjs[1]?.label}</div>
                        </div>
                        <div className={`ml-auto flex items-center gap-1 text-sm ${
                          (summaryData.female?.compare || 0) > (summaryData.female?.base || 0) ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {(summaryData.female?.compare || 0) > (summaryData.female?.base || 0) ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Math.abs((summaryData.female?.compare || 0) - (summaryData.female?.base || 0)).toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-600">主力年龄段</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{summaryData.topAge.base.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topAge.base.value}%</div>
                        </div>
                        <div className="text-gray-400 pb-1">vs</div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{summaryData.topAge.compare.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topAge.compare.value}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-600">粉丝最多省份</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{summaryData.topProvince.base.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topProvince.base.value}%</div>
                        </div>
                        <div className="text-gray-400 pb-1">vs</div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{summaryData.topProvince.compare.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topProvince.compare.value}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem>
                  <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-600">主要人群</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{summaryData.topCrowd.base.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topCrowd.base.value}%</div>
                        </div>
                        <div className="text-gray-400 pb-1">vs</div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{summaryData.topCrowd.compare.label}</div>
                          <div className="text-xs text-gray-500">{summaryData.topCrowd.compare.value}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            )}

            {/* 八大人群雷达图对比 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  八大人群分布对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReactECharts option={radarOption} style={{ height: 400 }} />
              </CardContent>
            </Card>

            {/* 图表对比行 */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <ComparisonChart
                title="年龄分布对比"
                icon={<Calendar className="w-5 h-5" />}
                data={transformDataForChart('年龄分布', selectedAccounts)}
                accounts={selectedAccountObjs}
                type="bar"
              />
              <ComparisonChart
                title="城市级别对比"
                icon={<Building className="w-5 h-5" />}
                data={transformDataForChart('城市级别', selectedAccounts)}
                accounts={selectedAccountObjs}
                type="bar"
              />
            </div>

            {/* 地域分布对比 */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <ComparisonChart
                title="省份 TOP 10 对比"
                icon={<MapPin className="w-5 h-5" />}
                data={transformDataForChart('省份分布', selectedAccounts).slice(0, 10)}
                accounts={selectedAccountObjs}
                type="bar"
              />
              <ComparisonChart
                title="城市 TOP 10 对比"
                icon={<Building className="w-5 h-5" />}
                data={transformDataForChart('城市分布', selectedAccounts).slice(0, 10)}
                accounts={selectedAccountObjs}
                type="bar"
              />
            </div>

            {/* 消费偏好对比 */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <ComparisonChart
                title="商品价格偏好对比"
                icon={<DollarSign className="w-5 h-5" />}
                data={transformDataForChart('商品价格偏好', selectedAccounts)}
                accounts={selectedAccountObjs}
                type="bar"
              />
              <ComparisonChart
                title="商品类型偏好对比"
                icon={<ShoppingBag className="w-5 h-5" />}
                data={transformDataForChart('商品类型偏好', selectedAccounts)}
                accounts={selectedAccountObjs}
                type="bar"
              />
            </div>

            {/* 差异高亮分析 */}
            {selectedAccounts.length >= 2 && (
              <div className="grid gap-6 md:grid-cols-2">
                <DiffHighlight
                  title="年龄分布差异"
                  icon={<Calendar className="w-5 h-5" />}
                  data={getDiffData('年龄分布', selectedAccounts[0], selectedAccounts[1])}
                  baseAccount={selectedAccountObjs[0]?.label || ''}
                  compareAccount={selectedAccountObjs[1]?.label || ''}
                />
                <DiffHighlight
                  title="城市级别差异"
                  icon={<Building className="w-5 h-5" />}
                  data={getDiffData('城市级别', selectedAccounts[0], selectedAccounts[1])}
                  baseAccount={selectedAccountObjs[0]?.label || ''}
                  compareAccount={selectedAccountObjs[1]?.label || ''}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
