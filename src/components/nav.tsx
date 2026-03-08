'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileVideo, Tag, TrendingUp } from 'lucide-react';

const navigation = [
  { name: '概览', href: '/', icon: LayoutDashboard },
  { name: '内容列表', href: '/videos', icon: FileVideo },
  { name: '关键词分析', href: '/keywords', icon: Tag },
  { name: '趋势分析', href: '/trends', icon: TrendingUp },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              📊 数据分析平台
            </Link>

            <div className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
