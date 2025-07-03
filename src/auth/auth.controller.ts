import { Body, Controller, Get, Post, Request, Response, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/create-auth.dto';
import { AuthGuard } from './guard/auth.guard';
import { Response as Res } from 'express';



@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body() user: RegisterUserDto, @Response({ passthrough: true }) res: Res) {
        const result = await this.authService.loginService(user.email, user.password);

        res.cookie('token', result.acces_token, {
            httpOnly: true,
            secure: false, // true si usas HTTPS
            maxAge: 1000 * 60 * 60 * 24 // 1 día
        });

        return result;
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    async register(@Body() user: RegisterUserDto, @Response({ passthrough: true }) res: Res) {
        const result = await this.authService.registerService(user);

        res.cookie('token', result.acces_token, {
            httpOnly: true,
            secure: false, // Cambia a true si usas HTTPS en producción
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            sameSite: 'strict',
        });

        return { message: 'Usuario registrado y autenticado' };

    }

    //comprobacion si me devuelve todos los usuarios
    @Get('users')
    async getUsers() {
        return this.authService.getUsers()
    }


    @Get('profile')
    @UseGuards(AuthGuard)
    async profileController(
        @Request()
        req,

    ) {

        return req.user;
    }

    @Post('logout')
    logout(@Response({ passthrough: true }) res: Res) {
        res.clearCookie('token');
        return { message: 'Sesión cerrada' };
    }

}

