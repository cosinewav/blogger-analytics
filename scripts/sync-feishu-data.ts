/**
 * 飞书多维表格数据同步脚本
 * 
 * 功能：从飞书多维表格获取数据并保存为本地 JSON 文件
 * 用法：npx tsx scripts/sync-feishu-data.ts
 */

import fs from 'fs';
import path from 'path';

// 飞书 API 配置
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || 'cli_a75c2e5c6f39900b';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const APP_TOKEN = process.env.FEISHU_BITABLE_APP_TOKEN || 'MteFb60MZappLQsg2zBckptlnYe';
const TABLE_ID = process.env.FEISHU_BITABLE_TABLE_ID || 'tblqSd1j3rPt4v5c';

if (!FEISHU_APP_SECRET) {
  console.error('❌ 错误：请在 .env.local 中设置 FEISHU_APP_SECRET');
  process.exit(1);
}

// 获取飞书 access_token
async function getAccessToken(): Promise<string> {
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    }),
  });

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`获取 access_token 失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

// 获取多维表格记录
async function fetchRecords(accessToken: string, pageToken?: string): Promise<any> {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`;
  
  const params = new URLSearchParams({
    page_size: '500',
    ...(pageToken && { page_token: pageToken }),
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`获取记录失败: ${data.msg}`);
  }

  return data.data;
}

// 获取所有记录（分页）
async function getAllRecords(): Promise<any[]> {
  const accessToken = await getAccessToken();
  const allRecords: any[] = [];
  let pageToken: string | undefined;

  console.log('📥 开始获取飞书多维表格数据...');
  
  do {
    const result = await fetchRecords(accessToken, pageToken);
    allRecords.push(...result.items);
    pageToken = result.page_token;
    
    console.log(`✅ 已获取 ${allRecords.length} 条记录`);
  } while (pageToken);

  return allRecords;
}

// 转换记录格式
function transformRecord(record: any): VideoData {
  const fields = record.fields;
  
  return {
    id: record.record_id,
    title: fields['标题'] || '',
    author: fields['博主名称'] || [],
    publishedAt: fields['视频发布时间'] || null,
    douyinUrl: fields['抖音链接'] || '',
    videoUrl: fields['视频直链'] || '',
    duration: fields['视频时长'] || '',
    status: fields['视频获取状态'] || '',
    
    playCount: parseInt(fields['播放量']) || 0,
    likes: parseInt(fields['点赞']) || 0,
    comments: parseInt(fields['评论']) || 0,
    shares: fields['分享'] || '0',
    favorites: parseInt(fields['收藏']) || 0,
    engagementTotal: fields['互动量'] || '0',
    engagementRate: fields['互动率'] || '0%',
    
    spreadIndex: parseFloat(fields['传播指数']) || 0,
    spreadLevel: fields['传播等级'] || '',
    keywords: fields['关键词标签'] || [],
    
    content: fields['视频文案'] || '',
    summary: fields['文章总结'] || '',
    
    coverUrl: fields['封面链接'] || '',
    imageUrl: fields['图片链接'] || '',
    
    domain: fields['域名'] || '',
    recordYear: fields['记录年'] || '',
    recordMonth: fields['记录月'] || '',
    recordDay: fields['记录月日'] || '',
  };
}

// 保存数据到本地 JSON
function saveToFile(data: any[]) {
  const outputPath = path.join(process.cwd(), 'data', 'videos.json');
  
  // 创建 data 目录
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 数据已保存到 ${outputPath}`);
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始同步飞书多维表格数据\n');
    
    // 1. 获取所有记录
    const records = await getAllRecords();
    console.log(`\n✨ 共获取 ${records.length} 条记录\n`);
    
    // 2. 转换格式
    const videos = records.map(transformRecord);
    
    // 3. 保存到本地文件
    saveToFile(videos);
    
    // 4. 输出统计信息
    const stats = {
      totalVideos: videos.length,
      totalPlayCount: videos.reduce((sum, v) => sum + v.playCount, 0),
      avgPlayCount: 0,
      keywords: new Set(videos.flatMap(v => v.keywords)).size,
      dateRange: {
        earliest: videos.filter(v => v.publishedAt).sort((a, b) => 
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        )[0]?.publishedAt,
        latest: videos.filter(v => v.publishedAt).sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )[0]?.publishedAt,
      },
    };
    stats.avgPlayCount = Math.round(stats.totalPlayCount / stats.totalVideos);
    
    console.log('📊 数据统计:');
    console.log(`  - 总视频数: ${stats.totalVideos}`);
    console.log(`  - 总播放量: ${stats.totalPlayCount.toLocaleString()}`);
    console.log(`  - 平均播放量: ${stats.avgPlayCount.toLocaleString()}`);
    console.log(`  - 关键词数: ${stats.keywords}`);
    console.log(`  - 时间范围: ${stats.dateRange.earliest} ~ ${stats.dateRange.latest}`);
    
    console.log('\n✅ 同步完成！');
    
  } catch (error) {
    console.error('❌ 同步失败:', error);
    process.exit(1);
  }
}

// 数据类型定义
interface VideoData {
  id: string;
  title: string;
  author: string[];
  publishedAt: string | null;
  douyinUrl: string;
  videoUrl: string;
  duration: string;
  status: string;
  playCount: number;
  likes: number;
  comments: number;
  shares: string;
  favorites: number;
  engagementTotal: string;
  engagementRate: string;
  spreadIndex: number;
  spreadLevel: string;
  keywords: string[];
  content: string;
  summary: string;
  coverUrl: string;
  imageUrl: string;
  domain: string;
  recordYear: string;
  recordMonth: string;
  recordDay: string;
}

// 执行
main();
