import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WikiService } from './wiki.service';
import { CreateWikiDto, UpdateWikiDto } from './dto/wiki.dto';

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get()
  @Public()
  listPages() {
    return this.wikiService.listPages();
  }

  @Get(':slug')
  @Public()
  getPage(@Param('slug') slug: string) {
    return this.wikiService.getPage(slug);
  }

  @Post()
  @Roles('MODERATOR', 'ADMIN')
  createPage(
    @CurrentUser() user: { id: bigint },
    @Body() dto: CreateWikiDto,
  ) {
    return this.wikiService.createPage(user.id, dto);
  }

  @Put(':slug')
  @Roles('MODERATOR', 'ADMIN')
  updatePage(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: bigint },
    @Body() dto: UpdateWikiDto,
  ) {
    return this.wikiService.updatePage(slug, user.id, dto);
  }

  @Post('seed')
  @Roles('ADMIN')
  seedWikiPages() {
    return this.wikiService.seedWikiPages();
  }
}
