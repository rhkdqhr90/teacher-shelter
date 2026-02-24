export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface JwtPayloadWithRefreshToken extends JwtPayload {
    refreshToken: string;
}
