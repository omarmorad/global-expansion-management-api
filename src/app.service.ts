import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Global Expansion Management API - Ready to help you expand globally!';
  }
}
