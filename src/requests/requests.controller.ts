import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getOutgoingRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
    async createRequests(
      @Req() req: RequestWithUser,
      @Body() requests: CreateRequestDto,
    ) {
      return this.requestsService.createRequests(req.user.sub, requests);
    }
}
