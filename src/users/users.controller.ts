import { Controller, UseGuards, Get, Req, NotFoundException, Post, Body, Patch } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwtAuth.guard";
import { RequestWithUser } from "src/auth/types/request-with-user.interface";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(req.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.updateUser(req.user.sub, dto);

    const { password, ...safeUser } = user;

    return safeUser;
    }
  
  @Post('/me/password')
  updatePassword(@Req() req: RequestWithUser, @Body() updatePasswordDTO: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user, updatePasswordDTO);
  }
}
