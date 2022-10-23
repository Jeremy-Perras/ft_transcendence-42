import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  data: T;
}

const RecSetSerializer = (data: any) => {
  for (const key in data) {
    if (data[key] instanceof Set) {
      data[key] = Array.from(data[key]);
    }
    if (typeof data[key] === "object") {
      data[key] = RecSetSerializer(data[key]);
    }
  }
  return data;
};

@Injectable()
export class SetInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(map(RecSetSerializer));
  }
}
