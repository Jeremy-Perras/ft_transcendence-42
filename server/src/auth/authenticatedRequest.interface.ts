import { Request } from "express";
import UserSession from "./userSession.model";

interface AuthenticatedRequest extends Request {
  user: UserSession;
}

export default AuthenticatedRequest;
