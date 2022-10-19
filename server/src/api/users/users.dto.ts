import { createZodDto } from "@anatine/zod-nestjs";
import { UserSchema } from "shared";

export class CreateUserDto extends createZodDto(UserSchema) {}

export class UpdateUserDto extends createZodDto(UserSchema) {}
export class Userschema extends createZodDto(UserSchema) {}
