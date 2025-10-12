#!/bin/bash
set -e

APP_BASE="/home/ec2-user/app"
CURRENT_DIR="$APP_BASE/current"
TEMP_DIR="$APP_BASE/deploy-temp"
NEW_DIR="$APP_BASE/new_$(date +%s)"
BACKUP_DIR="$APP_BASE/backup"

echo "=== Deploy Hook Start ==="
echo "Temporary deploy dir: $TEMP_DIR"

# 1. CodeDeploy agent가 root로 실행하므로 소유권 변경하며 복사
rsync -a --chown=ec2-user:ec2-user "$TEMP_DIR/" "$NEW_DIR/"

# 2. 의존성 설치
cd "$NEW_DIR"
npm install --production

# 3. prisma client 생성
npx prisma generate

# 4. 기존 PM2 프로세스 중지 및 삭제
pm2 describe lia-server > /dev/null 2>&1 && {
    echo "Stopping existing process..."
    pm2 stop lia-server
    pm2 delete lia-server
} || echo "No existing process found"

# 5. 기존 버전 백업
if [ -d "$CURRENT_DIR" ]; then
    rm -rf "$BACKUP_DIR"
    mv "$CURRENT_DIR" "$BACKUP_DIR"
fi

# 6. 새 버전을 current로 이동 (PM2 시작 전에), 시작 후 옮기면 경로 꼬임
mv "$NEW_DIR" "$CURRENT_DIR"

# 7. current 디렉토리에서 PM2 시작
cd "$CURRENT_DIR"
pm2 start dist/src/main.js --name lia-server || {
    echo "=== Deploy Failed, Rolling Back ==="
    
    # 실패한 current 제거
    cd "$APP_BASE"
    rm -rf "$CURRENT_DIR"
    
    # 백업 버전 복구
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$CURRENT_DIR"
        cd "$CURRENT_DIR"
        pm2 start dist/src/main.js --name lia-server
        echo "Rollback completed"
    fi
    exit 1
}

# 8. PM2 설정 저장
pm2 save

echo "=== Deploy Successful ==="