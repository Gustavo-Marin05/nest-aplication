import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.token;
    
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    try {
      // ✅ Agregada configuración del secret
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret
      });
      
      // 💡 Asignamos el payload al request object
      request.user = payload;

    } catch (error) {
      console.error('Error al verificar token:', error);
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}