import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { Roles } from 'src/auth/utils/roles.decorator';
import { Role } from 'src/user/types/userRole.type';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(RolesGuard)
@Controller('show')
export class ShowController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly showService: ShowService) {}

  // 공연 등록 (ADMIN만 사용 가능)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  async createShow(@Body() createShowDto: CreateShowDto, @UploadedFiles() files) {
    console.log(files);
    return await this.showService.createShow(createShowDto, files);
  }
}
