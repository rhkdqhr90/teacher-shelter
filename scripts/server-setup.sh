#!/bin/bash
# Teacher Shelter 서버 초기 설정 스크립트
# Oracle Cloud Free Tier ARM Ubuntu용

set -e

echo "========================================="
echo "Teacher Shelter 서버 초기 설정"
echo "========================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 성공 메시지
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 함수: 경고 메시지
warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 함수: 에러 메시지
error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. 시스템 업데이트
echo ""
echo "1. 시스템 업데이트 중..."
sudo apt update && sudo apt upgrade -y
success "시스템 업데이트 완료"

# 2. 필수 패키지 설치
echo ""
echo "2. 필수 패키지 설치 중..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw
success "필수 패키지 설치 완료"

# 3. Docker 설치
echo ""
echo "3. Docker 설치 중..."
if command -v docker &> /dev/null; then
    warn "Docker가 이미 설치되어 있습니다"
else
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    success "Docker 설치 완료"
fi

# 4. Docker Compose 설치
echo ""
echo "4. Docker Compose 설치 중..."
if command -v docker-compose &> /dev/null; then
    warn "Docker Compose가 이미 설치되어 있습니다"
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose 설치 완료"
fi

# 5. 방화벽 설정
echo ""
echo "5. 방화벽 설정 중..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable
success "방화벽 설정 완료"

# 6. Oracle Cloud iptables 설정 (필요한 경우)
echo ""
echo "6. Oracle Cloud iptables 설정 중..."
if sudo iptables -L INPUT -n | grep -q "dpt:80"; then
    warn "포트 80이 이미 열려 있습니다"
else
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

    # 규칙 저장
    if command -v netfilter-persistent &> /dev/null; then
        sudo netfilter-persistent save
    else
        sudo apt install -y iptables-persistent
        sudo netfilter-persistent save
    fi
    success "iptables 설정 완료"
fi

# 7. 스왑 메모리 설정 (필요한 경우)
echo ""
echo "7. 스왑 메모리 확인 중..."
if [ $(swapon --show | wc -l) -gt 1 ]; then
    warn "스왑이 이미 설정되어 있습니다"
else
    echo "스왑 파일 생성 중 (4GB)..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    success "스왑 메모리 설정 완료 (4GB)"
fi

# 8. 프로젝트 디렉토리 확인
echo ""
echo "8. 프로젝트 디렉토리 확인 중..."
if [ -d ~/teacher-shelter ]; then
    warn "프로젝트 디렉토리가 이미 존재합니다"
else
    echo "프로젝트를 클론하세요:"
    echo "  git clone https://github.com/<username>/teacher-shelter.git ~/teacher-shelter"
fi

# 완료
echo ""
echo "========================================="
echo -e "${GREEN}서버 초기 설정 완료!${NC}"
echo "========================================="
echo ""
echo "다음 단계:"
echo "1. 재로그인 (docker 그룹 적용): exit 후 다시 SSH 접속"
echo "2. 프로젝트 클론: git clone <repo-url> ~/teacher-shelter"
echo "3. 환경변수 설정: cp .env.example .env && nano .env"
echo "4. SSL 인증서 발급 (docs/DEPLOYMENT.md 참조)"
echo "5. 서비스 시작: docker-compose up -d"
echo ""
