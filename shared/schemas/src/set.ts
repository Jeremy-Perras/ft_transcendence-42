import { z, ZodTypeAny } from "zod";

export const SetSchema = <T extends ZodTypeAny>(valType: T) => {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return new Set([...val]);
  }, z.set(valType));
};
