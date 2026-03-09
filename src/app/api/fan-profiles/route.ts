import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'fan-profiles.json');

    // Check if file exists before reading
    if (!fs.existsSync(dataPath)) {
      console.warn('粉丝画像数据文件不存在:', dataPath);
      const emptyResponse = NextResponse.json([]);
      emptyResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return emptyResponse;
    }

    const data = fs.readFileSync(dataPath, 'utf-8');
    const profiles = JSON.parse(data);

    const response = NextResponse.json(profiles);
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取粉丝画像数据失败:', error);
    // Return empty array instead of error for better UX
    const emptyResponse = NextResponse.json([]);
    emptyResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return emptyResponse;
  }
}
