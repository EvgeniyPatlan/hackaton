import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      // Allow access without authentication for some public routes
      if (this.isPublicRoute(request)) {
        return true;
      }
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Attach user to request
      request.user = payload;
      
      return true;
    } catch (error) {
      if (this.isPublicRoute(request)) {
        return true;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isPublicRoute(request: any): boolean {
    // Define public routes that don't require authentication
    const publicRoutes = [
      { path: /^\/files\/[a-zA-Z0-9-]+$/, method: 'GET' },  // GET /files/:id
      { path: /^\/files\/thumbnail\/[a-zA-Z0-9-]+$/, method: 'GET' },  // GET /files/thumbnail/:id
      { path: /^\/files\/location\/[a-zA-Z0-9-]+$/, method: 'GET' },  // GET /files/location/:locationId
    ];

    return publicRoutes.some(route => 
      route.method === request.method && 
      route.path.test(request.url)
    );
  }
}
