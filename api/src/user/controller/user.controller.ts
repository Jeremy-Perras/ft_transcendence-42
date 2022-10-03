import { Body, Controller, Get, Post } from '@nestjs/common';
import { get } from 'http';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
    constructor(
    private userService: UserService
    ){}
@Post()
create(@Body() createUserDto:CreateUserDto):Observable<boolean>{
    return of(true);
}


@Get()
FindAll(){

}
@Post()
login(){

}
}