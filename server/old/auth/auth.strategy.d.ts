import { Strategy } from "passport-custom";
import { AuthService } from "./auth.service";
import { Request } from "express";
declare const AuthStrategy_base: new (...args: any[]) => Strategy;
export declare class AuthStrategy extends AuthStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request): Promise<number | undefined>;
}
export {};
