import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/create-auth.dto';
import { compare, encrypt } from './libs/bcryp';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private prismaService: PrismaService, private jwrService: JwtService) { }

    //parte del login de autentificacion 
    async loginService(email: string, password: string) {

        try {
            //buscar si es que existe el correo
            const user = await this.prismaService.user.findUnique({
                where: {
                    email
                }
            })

            if (!user) throw new BadRequestException('email o contraceña invaldos')


            const isMatch = await compare(password, user.password);

            if (!isMatch) throw new BadRequestException('contraceña incorrecta')
            const { password: _, ...userWhitoutPassword } = user;


            const payload = {
                ...userWhitoutPassword
            }
            const acces_token = await this.jwrService.signAsync(payload)
            return { acces_token }


        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }


    //registro de los usuarios 
    async registerService(userdto: RegisterUserDto) {
        try {
            const { email, password } = userdto;
            const userFound = await this.prismaService.user.findUnique({
                where: {
                    email
                }
            })

            if (userFound) throw new BadRequestException('el usuario ya existe');
            //encriptacion de la contraceña

            const passwordHash = await encrypt(password);

            const user = await this.prismaService.user.create({
                data: {
                    email,
                    password: passwordHash
                }
            })

            const { password: _, ...userwithoutpassword } = user

            const payload = {
                ...userwithoutpassword
            }
            const acces_token = await this.jwrService.signAsync(payload)

            return { acces_token };

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }

    //no devuelve todos los usuarios
    async profile(user: any) {
        // Aquí puedes devolver solo lo que quieres exponer
        // por ejemplo:
        if (!user) throw new UnauthorizedException();

        return {
            id: user.id,
            email: user.email,
            // cualquier otro dato que tengas en el payload JWT
        };
    }
}
