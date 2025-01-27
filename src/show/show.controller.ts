import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { Roles } from 'src/auth/utils/roles.decorator';
import { Role } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

@Controller('shows')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  // 공연 등록 (ADMIN만 사용 가능)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor(
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.NAME,
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.MAX_COUNT,
    ),
  )
  @Post()
  async createShow(
    @Body() createShowDto: CreateShowDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log(files);
    return await this.showService.createShow(createShowDto, files);
  }

  // 공연 목록 조회
  @Get()
  async findShowList(@Query('category') queryData: string) {
    return await this.showService.findShowList(queryData);
  }

  // 공연 검색
  @Get('/search')
  async findShowByTitle(@Query('title') queryData: string) {
    return await this.showService.findShowByTitle(queryData);
  }

  // 공연 목록 조회
  @Get('/:showId')
  async findShowDetail(@Param('showId') showId: string) {
    return await this.showService.findShowDetail(+showId);
  }
}
