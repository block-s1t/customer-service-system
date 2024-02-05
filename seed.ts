import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`... 数据初始化开始 ...`);

  //获取env中的ADMIN_ID
  const adminId = process.env.ADMIN_ID;

  //创建管理员
  const user = await prisma.user.findUnique({
    where: {
      telegramId: Number(adminId),
    },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        telegramId: Number(adminId),
        name: '超级管理员',
        isAdmin: true,
        isRoot: true,
        isBlocked: false,
      },
    });
  }

  console.log(`... 数据初始化结束 ...`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
