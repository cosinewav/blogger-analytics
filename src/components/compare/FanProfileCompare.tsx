'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface FanProfileCompareProps {
  title: string;
  icon?: React.ReactNode;
  profileKey: keyof AccountProfile;
  accounts: { key: string; label: string }[];
  profilesData: Record<string, AccountProfile>;
  selectedAccounts: string[];
  unit?: string;
}

const ACCOUNT_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500'];

export function FanProfileCompare({
  title,
  icon,
  profileKey,
  accounts,
  profilesData,
  selectedAccounts,
  unit = '%',
}: FanProfileCompareProps) {
  const getAccountData = (accountKey: string): ProfileItem[] => {
    return profilesData[accountKey]?.[profileKey] || [];
  };

  const getAllLabels = (): string[] => {
    const labels = new Set<string>();
    selectedAccounts.forEach(accountKey => {
      getAccountData(accountKey).forEach(item => labels.add(item.label));
    });
    return Array.from(labels);
  };

  const getValue = (accountKey: string, label: string): number => {
    const data = getAccountData(accountKey);
    return data.find(item => item.label === label)?.value || 0;
  };

  const labels = getAllLabels();
  const selectedAccountObjs = accounts.filter(a => selectedAccounts.includes(a.key));

  if (selectedAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            请先选择要对比的账号
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <div className="flex gap-3 mt-2">
          {selectedAccountObjs.map((account, index) => (
            <Badge
              key={account.key}
              variant="outline"
              className="flex items-center gap-1"
            >
              <span className={`w-2 h-2 rounded-full ${ACCOUNT_COLORS[index]}`}></span>
              {account.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {labels.map(label => {
            const values = selectedAccounts.map(key => getValue(key, label));
            const maxValue = Math.max(...values);
            const hasDiff = new Set(values).size > 1;

            return (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{label}</span>
                  {hasDiff && (
                    <span className="text-xs text-gray-500">
                      差异: {(maxValue - Math.min(...values)).toFixed(1)}{unit}
                    </span>
                  )}
                </div>

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedAccounts.length}, 1fr)` }}>
                  {selectedAccounts.map((accountKey, index) => {
                    const value = getValue(accountKey, label);
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const isHighest = value === maxValue && maxValue > 0;

                    return (
                      <div key={accountKey} className="relative">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 truncate pr-2">
                            {selectedAccountObjs[index]?.label}
                          </span>
                          <span className={`font-semibold ${isHighest ? 'text-blue-600' : ''}`}>
                            {value.toFixed(1)}{unit}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${ACCOUNT_COLORS[index]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// 侧边对比卡片组件
export function FanProfileSideCard({
  accountName,
  profileKey,
  profilesData,
  colorClass = 'bg-blue-500',
  icon,
}: {
  accountName: string;
  profileKey: keyof AccountProfile;
  profilesData: Record<string, AccountProfile>;
  colorClass?: string;
  icon?: React.ReactNode;
}) {
  const data = profilesData[accountName]?.[profileKey] || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          <Badge variant="outline" className={`flex items-center gap-1`}>
            <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
            {accountName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-semibold text-sm">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
