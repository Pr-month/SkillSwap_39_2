export interface IRefreshTokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
