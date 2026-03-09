import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 视频数据导出类型
export interface VideoExportData {
  标题: string;
  作者: string;
  发布时间: string;
  播放量: number;
  点赞: number;
  评论: number;
  分享: number;
  收藏: number;
  互动率: string;
  传播指数: number;
  传播等级: string;
  关键词: string;
  抖音链接: string;
}

// 导出为 CSV
export function exportToCSV(data: VideoExportData[], filename: string): void {
  if (data.length === 0) {
    alert('没有数据可导出');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header as keyof VideoExportData];
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 添加 BOM 以支持中文
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

// 导出为 Excel
export function exportToExcel(data: VideoExportData[], filename: string): void {
  if (data.length === 0) {
    alert('没有数据可导出');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '视频数据');

  // 自动调整列宽
  const maxWidth = 50;
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof VideoExportData]).length)))
  }));
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

// 导出为 PNG (通过 ECharts 实例)
export function exportChartToPNG(chartInstance: any, filename: string): void {
  if (!chartInstance) {
    console.error('图表实例不存在');
    return;
  }

  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#1f2937',
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = url;
  link.click();
}

// 格式化视频数据用于导出
export function formatVideoForExport(video: any): VideoExportData {
  return {
    标题: video.title || '',
    作者: Array.isArray(video.author) ? video.author.join(', ') : (video.author || ''),
    发布时间: video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('zh-CN') : '',
    播放量: video.playCount || 0,
    点赞: video.likes || 0,
    评论: video.comments || 0,
    分享: typeof video.shares === 'string' ? parseInt(video.shares) || 0 : (video.shares || 0),
    收藏: video.favorites || 0,
    互动率: video.engagementRate || '0%',
    传播指数: video.spreadIndex || 0,
    传播等级: video.spreadLevel || '',
    关键词: Array.isArray(video.keywords) ? video.keywords.join('; ') : '',
    抖音链接: video.douyinUrl || '',
  };
}

// 生成带时间戳的文件名
export function generateFilename(prefix: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}_${timestamp}`;
}
