#!/bin/bash
set -e

APP_BASE="/home/ec2-user/app"
CURRENT_DIR="$APP_BASE/current"
TEMP_DIR="$APP_BASE/deploy-temp"
NEW_DIR="$APP_BASE/new_$(date +%s)"
BACKUP_DIR="$APP_BASE/backup"

echo "=== Deploy Hook Start ==="
echo "Temporary deploy dir: $TEMP_DIR"

# 권한 문제 예방
mkdir -p "$APP_BASE"
chown -R ec2-user:ec2-user "$APP_BASE"
chmod -R 755 "$APP_BASE"

# 새 버전 이동
mv "$TEMP_DIR" "$NEW_DIR"
chown -R ec2-user:ec2-user "$NEW_DIR"

# 의존성 설치
cd "$NEW_DIR"
npm install --production --unsafe-perm

# 서버 시작
pm2 start dist/server.js --name lia-server --update-env || {
    echo "=== Deploy Failed, Rolling Back ==="
    pm2 delete lia-server || true
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$CURRENT_DIR"
        pm2 start "$CURRENT_DIR/dist/server.js" --name lia-server
    fi
    exit 1
}

# 기존 버전 백업
if [ -d "$CURRENT_DIR" ]; then
    mv "$CURRENT_DIR" "$BACKUP_DIR"
fi

# 새 버전을 current로
mv "$NEW_DIR" "$CURRENT_DIR"

# 성공 시 기존 백업 삭제
rm -rf "$BACKUP_DIR"

echo "=== Deploy Hook End ==="
