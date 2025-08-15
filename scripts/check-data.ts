import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("=== データベースの状態確認 ===");
  
  // 各テーブルの件数を確認
  const tenants = await prisma.tenant.count();
  console.log(`Tenants: ${tenants}件`);
  
  const supporters = await prisma.supporter.count();
  console.log(`Supporters: ${supporters}件`);
  
  const users = await prisma.user.count();
  console.log(`Users: ${users}件`);
  
  const facilities = await prisma.facility.count();
  console.log(`Facilities: ${facilities}件`);
  
  const plans = await prisma.plan.count();
  console.log(`Plans: ${plans}件`);
  
  const slots = await prisma.slot.count();
  console.log(`Slots: ${slots}件`);
  
  // 施設の詳細情報を表示
  console.log("\n=== 施設情報 ===");
  const facilitiesWithDetails = await prisma.facility.findMany({
    include: {
      profile: true,
      location: true,
      services: true,
      conditions: true,
      slots: true,
    },
  });
  
  for (const facility of facilitiesWithDetails) {
    console.log(`\n施設名: ${facility.profile?.name}`);
    console.log(`所在地: ${facility.location?.prefecture}${facility.location?.city}`);
    console.log(`サービス: ${facility.services.map(s => s.serviceType).join(", ")}`);
    console.log(`空き状況: ${facility.slots[0]?.status ?? "未設定"}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });