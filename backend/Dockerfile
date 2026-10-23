FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# dist는 더 이상 git에 커밋하지 않으므로(.gitignore) 이미지 안에서 직접 빌드한다.
# (서버 자체 빌드가 아니라 CI 러너에서 이 Dockerfile을 빌드하므로 1코어 메모리 제약과 무관)
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate
RUN pnpm build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npx prisma generate
RUN mkdir -p uploads/verification uploads/profiles logs && chown -R nestjs:nodejs uploads logs
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "dist/src/main.js"]
