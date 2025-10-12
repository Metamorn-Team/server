#!/bin/bash

# 테스트 시작 메시지
echo "=== Deploy Test: AfterInstall Hook Start ==="

# 현재 경로 출력
echo "Current directory: $(pwd)"

# 파일/폴더 목록 출력
echo "Directory contents:"
ls -al

# 환경 변수 출력 (AWS 관련 변수 예시)
echo "USER: $USER"
echo "HOME: $HOME"

# 테스트 완료 메시지
echo "=== Deploy Test: AfterInstall Hook End ==="
