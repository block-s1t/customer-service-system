#!/bin/bash

# 停止pm2 customer-service-system
pm2 stop @customer-service-system

# 删除dist文件夹
rm -rf dist

# build
pnpm run build

# 设置dist文件夹权限
chown -R www:www dist
chmod -R 755 dist

# 重启pm2 customer-service-system
pm2 restart @customer-service-system

pm2 save --force

# 输出执行结果
echo "[@customer-service-system] 已经完成所有更新操作，项目已经启动。"
