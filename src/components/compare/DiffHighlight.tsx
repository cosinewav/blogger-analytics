'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DiffItem {
  label: string;
  baseValue: number;
  compareValue: number;
  unit?: string;
}

interface DiffHighlightProps {
  title: string;
  data: DiffItem[];
  baseAccount: string;
  compareAccount: string;
  icon?: React.ReactNode;
}

export function DiffHighlight({
  title,
  data,
  baseAccount,
  compareAccount,
  icon,
}: DiffHighlightProps) {
  const calculateDiff = (base: number, compare: number) => {
    if (base === 0) return { diff: 0, percent: 0 };
    const diff = compare - base;
    const percent = (diff / base) * 100;
    return { diff, percent };
  };

  const getDiffColor = (percent: number) => {
    if (percent > 0) return 'text-green-500';
    if (percent < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getDiffIcon = (percent: number) => {
    if (percent > 0) return <TrendingUp className="w-4 h-4" />;
    if (percent < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getBgColor = (percent: number) => {
    if (percent > 5) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percent < -5) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            {baseAccount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500"></span>
            {compareAccount}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const { diff, percent } = calculateDiff(item.baseValue, item.compareValue);
            const absPercent = Math.abs(percent);

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getBgColor(percent)} transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.label}</span>
                  <div className={`flex items-center gap-1 ${getDiffColor(percent)}`}>
                    {getDiffIcon(percent)}
                    <span className="font-semibold">
                      {percent > 0 ? '+' : ''}{percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{baseAccount}:</span>
                    <span className="font-medium text-blue-600">
                      {item.baseValue.toFixed(1)}{item.unit || '%'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{compareAccount}:</span>
                    <span className="font-medium text-purple-600">
                      {item.compareValue.toFixed(1)}{item.unit || '%'}
                    </span>
                  </div>
                </div>
                {absPercent > 0 && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percent > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(absPercent * 2, 100)}%`,
                          marginLeft: percent > 0 ? '50%' : 'auto',
                          marginRight: percent < 0 ? '50%' : 'auto',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// 简化版差异显示组件
export function DiffBadge({ value1, value2, unit = '%' }: { value1: number; value2: number; unit?: string }) {
  if (value1 === 0 && value2 === 0) return null;

  const diff = value2 - value1;
  const percent = value1 !== 0 ? (diff / value1) * 100 : 0;

  if (Math.abs(percent) < 0.5) {
    return <span className="text-gray-400 text-xs">≈</span>;
  }

  return (
    <span className={`text-xs font-medium ${percent > 0 ? 'text-green-500' : 'text-red-500'}`}>
      {percent > 0 ? '+' : ''}{percent.toFixed(1)}%
    </span>
  );
}
