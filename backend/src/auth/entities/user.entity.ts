export class User {
  username: string;
  password: string;
  twoFactorAuthenticationSecret?: string;
  isTwoFactorAuthenticationEnabled?: boolean;
}
