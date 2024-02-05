import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('------------------开始请求---------------------------');

    const start = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `------------------响应时间: ${
              Date.now() - start
            }毫秒------------------`,
          ),
        ),
      );
  }
}
