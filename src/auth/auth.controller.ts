import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
//post request to log in an user -->service class - init 
//handeling request

@Controller('auth')
export class AuthController{
    //im construkert direkt mit private um es als variable zu speichern!! sonst
    //authService: AuthService
    constructor(private authService: AuthService){
        //this.authService = authService;
    }

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        console.log(dto);
        return this.authService.signup(dto);
    }
 
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        console.log(dto);
        return this.authService.signin(dto);
    }
}

