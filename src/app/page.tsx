'use client';

import { useEffect, useState } from 'react';
import { useHashRouter } from '@/components/HashRouter';
import TrendsPage from './trends/page';
import ProfilesPage from './profiles/page';
import KeywordsPage from './keywords/page';
import VideosPage from './videos/page';
import ComparePage from './compare/page';

export default function Home() {
  const { hash, navigate } = useHashRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 默认跳转到 trends
    if (!window.location.hash) {
      navigate('/trends');
    }
  }, [navigate]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">正在加载数据分析平台...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (hash) {
      case '/trends':
      case '':
        return <TrendsPage />;
      case '/profiles':
        return <ProfilesPage />;
      case '/keywords':
        return <KeywordsPage />;
      case '/videos':
        return <VideosPage />;
      case '/compare':
        return <ComparePage />;
      default:
        return <TrendsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="border-b bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <a className="text-xl font-bold cursor-pointer" onClick={() => navigate('/trends')}>
                📊 数据分析平台
              </a>
              <div className="flex gap-1">
                <a
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hash === '/' || hash === '/trends'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => navigate('/trends')}
                >
                  📈 趋势分析
                </a>
                <a
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hash === '/videos'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => navigate('/videos')}
                >
                  🎬 内容列表
                </a>
                <a
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hash === '/keywords'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => navigate('/keywords')}
                >
                  🏷️ 关键词分析
                </a>
                <a
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hash === '/profiles'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => navigate('/profiles')}
                >
                  👥 粉丝画像
                </a>
                <a
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hash === '/compare'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => navigate('/compare')}
                >
                  📊 对比分析
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
