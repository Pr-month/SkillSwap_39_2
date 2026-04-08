import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  Param,
  Delete,
  Post,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { UpdateRequestStatusDto } from './dto/update-status.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import {
  ApiRequestOutgoing,
  ApiRequestCreate,
  ApiRequestDelete,
  ApiRequestUpdateStatus,
  ApiRequestIncoming,
} from './requests.swagger';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  @ApiRequestOutgoing()
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getOutgoingRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiRequestCreate()
  async createRequests(
    @Req() req: RequestWithUser,
    @Body() requests: CreateRequestDto,
  ) {
    return this.requestsService.createRequests(req.user.sub, requests);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiRequestDelete()
  async deleteRequest(
    @Param('id') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.requestsService.deleteRequest(requestId, req.user);
    return { message: 'Request deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiRequestUpdateStatus()
  async updateStatus(
    @Param('id') requestId: string,
    @Body() dto: UpdateRequestStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.requestsService.updateStatus(requestId, req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  @ApiRequestIncoming()
  async getIncomingRequests(@Req() req: RequestWithUser) {
    return await this.requestsService.getIncomingRequests(req.user.sub);
  }
}
