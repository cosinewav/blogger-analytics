import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'fan-profiles.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const profiles = JSON.parse(data);

    const response = NextResponse.json(profiles);
    // Cache for 5 minutes on client, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('获取粉丝画像数据失败:', error);
    return NextResponse.json({ error: '获取粉丝画像数据失败' }, { status: 500 });
  }
}
