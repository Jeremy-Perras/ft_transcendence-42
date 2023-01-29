import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import UserSession from "./userSession.model";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserSession => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  }
);
