#!/bin/bash
set -e

APP_BASE="/home/ec2-user/app"
CURRENT_DIR="$APP_BASE/current"
TEMP_DIR="$APP_BASE/deploy-temp"
NEW_DIR="$APP_BASE/new_$(date +%s)"
BACKUP_DIR="$APP_BASE/backup"

echo "=== Deploy Hook Start ==="
echo "Temporary deploy dir: $TEMP_DIR"

# agent로 실행하면 root 소유기 떄문에 복사
rsync -a --chown=ec2-user:ec2-user "$TEMP_DIR/" "$NEW_DIR/"

# 2️⃣ 의존성 설치
cd "$NEW_DIR"
# --unsafe-perm 옵션으로 root-owned 파일도 설치 가능
npm install --production --unsafe-perm

# 3️⃣ 새 서버 시작
# PM2로 기존 앱 이름 그대로 새 디렉토리 환경에서 실행
pm2 start dist/src/main.js --name lia-server --update-env || {
    echo "=== Deploy Failed, Rolling Back ==="
    # 실패 시 기존 서버 재실행
    pm2 delete lia-server || true
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$CURRENT_DIR"
        pm2 start "$CURRENT_DIR/dist/src/main.js" --name lia-server
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
