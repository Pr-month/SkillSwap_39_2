import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getOutgoingRequests(req.user.sub);
  }
}
