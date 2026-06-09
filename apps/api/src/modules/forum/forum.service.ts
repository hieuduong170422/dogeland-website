import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { CreateThreadDto, CreatePostDto, ReactDto, ThreadQueryDto, UpdateThreadDto } from './dto/forum.dto';

const PAGE_SIZE = 20;

function serializeThread(t: any) {
  return {
    ...t,
    id: t.id.toString(),
    authorId: t.authorId.toString(),
    categoryId: t.categoryId.toString(),
    author: t.author ? { ...t.author, id: t.author.id.toString() } : undefined,
    _count: t._count,
  };
}

function serializePost(p: any) {
  return {
    ...p,
    id: p.id.toString(),
    authorId: p.authorId.toString(),
    threadId: p.threadId.toString(),
    author: p.author ? { ...p.author, id: p.author.id.toString() } : undefined,
    reactions: (p.reactions ?? []).map((r: any) => ({
      ...r,
      id: r.id.toString(),
      userId: r.userId.toString(),
      postId: r.postId.toString(),
    })),
  };
}

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  async getCategories() {
    const cats = await this.prisma.forumCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { threads: { where: { deletedAt: null } } } },
      },
    });
    return cats.map((c) => ({ ...c, id: c.id.toString() }));
  }

  async getCategoryBySlug(slug: string) {
    const cat = await this.prisma.forumCategory.findUnique({ where: { slug } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    return { ...cat, id: cat.id.toString() };
  }

  // ─── Threads ──────────────────────────────────────────────────────────────

  async getThreads(categorySlug: string, query: ThreadQueryDto) {
    const { page = 1, search } = query;
    const cat = await this.getCategoryBySlug(categorySlug);

    const where = {
      categoryId: BigInt(cat.id),
      deletedAt: null,
      ...(search
        ? { title: { contains: search, mode: 'insensitive' as const } }
        : {}),
    };

    const [threads, total] = await this.prisma.$transaction([
      this.prisma.forumThread.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, role: true, avatarUrl: true } },
          _count: { select: { posts: { where: { deletedAt: null } } } },
        },
      }),
      this.prisma.forumThread.count({ where }),
    ]);

    return {
      threads: threads.map(serializeThread),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      category: cat,
    };
  }

  async getThread(threadId: bigint) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
      include: {
        author: { select: { id: true, username: true, role: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { posts: { where: { deletedAt: null } } } },
      },
    });
    if (!thread) throw new NotFoundException('Chủ đề không tồn tại');

    // Increment view count (fire-and-forget)
    this.prisma.forumThread
      .update({ where: { id: threadId }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return serializeThread(thread);
  }

  async createThread(userId: bigint, dto: CreateThreadDto) {
    const cat = await this.getCategoryBySlug(dto.categorySlug);

    const thread = await this.prisma.forumThread.create({
      data: {
        title: dto.title,
        authorId: userId,
        categoryId: BigInt(cat.id),
        posts: {
          create: { content: dto.content, authorId: userId },
        },
      },
      include: {
        author: { select: { id: true, username: true, role: true, avatarUrl: true } },
        _count: { select: { posts: true } },
      },
    });

    return serializeThread(thread);
  }

  async updateThread(threadId: bigint, userId: bigint, role: string, dto: UpdateThreadDto) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Chủ đề không tồn tại');
    if (role !== 'ADMIN' && role !== 'MODERATOR')
      throw new ForbiddenException('Không có quyền thực hiện');

    const updated = await this.prisma.forumThread.update({
      where: { id: threadId },
      data: {
        ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
        ...(dto.isLocked !== undefined ? { isLocked: dto.isLocked } : {}),
      },
    });
    return serializeThread(updated);
  }

  async deleteThread(threadId: bigint, userId: bigint, role: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Chủ đề không tồn tại');
    const isOwner = thread.authorId === userId;
    if (!isOwner && role !== 'ADMIN' && role !== 'MODERATOR')
      throw new ForbiddenException('Không có quyền xóa');

    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // ─── Posts ────────────────────────────────────────────────────────────────

  async getPosts(threadId: bigint, page = 1) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Chủ đề không tồn tại');

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.forumPost.findMany({
        where: { threadId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, role: true, avatarUrl: true } },
          reactions: { select: { id: true, userId: true, postId: true, type: true } },
        },
      }),
      this.prisma.forumPost.count({ where: { threadId, deletedAt: null } }),
    ]);

    return {
      posts: posts.map(serializePost),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async createPost(userId: bigint, dto: CreatePostDto) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: dto.threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Chủ đề không tồn tại');
    if (thread.isLocked) throw new BadRequestException('Chủ đề đã bị khóa');

    const post = await this.prisma.forumPost.create({
      data: { content: dto.content, authorId: userId, threadId: dto.threadId },
      include: {
        author: { select: { id: true, username: true, role: true, avatarUrl: true } },
        reactions: true,
      },
    });

    // Bump thread updatedAt
    await this.prisma.forumThread.update({
      where: { id: dto.threadId },
      data: { updatedAt: new Date() },
    });

    return serializePost(post);
  }

  async deletePost(postId: bigint, userId: bigint, role: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId, deletedAt: null },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    const isOwner = post.authorId === userId;
    if (!isOwner && role !== 'ADMIN' && role !== 'MODERATOR')
      throw new ForbiddenException('Không có quyền xóa');

    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  async react(userId: bigint, dto: ReactDto) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: dto.postId, deletedAt: null },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const existing = await this.prisma.forumReaction.findUnique({
      where: { userId_postId: { userId, postId: dto.postId } },
    });

    if (existing) {
      if (existing.type === dto.type) {
        // Toggle off
        await this.prisma.forumReaction.delete({
          where: { userId_postId: { userId, postId: dto.postId } },
        });
        return { action: 'removed', type: dto.type };
      }
      // Switch type
      const updated = await this.prisma.forumReaction.update({
        where: { userId_postId: { userId, postId: dto.postId } },
        data: { type: dto.type },
      });
      return { action: 'updated', type: dto.type, id: updated.id.toString() };
    }

    const created = await this.prisma.forumReaction.create({
      data: { userId, postId: dto.postId, type: dto.type },
    });
    return { action: 'added', type: dto.type, id: created.id.toString() };
  }

  // ─── Seed ─────────────────────────────────────────────────────────────────

  async seedCategories() {
    const cats = [
      { name: 'Thông báo', slug: 'announcements', description: 'Tin tức và thông báo từ BTC', sortOrder: 0 },
      { name: 'Thảo luận chung', slug: 'general', description: 'Trò chuyện thoải mái về mọi chủ đề', sortOrder: 1 },
      { name: 'Góc kỹ thuật', slug: 'technical', description: 'Hỏi đáp về game, bugs, suggestions', sortOrder: 2 },
      { name: 'Giới thiệu', slug: 'introductions', description: 'Chào hỏi cộng đồng Dogeland', sortOrder: 3 },
      { name: 'Báo cáo vi phạm', slug: 'reports', description: 'Báo cáo bug, vi phạm quy tắc', sortOrder: 4 },
    ];

    for (const cat of cats) {
      await this.prisma.forumCategory.upsert({
        where: { slug: cat.slug },
        create: cat,
        update: {},
      });
    }
    return { message: 'Categories seeded' };
  }
}
