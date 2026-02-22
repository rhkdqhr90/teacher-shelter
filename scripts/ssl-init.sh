#!/bin/bash
# SSL 인증서 초기 설정 스크립트
# Let's Encrypt 인증서 발급 및 Nginx 설정

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 변수
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 함수
success() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# .env 파일 확인
if [ ! -f "$PROJECT_DIR/.env" ]; then
    error ".env 파일이 없습니다. .env.example을 복사하고 설정하세요."
fi

# .env에서 DOMAIN 읽기
source "$PROJECT_DIR/.env"

if [ -z "$DOMAIN" ]; then
    error "DOMAIN이 .env에 설정되지 않았습니다."
fi

echo "========================================="
echo "SSL 인증서 설정: $DOMAIN"
echo "========================================="
echo ""

# 1. 초기 nginx 설정 (HTTP만)
echo "1. 초기 Nginx 설정 적용 중..."
cat > "$PROJECT_DIR/nginx/nginx.conf.template" << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name ${DOMAIN} www.${DOMAIN};

        # ACME challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'SSL setup in progress...';
            add_header Content-Type text/plain;
        }
    }
}
EOF
success "초기 Nginx 설정 완료"

# 2. Nginx 시작
echo ""
echo "2. Nginx 컨테이너 시작 중..."
cd "$PROJECT_DIR"
docker-compose up -d nginx
sleep 3

# Nginx 상태 확인
if docker-compose ps nginx | grep -q "Up"; then
    success "Nginx 시작됨"
else
    error "Nginx 시작 실패. docker-compose logs nginx 확인"
fi

# 3. SSL 인증서 발급
echo ""
echo "3. Let's Encrypt 인증서 발급 중..."
echo "   이메일 주소를 입력하세요 (인증서 만료 알림용):"
read -p "   Email: " EMAIL

if [ -z "$EMAIL" ]; then
    error "이메일 주소가 필요합니다."
fi

docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

if [ $? -eq 0 ]; then
    success "SSL 인증서 발급 완료"
else
    error "SSL 인증서 발급 실패"
fi

# 4. 전체 Nginx 설정 복원
echo ""
echo "4. 전체 Nginx 설정 복원 중..."
git checkout "$PROJECT_DIR/nginx/nginx.conf.template" 2>/dev/null || {
    warn "git checkout 실패. 수동으로 nginx.conf.template을 복원하세요."
}
success "Nginx 설정 복원 완료"

# 5. 모든 서비스 시작
echo ""
echo "5. 모든 서비스 시작 중..."
docker-compose up -d
sleep 5
success "서비스 시작 완료"

# 6. DB 마이그레이션
echo ""
echo "6. 데이터베이스 마이그레이션 중..."
docker-compose exec -T backend npx prisma migrate deploy
success "마이그레이션 완료"

# 완료
echo ""
echo "========================================="
echo -e "${GREEN}SSL 설정 완료!${NC}"
echo "========================================="
echo ""
echo "사이트 확인: https://$DOMAIN"
echo "API 확인: https://$DOMAIN/api/health"
echo ""
