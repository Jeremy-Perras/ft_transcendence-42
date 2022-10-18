import { extendApi } from "@anatine/zod-openapi";
import { z } from "zod";

export const ChannelSchema = extendApi(z.object({}));
