import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { RedeemGiftCodeDto } from './dto/redeem-gift-code.dto';

const PAGE_SIZE = 20;

@Injectable()
export class EconomyService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, username: true },
    });
    if (!user) throw new NotFoundException();
    return { balance: user.balance, username: user.username };
  }

  async getTransactions(userId: bigint, page = 1) {
    const skip = (page - 1) * PAGE_SIZE;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          type: true,
          amount: true,
          reason: true,
          balanceBefore: true,
          balanceAfter: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      items: items.map((t) => ({ ...t, id: t.id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async redeemGiftCode(userId: bigint, dto: RedeemGiftCodeDto) {
    const code = dto.code.trim().toUpperCase();

    const giftCode = await this.prisma.giftCode.findFirst({
      where: {
        code,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!giftCode) throw new BadRequestException('Mã quà tặng không hợp lệ hoặc đã hết hạn');
    if (giftCode.usedCount >= giftCode.maxUses) {
      throw new BadRequestException('Mã quà tặng đã hết lượt sử dụng');
    }

    // Check user already redeemed (unique constraint: giftCodeId + userId)
    const alreadyUsed = await this.prisma.giftCodeRedemption.findUnique({
      where: { giftCodeId_userId: { giftCodeId: giftCode.id, userId } },
    });
    if (alreadyUsed) throw new BadRequestException('Bạn đã sử dụng mã quà tặng này rồi');

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    const balanceBefore = currentUser?.balance ?? 0;
    const balanceAfter = balanceBefore + giftCode.amount;

    await this.prisma.$transaction([
      this.prisma.giftCodeRedemption.create({ data: { userId, giftCodeId: giftCode.id } }),
      this.prisma.giftCode.update({ where: { id: giftCode.id }, data: { usedCount: { increment: 1 } } }),
      this.prisma.user.update({ where: { id: userId }, data: { balance: { increment: giftCode.amount } } }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'GIFT_CODE',
          amount: giftCode.amount,
          reason: `Đổi mã quà tặng: ${code}`,
          balanceBefore,
          balanceAfter,
        },
      }),
    ]);

    return { message: `Đổi mã thành công! Bạn nhận được ${giftCode.amount} Dogecoin.`, amount: giftCode.amount };
  }
}
