# #!/bin/bash
# set -e

# APP_BASE="/home/ec2-user/app"
# CURRENT_DIR="$APP_BASE/current"
# TEMP_DIR="$APP_BASE/deploy-temp"
# NEW_DIR="$APP_BASE/new_$(date +%s)"
# BACKUP_DIR="$APP_BASE/backup"

# echo "=== Deploy Hook Start ==="
# echo "Temporary deploy dir: $TEMP_DIR"

# # agent로 실행하면 root 소유기 떄문에 복사
# rsync -a --chown=ec2-user:ec2-user "$TEMP_DIR/" "$NEW_DIR/"

# # 2️⃣ 의존성 설치
# cd "$NEW_DIR"
# npm install --production

# # 3️⃣ 새 서버 시작
# # PM2로 기존 앱 이름 그대로 새 디렉토리 환경에서 실행
# pm2 start dist/src/main.js --name lia-server --update-env || {
#     echo "=== Deploy Failed, Rolling Back ==="
#     # 실패 시 기존 서버 재실행
#     pm2 delete lia-server || true
#     if [ -d "$BACKUP_DIR" ]; then
#         mv "$BACKUP_DIR" "$CURRENT_DIR"
#         pm2 start "$CURRENT_DIR/dist/src/main.js" --name lia-server
#     fi
#     exit 1
# }

# # 기존 버전 백업
# if [ -d "$CURRENT_DIR" ]; then
#     mv "$CURRENT_DIR" "$BACKUP_DIR"
# fi

# # 새 버전을 current로
# mv "$NEW_DIR" "$CURRENT_DIR"

# # 성공 시 기존 백업 삭제
# rm -rf "$BACKUP_DIR"

# echo "=== Deploy Hook End ==="


#!/bin/bash
set -e

APP_BASE="/home/ec2-user/app"
CURRENT_DIR="$APP_BASE/current"
TEMP_DIR="$APP_BASE/deploy-temp"
NEW_DIR="$APP_BASE/new_$(date +%s)"
BACKUP_DIR="$APP_BASE/backup"

echo "=== Deploy Hook Start ==="
echo "Temporary deploy dir: $TEMP_DIR"

# 1️⃣ CodeDeploy agent가 root로 실행하므로 소유권 변경하며 복사
rsync -a --chown=ec2-user:ec2-user "$TEMP_DIR/" "$NEW_DIR/"

# 2️⃣ 의존성 설치
cd "$NEW_DIR"
npm install --production

# 3️⃣ Prisma 생성 (필요시)
npx prisma generate

# 4️⃣ 기존 PM2 프로세스 중지 및 삭제
pm2 describe lia-server > /dev/null 2>&1 && {
    echo "Stopping existing process..."
    pm2 stop lia-server
    pm2 delete lia-server
} || echo "No existing process found"

# 5️⃣ 기존 버전 백업
if [ -d "$CURRENT_DIR" ]; then
    rm -rf "$BACKUP_DIR"
    mv "$CURRENT_DIR" "$BACKUP_DIR"
fi

# 6️⃣ 새 버전을 current로 이동 (PM2 시작 전에!)
mv "$NEW_DIR" "$CURRENT_DIR"

# 7️⃣ current 디렉토리에서 PM2 시작
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

# 8️⃣ PM2 설정 저장
pm2 save

echo "=== Deploy Successful ==="
echo "Running from: $CURRENT_DIR"