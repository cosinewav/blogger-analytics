'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Check } from 'lucide-react';

interface Account {
  key: string;
  label: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccounts: string[];
  onSelectionChange: (selected: string[]) => void;
  maxSelection?: number;
}

export function AccountSelector({
  accounts,
  selectedAccounts,
  onSelectionChange,
  maxSelection = 3,
}: AccountSelectorProps) {
  const handleToggle = (accountKey: string) => {
    if (selectedAccounts.includes(accountKey)) {
      onSelectionChange(selectedAccounts.filter(k => k !== accountKey));
    } else if (selectedAccounts.length < maxSelection) {
      onSelectionChange([...selectedAccounts, accountKey]);
    }
  };

  const handleSelectAll = () => {
    const allKeys = accounts.slice(0, maxSelection).map(a => a.key);
    onSelectionChange(allKeys);
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            选择对比账号
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedAccounts.length >= maxSelection}
            >
              全选
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={selectedAccounts.length === 0}
            >
              清除
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          最多选择 {maxSelection} 个账号进行对比分析
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {accounts.map(account => {
            const isSelected = selectedAccounts.includes(account.key);
            const isDisabled = !isSelected && selectedAccounts.length >= maxSelection;

            return (
              <div
                key={account.key}
                onClick={() => !isDisabled && handleToggle(account.key)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => handleToggle(account.key)}
                />
                <span className={`font-medium ${isSelected ? 'text-blue-600' : ''}`}>
                  {account.label}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            );
          })}
        </div>

        {selectedAccounts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">已选择：</span>
              {selectedAccounts.map(key => {
                const account = accounts.find(a => a.key === key);
                return (
                  <Badge key={key} variant="secondary" className="bg-blue-100 text-blue-700">
                    {account?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
