import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from "socket.io";
import { Request, Response, NextFunction } from "express";
import session, { Session } from "express-session";
import { SocketParser } from "@apps/shared";
import { INestApplication } from "@nestjs/common";

declare module "http" {
  interface IncomingMessage {
    cookieHolder?: string;
    session: Session & {
      authenticated: boolean;
      passport: {
        user: number;
      };
    };
  }
}

export class ExpressIoAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    sessionMiddleware: ReturnType<typeof session>
  ) {
    super(app);
    this.sessionMiddleware = sessionMiddleware;
  }

  private sessionMiddleware: ReturnType<typeof session>;

  createIOServer(port: number, options?: ServerOptions): any {
    const io: Server = super.createIOServer(port, {
      ...options,
      parser: SocketParser,
    });
    io.use((socket, next) => {
      this.sessionMiddleware(
        socket.request as Request,
        {} as Response,
        next as NextFunction
      );
    });
    io.use((socket, next) => {
      const session = socket.request.session;
      if (!session.passport?.user) {
        next(new Error("unauthorized"));
      } else {
        next();
      }
    });
    return io;
  }
}
