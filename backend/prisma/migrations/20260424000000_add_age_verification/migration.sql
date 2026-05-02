-- 만 14세 이상 확인 동의 일시 (PIPA 22조의2 컴플라이언스)
ALTER TABLE "users" ADD COLUMN "ageVerifiedAt" TIMESTAMP(3);
