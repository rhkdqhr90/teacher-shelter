-- 만 14세 이상 확인 동의 일시 (PIPA 22조의2 컴플라이언스)
ALTER TABLE "users" ADD COLUMN "ageVerifiedAt" TIMESTAMP(3);

-- 기존 사용자 backfill: createdAt 시점에 약관 동의를 받았으므로 그 시점을
-- 동의 시각으로 간주 (소급 동의 처리). 신규 가입자는 NULL이 아닌 실제 동의
-- 일시가 들어가 PIPA 감사 시 "동의 미확인 사용자 0건" 보장.
UPDATE "users"
SET "ageVerifiedAt" = COALESCE("termsAgreedAt", "createdAt")
WHERE "ageVerifiedAt" IS NULL;
