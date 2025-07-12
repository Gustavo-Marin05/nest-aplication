import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/create-auth.dto';
import { AuthGuard } from './guard/auth.guard';
import { Response as Res } from 'express';
import { LoginUserDto } from './dto/login-auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() user: LoginUserDto, @Response({ passthrough: true }) res: Res) {
    const result = await this.authService.loginService(user.email, user.password);

    res.cookie('token', result.acces_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { message: 'Login exitoso' };
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() user: RegisterUserDto, @Response({ passthrough: true }) res: Res) {
    const result = await this.authService.registerService(user);

    res.cookie('token', result.acces_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none' ,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { message: 'Usuario registrado y autenticado' };
  }



  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req) {
    return this.authService.profile(req.user);
  }




  @Post('logout')
  logout(@Response({ passthrough: true }) res: Res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,          // debe coincidir con el login
      sameSite: 'none',      // debe coincidir con el login
    });
    return { message: 'Sesión cerrada' };
  }
}
