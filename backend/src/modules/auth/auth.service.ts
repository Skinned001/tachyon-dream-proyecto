export class AuthService {
  async login(email: string, password: string) {
    return { email, password, ok: true };
  }
}
