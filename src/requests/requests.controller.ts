import { Controller, Get, UseGuards, Req, Delete, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.interface';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getOutgoingRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteRequest(
    @Param('id') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.requestsService.deleteRequest(requestId, req.user);
    return { message: 'Request deleted successfully' };   
  }
}
