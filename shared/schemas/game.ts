import { extendApi } from "@anatine/zod-openapi";
import { z } from "zod";

export const GameSchema = extendApi(z.object({}));
