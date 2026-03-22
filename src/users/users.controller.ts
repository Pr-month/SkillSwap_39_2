import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/me/password')
  updatePassword(@Req() req: RequestWithUser, @Body() updatePasswordDTO: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user, updatePasswordDTO);
  }
}
