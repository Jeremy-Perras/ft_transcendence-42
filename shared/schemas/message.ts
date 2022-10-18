import { extendApi } from "@anatine/zod-openapi";
import { z } from "zod";

export const MessageSchema = extendApi(z.object({}));
