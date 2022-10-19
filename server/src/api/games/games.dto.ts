import { createZodDto } from "@anatine/zod-nestjs";
import { GameModeSchema } from "shared";

export class GetGameModesDto extends createZodDto(GameModeSchema) {}
