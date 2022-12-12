import { PassportSerializer } from "@nestjs/passport";
export declare class CookieSerializer extends PassportSerializer {
    serializeUser(user: any, done: (err: any, id?: any) => void): void;
    deserializeUser(payload: any, done: (err: any, id?: any) => void): void;
}
