import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'fan-profiles.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const profiles = JSON.parse(data);

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('获取粉丝画像数据失败:', error);
    return NextResponse.json({ error: '获取粉丝画像数据失败' }, { status: 500 });
  }
}
