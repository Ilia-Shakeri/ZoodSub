import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "music" }, update: {}, create: { name: "موسیقی", slug: "music", icon: "🎵", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "video" }, update: {}, create: { name: "فیلم و سریال", slug: "video", icon: "🎬", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "ai" }, update: {}, create: { name: "هوش مصنوعی", slug: "ai", icon: "🤖", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "gaming" }, update: {}, create: { name: "گیمینگ", slug: "gaming", icon: "🎮", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "tools" }, update: {}, create: { name: "ابزارها", slug: "tools", icon: "🔧", sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "vpn" }, update: {}, create: { name: "وی‌پی‌ان", slug: "vpn", icon: "🛡️", sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: "education" }, update: {}, create: { name: "آموزش", slug: "education", icon: "📚", sortOrder: 7 } }),
  ]);

  const [music, video, ai, gaming, tools, vpn, education] = categories;

  const products = [
    {
      categoryId: music.id,
      title: "اسپاتیفای پرمیوم",
      slug: "spotify-premium",
      description: "اشتراک پرمیوم اسپاتیفای بدون قطعی • ریجن ترکیه",
      isActive: true,
      isFeatured: true,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه ترکیه", duration: "1 Month", region: "Turkey", price: 160000, stock: -1 },
        { name: "۳ ماهه ترکیه", duration: "3 Months", region: "Turkey", price: 450000, oldPrice: 480000, stock: -1 },
        { name: "۱ ساله ترکیه", duration: "12 Months", region: "Turkey", price: 1600000, oldPrice: 1920000, stock: -1 },
      ],
    },
    {
      categoryId: music.id,
      title: "اپل موزیک",
      slug: "apple-music",
      description: "اشتراک اپل موزیک • ریجن آمریکا • فامیلی",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۳ ماهه آمریکا", duration: "3 Months", region: "USA", price: 180000, stock: -1 },
        { name: "۶ ماهه آمریکا", duration: "6 Months", region: "USA", price: 340000, stock: -1 },
      ],
    },
    {
      categoryId: video.id,
      title: "نتفلیکس پرمیوم",
      slug: "netflix-premium",
      description: "اشتراک نتفلیکس کیفیت 4K • پروفایل اختصاصی",
      isActive: true,
      isFeatured: true,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 250000, stock: -1 },
        { name: "۳ ماهه", duration: "3 Months", price: 700000, oldPrice: 750000, stock: -1 },
      ],
    },
    {
      categoryId: video.id,
      title: "یوتیوب پرمیوم",
      slug: "youtube-premium",
      description: "بدون تبلیغ • یوتیوب موزیک رایگان • دانلود آفلاین",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه ترکیه", duration: "1 Month", region: "Turkey", price: 90000, stock: -1 },
        { name: "۳ ماهه ترکیه", duration: "3 Months", region: "Turkey", price: 250000, stock: -1 },
      ],
    },
    {
      categoryId: ai.id,
      title: "چت جی‌پی‌تی پلاس",
      slug: "chatgpt-plus",
      description: "دسترسی به GPT-4 • بدون محدودیت • تحویل آنی",
      isActive: true,
      isFeatured: true,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 1200000, stock: -1 },
      ],
    },
    {
      categoryId: ai.id,
      title: "کانوا پرو",
      slug: "canva-pro",
      description: "طراحی حرفه‌ای بدون محدودیت • تمپلیت‌های پریمیوم",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 350000, stock: -1 },
        { name: "۱۲ ماهه", duration: "12 Months", price: 3500000, oldPrice: 4200000, stock: -1 },
      ],
    },
    {
      categoryId: gaming.id,
      title: "ایکس‌باکس گیم پس آلتیمیت",
      slug: "xbox-gamepass-ultimate",
      description: "دسترسی به صدها بازی • ایکس‌باکس لایو گلد",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 320000, stock: -1 },
        { name: "۳ ماهه", duration: "3 Months", price: 900000, stock: -1 },
      ],
    },
    {
      categoryId: tools.id,
      title: "تلگرام پرمیوم",
      slug: "telegram-premium",
      description: "بدون قطعی • فعالسازی آنی • همه امکانات پریمیوم",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۳ ماهه", duration: "3 Months", price: 850000, stock: -1 },
        { name: "۶ ماهه", duration: "6 Months", price: 1600000, oldPrice: 1700000, stock: -1 },
        { name: "۱ ساله", duration: "12 Months", price: 2900000, oldPrice: 3400000, stock: -1 },
      ],
    },
    {
      categoryId: vpn.id,
      title: "نورد وی‌پی‌ان",
      slug: "nordvpn",
      description: "امنیت کامل • سرعت بالا • اکانت اشتراکی",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 140000, stock: -1 },
        { name: "۶ ماهه", duration: "6 Months", price: 680000, stock: -1 },
      ],
    },
    {
      categoryId: education.id,
      title: "دولینگو پلاس",
      slug: "duolingo-plus",
      description: "یادگیری زبان بدون تبلیغ • تمرین‌های نامحدود",
      isActive: true,
      isFeatured: false,
      deliveryType: "instant",
      variants: [
        { name: "۱ ماهه", duration: "1 Month", price: 120000, stock: -1 },
        { name: "۱ ساله", duration: "12 Months", price: 1100000, oldPrice: 1440000, stock: -1 },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...rest } = productData;
    const existing = await prisma.product.findUnique({ where: { slug: rest.slug } });
    if (!existing) {
      await prisma.product.create({
        data: { ...rest, variants: { create: variants } },
      });
      console.log(`Created product: ${rest.title}`);
    }
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
