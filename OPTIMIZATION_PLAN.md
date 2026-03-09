# 博主数据分析看板优化计划

## 目标
打造世界上最牛逼的抖音博主数据分析看板系统

## 参考项目（GitHub 搜索结果）
1. **InPactAI** (85⭐) - AI-powered platform for creators
2. **ai-trading-agent-gemini** (209⭐) - Social media sentiment analysis with Gemini AI
3. **Social-Media-Dashboard** (7⭐) - Next.js analytics dashboard
4. **TikTok_Analytics** - Python + Streamlit TikTok analytics

## 当前项目状态
- 位置: `/Users/liuxiaoyu/.openclaw/workspace-default/analytics-web`
- 技术栈: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- 数据: 1,459 条视频记录 (6.7MB JSON)

## 优化任务清单

### 🔴 P0 - 核心体验（必须完成）

#### Task 1: 图表交互优化
- [ ] 折线图支持缩放、拖拽
- [ ] 支持 Legend 点击切换数据系列
- [ ] 图表支持导出 PNG/SVG
- [ ] 添加数据点悬停放大效果
- [ ] 支持多图表联动（brush 选择）

#### Task 2: 数据筛选增强
- [ ] 添加时间范围选择器（DateRangePicker）
- [ ] 支持关键词多选筛选
- [ ] 添加高级筛选面板（播放量、点赞、评论范围）
- [ ] 筛选条件持久化（URL 参数）

#### Task 3: AI 分析功能（智谱 API）
- [ ] 接入智谱 GLM-4 API
- [ ] 视频内容智能分析
- [ ] 关键词智能推荐
- [ ] 内容策略建议生成
- [ ] 自然语言查询数据

### 🟡 P1 - 功能增强

#### Task 4: 数据可视化升级
- [ ] 添加热力图（发布时间 vs 播放量）
- [ ] 添加雷达图（内容质量多维度评估）
- [ ] 添加漏斗图（内容转化漏斗）
- [ ] 添加词云图（关键词可视化）
- [ ] 添加桑基图（关键词关联分析）

#### Task 5: 对比分析功能
- [ ] 时间段对比（本周 vs 上周）
- [ ] 关键词对比分析
- [ ] 视频对比（选择 2 个视频对比）
- [ ] 行业基准对比

#### Task 6: 数据导出与报告
- [ ] 导出 Excel 报告
- [ ] 导出 PDF 分析报告
- [ ] 自动生成周报/月报
- [ ] 分享链接功能

### 🟢 P2 - 进阶功能

#### Task 7: 实时数据同步
- [ ] 定时同步飞书数据
- [ ] 数据变更通知
- [ ] 增量更新机制

#### Task 8: 个性化设置
- [ ] 自定义 KPI 卡片
- [ ] 自定义图表布局
- [ ] 主题切换（多主题支持）
- [ ] 数据预警设置

## 技术改进

### UI/UX
- 使用 Framer Motion 添加动画效果
- 使用 TanStack Table 替代原生表格
- 使用 ECharts/Tremor 替代 Recharts（更好的交互）
- 添加骨架屏加载效果

### 性能优化
- 虚拟滚动（大数据量）
- 图表数据采样（展示优化）
- Web Worker 计算
- Service Worker 缓存

### 数据分析
- 接入智谱 GLM-4 API
- TF-IDF 关键词提取
- 内容聚类分析
- 预测模型（播放量预测）

## 执行计划

### 第一阶段（今晚 00:00-03:00）- 核心优化
1. **Claude Code 1**: 图表交互优化（Task 1）
2. **Claude Code 2**: 数据筛选增强（Task 2）
3. **Claude Code 3**: UI/UX 升级（动画、骨架屏）

### 第二阶段（03:00-06:00）- 功能增强
4. **Claude Code 4**: 数据可视化升级（Task 4）
5. **Claude Code 5**: 对比分析功能（Task 5）
6. **Claude Code 6**: 数据导出功能（Task 6）

### 第三阶段（06:00-08:00）- AI 与进阶
7. **Claude Code 7**: 智谱 API 集成（Task 3）
8. **Claude Code 8**: 性能优化与测试

## Claude Code 启动命令

```bash
# Task 1: 图表交互
claude --permission-mode bypassPermissions --print "
任务：优化图表交互体验

位置: /Users/liuxiaoyu/.openclaw/workspace-default/analytics-web

要求：
1. 将 Recharts 替换为更强大的图表库（推荐 Tremor 或 ECharts）
2. 添加图表缩放、拖拽功能
3. 支持 Legend 点击切换数据系列
4. 添加图表导出 PNG 功能
5. 优化悬停效果

参考文件：
- src/app/trends/page.tsx（趋势页面）
- src/app/keywords/page.tsx（关键词页面）

完成标准：
- 折线图支持缩放
- 可以导出图表
- 交互流畅自然
"

# Task 2: 数据筛选
claude --permission-mode bypassPermissions --print "
任务：增强数据筛选功能

位置: /Users/liuxiaoyu/.openclaw/workspace-default/analytics-web

要求：
1. 添加 DateRangePicker（时间范围选择）
2. 支持关键词多选筛选
3. 高级筛选面板可折叠
4. 筛选条件持久化到 URL

参考文件：
- src/app/videos/page.tsx（视频列表页）

完成标准：
- 可选择时间范围
- 多关键词筛选
- URL 分享筛选结果
"
```

## 监控与协调
- 每 30 分钟检查各任务进度
- 遇到阻塞及时协调
- 保持代码风格一致
- 定期 commit 和 push
