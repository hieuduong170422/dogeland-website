import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForumService } from './forum.service';
import {
  CreatePostDto,
  CreateThreadDto,
  ReactDto,
  ThreadQueryDto,
  UpdateThreadDto,
} from './dto/forum.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // ─── Categories ─────────────────────────────────────────────────
  @Get('categories')
  @Public()
  getCategories() {
    return this.forumService.getCategories();
  }

  @Post('seed')
  @Roles('ADMIN')
  seedCategories() {
    return this.forumService.seedCategories();
  }

  // ─── Threads ────────────────────────────────────────────────────
  @Get('categories/:slug/threads')
  @Public()
  getThreads(@Param('slug') slug: string, @Query() query: ThreadQueryDto) {
    return this.forumService.getThreads(slug, query);
  }

  @Get('threads/:id')
  @Public()
  getThread(@Param('id') id: string) {
    return this.forumService.getThread(BigInt(id));
  }

  @Post('threads')
  createThread(
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: CreateThreadDto,
  ) {
    return this.forumService.createThread(user.id, dto);
  }

  @Patch('threads/:id')
  @Roles('MODERATOR', 'ADMIN')
  updateThread(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: UpdateThreadDto,
  ) {
    return this.forumService.updateThread(BigInt(id), user.id, user.role, dto);
  }

  @Delete('threads/:id')
  deleteThread(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
  ) {
    return this.forumService.deleteThread(BigInt(id), user.id, user.role);
  }

  // ─── Posts ──────────────────────────────────────────────────────
  @Get('threads/:id/posts')
  @Public()
  getPosts(@Param('id') id: string, @Query('page') page?: string) {
    return this.forumService.getPosts(BigInt(id), page ? parseInt(page) : 1);
  }

  @Post('posts')
  createPost(
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.forumService.createPost(user.id, dto);
  }

  @Delete('posts/:id')
  deletePost(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
  ) {
    return this.forumService.deletePost(BigInt(id), user.id, user.role);
  }

  // ─── Reactions ──────────────────────────────────────────────────
  @Post('reactions')
  react(
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: ReactDto,
  ) {
    return this.forumService.react(user.id, dto);
  }
}
