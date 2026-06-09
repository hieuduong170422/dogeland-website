import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { CreateWikiDto, UpdateWikiDto } from './dto/wiki.dto';

function serialize(page: any) {
  return {
    ...page,
    id: page.id.toString(),
    authorId: page.authorId?.toString() ?? null,
    lastEditedBy: page.lastEditedBy?.toString() ?? null,
  };
}

@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  async listPages() {
    const pages = await this.prisma.wikiPage.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, slug: true, title: true, updatedAt: true, createdAt: true },
    });
    return pages.map(serialize);
  }

  async getPage(slug: string) {
    const page = await this.prisma.wikiPage.findUnique({ where: { slug } });
    if (!page || !page.isPublished) throw new NotFoundException('Trang không tồn tại');
    return serialize(page);
  }

  async createPage(userId: bigint, dto: CreateWikiDto) {
    const page = await this.prisma.wikiPage.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        content: dto.content,
        authorId: userId,
        lastEditedBy: userId,
        isPublished: dto.isPublished ?? true,
      },
    });
    return serialize(page);
  }

  async updatePage(slug: string, userId: bigint, dto: UpdateWikiDto) {
    const existing = await this.prisma.wikiPage.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundException('Trang không tồn tại');

    const page = await this.prisma.wikiPage.update({
      where: { slug },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
        lastEditedBy: userId,
      },
    });
    return serialize(page);
  }

  async seedWikiPages() {
    const pages = [
      {
        slug: 'getting-started',
        title: 'Bắt đầu với Dogeland',
        content: `<h2>Chào mừng đến Dogeland!</h2><p>Dogeland là server Minecraft Việt Nam với nhiều game mode thú vị. Đây là hướng dẫn để bắt đầu.</p><h3>Kết nối server</h3><p>Địa chỉ server: <strong>play.dogeland.vn</strong></p><p>Phiên bản: 1.20.x (Java Edition)</p><h3>Các lệnh cơ bản</h3><ul><li><code>/spawn</code> — Về spawn</li><li><code>/home</code> — Về nhà</li><li><code>/balance</code> — Xem số Dogecoin</li><li><code>/help</code> — Danh sách lệnh</li></ul>`,
      },
      {
        slug: 'survival',
        title: 'Hướng dẫn Survival',
        content: `<h2>Chế độ Survival</h2><p>Survival là chế độ chơi chính của Dogeland. Người chơi bắt đầu từ đầu và xây dựng thế giới của mình.</p><h3>Kiếm Dogecoin</h3><p>Dogecoin là tiền tệ chính trong server. Có thể kiếm bằng cách:</p><ul><li>Bán vật phẩm tại chợ <code>/market</code></li><li>Hoàn thành quest</li><li>Vote server hàng ngày</li><li>Tham gia sự kiện</li></ul>`,
      },
      {
        slug: 'skyblock',
        title: 'Hướng dẫn Skyblock',
        content: `<h2>Chế độ Skyblock</h2><p>Bắt đầu trên một hòn đảo nhỏ giữa bầu trời, phát triển đảo của bạn và leo lên bảng xếp hạng!</p><h3>Bắt đầu</h3><p>Dùng lệnh <code>/skyblock</code> hoặc <code>/sb</code> để vào. Bạn sẽ nhận được một đảo cơ bản với cây và rương.</p><h3>Nâng cấp đảo</h3><p>Cấp độ đảo tăng bằng cách đặt block quý, trồng cây, nuôi động vật. Level đảo quyết định thứ hạng trong leaderboard.</p>`,
      },
      {
        slug: 'bedwars',
        title: 'Hướng dẫn Bed Wars',
        content: `<h2>Chế độ Bed Wars</h2><p>Bảo vệ giường của đội bạn và phá giường của kẻ thù để giành chiến thắng!</p><h3>Luật chơi</h3><ul><li>Mỗi đội có 1 giường — khi giường bị phá, bạn không thể hồi sinh</li><li>Thu thập tài nguyên từ máy phát sinh tài nguyên của đội</li><li>Mua vũ khí, giáp, và công cụ từ shop</li><li>Đội cuối cùng còn sống sót giành chiến thắng</li></ul>`,
      },
    ];

    for (const p of pages) {
      await this.prisma.wikiPage.upsert({
        where: { slug: p.slug },
        create: { ...p, isPublished: true },
        update: {},
      });
    }
    return { message: 'Wiki pages seeded' };
  }
}
