-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "bannerText" TEXT,
ADD COLUMN     "bgColor" TEXT,
ADD COLUMN     "subText" TEXT,
ADD COLUMN     "textColor" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;
