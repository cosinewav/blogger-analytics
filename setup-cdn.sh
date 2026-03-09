#!/bin/bash

# 配置阿里云 CDN 加速 OSS 静态网站
# 需要替换为你的域名

OSS_BUCKET="blogger-analytics"
OSS_REGION="oss-cn-hangzhou"
CDN_DOMAIN="analytics.floater.club"  # 替换为你的域名

# CDN 会加速域名（如阿里云 CDN）
# 或者使用自定义域名（需要在阿里云控制台配置 CNAME）

# 静态网站托管 endpoint
OSS_WEBSITE_ENDPOINT="blogger-analytics.oss-cn-hangzhou.aliyuncs.com"

# 或者使用 CDN 加速域名
# CDN_DOMAIN="your-cdn-domain.cdn.example.com"
# CDN_ENDPOINT="your-cdn-domain.cdn.example.com"

echo "=== 开始配置 CDN ==="

# 检查 ossutil 是否已安装
if ! command -v ossutil &> /
    echo "正在安装 ossutil..."
    pip install ossutil
fi

