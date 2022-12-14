import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

//handeling the business logik (connect to a database!!!)
@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService,
        private config: ConfigService,
    ){}
    
    async signup(dto: AuthDto){
        //generate the password hash
        const hash = await argon.hash(dto.password);

        try{
            //save the new user in the db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            })
            return this.signToken(user.id,user.email);
        } catch(error){
            if (error instanceof PrismaClientKnownRequestError){ //unique duplicate error
                if(error.code === 'P2002') { //create a new record with a new field
                    throw new ForbiddenException(
                        'Credentials taken'
                    );
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto){
        //find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })
        //if user does not exist throw exeption
        if(!user) {
            throw new ForbiddenException(
                'Credentials taken'
            );
        }
        //compare password
        const pwMatches = await argon.verify(user.hash,dto.password)
        //if password not correct throw exeption
        if(!pwMatches){
            throw new ForbiddenException(
                'Credentials taken'
            );
        }
        return this.signToken(user.id,user.email);
    }

    async signToken( userId: number, email: String): Promise<{access_token: string}> {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '15m',
                secret: secret,
            }
        );

        return {
            access_token: token,
        };
    }
}
