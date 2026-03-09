/**
 * 飞书粉丝画像数据同步脚本
 * 从飞书多维表格获取粉丝画像数据并保存为本地 JSON
 */

import fs from 'fs';
import path from 'path';

const APP_TOKEN = 'MteFb60MZappLQsg2zBckptlnYe';
const TABLE_ID = 'tbl9wFUg6m2H0wRl';

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID || 'cli_a75c2e5c6f39900b',
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  });
  const data = await response.json();
  return data.tenant_access_token;
}

async function fetchAllRecords(accessToken: string) {
  const records: any[] = [];
  let hasMore = true;
  let pageToken: string | undefined;

  while (hasMore) {
    const url = new URL(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`
    );
    
    if (pageToken) {
      url.searchParams.set('page_token', pageToken);
    }
    url.searchParams.set('page_size', '500');

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`API 错误: ${data.msg}`);
    }

    records.push(...data.data.items);
    hasMore = data.data.has_more;
    pageToken = data.data.page_token;
  }

  return records;
}

function transformData(records: any[]) {
  const profiles: Record<string, Record<string, { label: string; value: number }[]>> = {};

  for (const record of records) {
    const fields = record.fields;
    
    // 解析字段值（飞书返回的是数组）
    const accountName = Array.isArray(fields['账号名称']) ? fields['账号名称'][0]?.text : fields['账号名称'];
    const labelType = Array.isArray(fields['标签类型']) ? fields['标签类型'][0]?.text : fields['标签类型'];
    const labelValue = Array.isArray(fields['标签值']) ? fields['标签值'][0]?.text : fields['标签值'];
    const percentage = fields['百分比'];

    if (!accountName || !labelType || !labelValue) continue;

    // 初始化账号
    if (!profiles[accountName]) {
      profiles[accountName] = {};
    }

    // 初始化标签类型
    if (!profiles[accountName][labelType]) {
      profiles[accountName][labelType] = [];
    }

    profiles[accountName][labelType].push({
      label: labelValue,
      value: percentage,
    });
  }

  return profiles;
}

async function main() {
  console.log('🔄 开始同步粉丝画像数据...\n');

  const accessToken = await getAccessToken();
  console.log('✅ 获取 access_token 成功');

  const records = await fetchAllRecords(accessToken);
  console.log(`✅ 获取 ${records.length} 条记录`);

  const profiles = transformData(records);
  console.log(`✅ 转换完成，包含 ${Object.keys(profiles).length} 个账号`);

  // 保存为 JSON
  const outputPath = path.join(process.cwd(), 'data', 'fan-profiles.json');
  fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2), 'utf-8');
  console.log(`\n🎉 数据已保存到: ${outputPath}`);
}

main().catch(console.error);
