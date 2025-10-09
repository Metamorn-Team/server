#!/bin/bash
set -e

APP_BASE="/home/ec2-user/app"
CURRENT_DIR="$APP_BASE/current"
TEMP_DIR="$APP_BASE/deploy-temp"
NEW_DIR="$APP_BASE/new_$(date +%s)"   # timestamp 기반 새 버전
BACKUP_DIR="$APP_BASE/backup"

echo "=== Deploy Hook Start ==="
echo "Temporary deploy dir: $TEMP_DIR"

# 1️⃣ 새 버전 이동
mv "$TEMP_DIR" "$NEW_DIR"

# 2️⃣ 의존성 설치
cd "$NEW_DIR"
npm install --production

# 3️⃣ 새 서버 시작
pm2 start dist/server.js --name lia-server --update-env || {
    echo "=== Deploy Failed, Rolling Back ==="
    pm2 delete lia-server || true
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$CURRENT_DIR"
        pm2 start "$CURRENT_DIR/dist/server.js" --name lia-server
    fi
    exit 1
}

# 4️⃣ 기존 버전 백업
if [ -d "$CURRENT_DIR" ]; then
    mv "$CURRENT_DIR" "$BACKUP_DIR"
fi

# 5️⃣ 새 버전을 current로
mv "$NEW_DIR" "$CURRENT_DIR"

# 6️⃣ 성공 시 기존 백업 삭제
rm -rf "$BACKUP_DIR"

echo "=== Deploy Hook End ==="
