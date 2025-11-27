import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const decoded = await this.firebase.auth.verifyIdToken(token);
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
