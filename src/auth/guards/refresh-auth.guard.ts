import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Activates Passport strategy `jwt-refresh`: verifies refresh JWT (REFRESH_TOKEN_KEY),
 * then ensures the token matches the one stored for the user (rotation / revocation).
 */
@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {}
