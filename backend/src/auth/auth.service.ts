import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { authenticator } from 'otplib';
import { SignInDto } from './dto/sign-in.dto';
import { User } from './entities/user.entity';
import { toDataURL } from 'qrcode';
import { TwoFASignInDto } from './dto/two-fa-sign-in.dto';

@Injectable()
export class AuthService {
  private users: User[] = [
    {
      username: 'user1',
      password: 'password1',
    },
    {
      username: 'user2',
      password: 'password2',
    },
  ];

  async turnOnTwoFactorAuthentication(
    username: string,
    twoFactorAuthenticationCode: string,
  ) {
    const user = this.users.find((user) => user.username === username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    user.isTwoFactorAuthenticationEnabled = true;
  }

  async generate2fa(username: string) {
    const user = this.users.find((user) => user.username === username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { otpAuthUrl, secret } =
      await this.generateTwoFactorAuthenticationSecret(user);

    user.twoFactorAuthenticationSecret = secret;
    const qrCodeDataURL = await this.generateQrCodeDataURL(otpAuthUrl);

    return {
      qrCodeDataURL,
    };
  }

  async login2fa(twoFASignInDto: TwoFASignInDto) {
    const { username, twoFactorAuthenticationCode } = twoFASignInDto;
    const user = this.users.find((user) => user.username === username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.generateTwoFactorAuthenticationSecret(user);

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return {
      message: 'Success',
    };
  }

  async signIn(signInDto: SignInDto) {
    const { recaptchaToken, username } = signInDto;
    if (this.users.every((user) => user.username !== username)) {
      return new NotFoundException();
    }

    const user = this.users.find((user) => user.username === username);

    const {
      success: isCaptchaSuccess,
      score,
      message,
    } = await this.checkRecaptchaToken(recaptchaToken);

    return {
      isCaptchaSuccess,
      score,
      message,
      username: user.username,
    };
  }

  async checkRecaptchaToken(recaptchaToken: string) {
    const captchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!captchaSecretKey) {
      throw new InternalServerErrorException();
    }

    const formData = `secret=${captchaSecretKey}&response=${recaptchaToken}`;

    try {
      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        },
      );
      const data = await response.json();
      const score = data.score;
      const ACCEPTED_SCORE = 0.5;

      return {
        success: score > ACCEPTED_SCORE,
        score,
        message:
          score > ACCEPTED_SCORE ? 'Success' : 'Captcha Verification failed',
      };
    } catch (error) {
      return {
        success: false,
        score: 0,
        message: 'Captcha Verification failed',
      };
    }
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = process.env.TWO_FA_SECRET_KEY;

    const otpAuthUrl = authenticator.keyuri(user.username, 'MTOAN', secret);

    user.twoFactorAuthenticationSecret = secret;

    return {
      secret,
      otpAuthUrl,
    };
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }
}
