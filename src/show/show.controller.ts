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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AwsService } from 'src/aws/aws.service';

@ApiTags('공연 정보')
@Controller('shows')
export class ShowController {
  constructor(
    private readonly showService: ShowService,
    private readonly awsService: AwsService,
  ) {}

  /**
   * 이미지 업로드
   * @param files
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor(
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.NAME,
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.MAX_COUNT,
    ),
  )
  @Post('/images')
  async imageUpload(@UploadedFiles() files: Express.Multer.File[]) {
    return await this.showService.imageUpload(files);
  }

  /**
   * 공연 등록
   * @param createShowDto
   * @param files
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor(
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.NAME,
      SHOW_CONSTANT.COMMON.FILES_INTERCEPTOR.MAX_COUNT,
    ),
  )
  @Post()
  async createShow(@Body() createShowDto: CreateShowDto) {
    return await this.showService.createShow(createShowDto);
  }

  /**
   * 공연 목록 조회
   * @param queryData
   * @returns
   */
  @Get()
  async findShowList(@Query('category') queryData: string) {
    return await this.showService.findShowList(queryData);
  }

  /**
   * 공연 검색
   * @param queryData
   * @returns
   */
  @Get('/search')
  async findShowByTitle(@Query('title') queryData: string) {
    return await this.showService.findShowByTitle(queryData);
  }

  /**
   * 공연 목록 조회
   * @param showId
   * @returns
   */
  @Get('/:showId')
  async findShowDetail(@Param('showId') showId: string) {
    return await this.showService.findShowDetail(+showId);
  }
}
