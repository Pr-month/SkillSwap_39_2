import { Controller, Get, UseGuards, Req, Patch, Body, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { UpdateRequestStatusDto } from './dto/update-status.dto';


@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getOutgoingRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateStatus(  
    @Param('id') requestId: string,
    @Body() dto: UpdateRequestStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.requestsService.updateStatus(requestId, req.user, dto);
  }

}
