import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from "socket.io";
import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import UserSession from "../auth/userSession.model";

declare module "http" {
  interface IncomingMessage {
    session: Session & {
      authenticated: boolean;
      passport: {
        user: UserSession;
      };
    };
  }
}

export class ExpressIoAdapter extends IoAdapter {
  constructor(app: any, sessionMiddleware: any) {
    super(app);
    this.sessionMiddleware = sessionMiddleware;
  }

  sessionMiddleware;

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, options);
    server.use((socket, next) => {
      this.sessionMiddleware(
        socket.request as Request,
        {} as Response,
        next as NextFunction
      );
    });
    server.use((socket, next) => {
      const session = socket.request.session;
      if (
        !session.passport?.user ||
        session.passport.user.twoFactorVerified === false
      ) {
        next(new Error("unauthorized"));
      } else {
        next();
      }
    });
    return server;
  }
}
