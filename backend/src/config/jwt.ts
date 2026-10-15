export const jwtConfig = {
  secret: process.env.JWT_SECRET ?? 'development-secret',
  expiresIn: '8h',
};
