import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class AuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<any>;
}
declare const GqlAuthenticatedGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GqlAuthenticatedGuard extends GqlAuthenticatedGuard_base {
    canActivate(context: ExecutionContext): Promise<any>;
    getRequest(context: ExecutionContext): any;
}
export {};
