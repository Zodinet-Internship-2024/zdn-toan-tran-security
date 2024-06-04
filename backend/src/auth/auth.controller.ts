import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { TwoFASignInDto } from './dto/two-fa-sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  @HttpCode(200)
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('/2fa/generate')
  async generate2fa(@Query('username') username: string) {
    return this.authService.generate2fa(username);
  }

  @Post('/2fa/sign-in')
  async login2fa(@Body() twoFASignInDto: TwoFASignInDto) {
    return this.authService.login2fa(twoFASignInDto);
  }
}
