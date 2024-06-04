import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  async signIn(signInDto: SignInDto) {
    const captchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!captchaSecretKey) {
      throw new Error('RECAPTCHA_SECRET_KEY is not defined');
    }

    const { recaptchaToken } = signInDto;
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
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }
}
