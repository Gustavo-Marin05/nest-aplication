import { IsEmail, IsString } from "class-validator"

export class RegisterUserDto {
    @IsEmail()
    @IsString()
    email:string

    @IsString()
    password:string
}
