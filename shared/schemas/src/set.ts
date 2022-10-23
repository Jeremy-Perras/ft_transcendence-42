import { z, ZodTypeAny } from "zod";

export const SetSchema = (valType: ZodTypeAny) => {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return new Set([...val]);
  }, z.set(valType));
};
