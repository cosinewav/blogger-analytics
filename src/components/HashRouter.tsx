'use client';

import { useState, useEffect, useCallback } from 'react';

export function useHashRouter() {
  const [hash, setHash] = useState('');

  useEffect(() => {
    // 获取初始 hash
    const initialHash = window.location.hash.slice(1) || '/trends';
    setHash(initialHash);

    // 监听 hash 变化
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) || '/trends';
      setHash(newHash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { hash, navigate };
}
