#!/usr/bin/env python3
"""
阿里云 CDN 加速 OSS 静态网站配置指南

问题：
- OSS 静态网站托管不支持子目录自动查找 index.html
- http://blogger-analytics.oss-cn-hangzhou.aliyuncs.com/trends/ 无法访问
- 但 http://blogger-analytics.oss-cn-hangzhou.aliyuncs.com/trends/index.html 可以访问

解决方案：
1. 配置 CDN 加速域名
2. CDN 会正确处理子目录请求
3. 提供中国大陆快速访问

步骤：
1. 登录阿里云 CDN 控制台：https://cdn.console.aliyun.com
2. 添加域名：
   - 加速域名：你的域名（如 analytics.yourdomain.com）
   - 业务类型：CDN 图片小文件
   - 源站信息：OSS 域名
   - 源站地址：blogger-analytics.oss-cn-hangzhou.aliyuncs.com

3. 配置缓存策略：
   - HTML 文件：缓存 1 小时
   - JS/CSS：缓存 7 天
   - 图片：缓存 30 天

4. 配置 HTTPS（可选但推荐）：
   - 开启 HTTPS
   - 配置 SSL 证书

5. 等待部署完成（约 10-15 分钟）

6. 配置 CNAME 解析：
   - 在域名 DNS 添加 CNAME 记录
   - 指向 CDN 提供的 CNAME 地址

完成后访问：
- http://analytics.yourdomain.com/trends/
- https://analytics.yourdomain.com/trends/

优势：
✅ 中国大陆访问速度快
✅ 支持子目录自动查找 index.html
✅ 支持 HTTPS
✅ 成本低（CDN 流量费用很低）
"""

# 如果你已经有域名，请告诉我域名，我可以帮你生成详细的配置步骤
