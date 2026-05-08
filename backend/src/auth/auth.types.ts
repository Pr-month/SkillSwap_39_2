import { UserRole } from '../users/users.enums';

/** Claims we put into the access JWT (and expect on `req.user` after JwtStrategy). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Claims we put into the refresh JWT. */
export interface RefreshTokenPayload {
  sub: string;
}
