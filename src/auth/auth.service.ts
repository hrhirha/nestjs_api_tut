import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { ConfigService } from "@nestjs/config";
import { ModuleTokenFactory } from "@nestjs/core/injector/module-token-factory";

@Injectable()
export class AuthService {

    constructor (private config: ConfigService , private prisma: PrismaService, private jwt: JwtService) {}

    async singnup(dto: AuthDto) {
        // Generate password hash
        const hash = await argon.hash(dto.password);
        // save user to db
        try {

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            })
            // retrun user
            return this.signToken(user.id, user.email);
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
            {
                    throw new ForbiddenException('Credentials already taken');
            }
            throw error;
        }
    }

    async signin(dto: AuthDto)
    {
        // find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });
        // if user does not exist, throw exception
        if (!user) throw new ForbiddenException('incorrect credentials')

        // compare password
        const pwd = await argon.verify(user.hash, dto.password);
        // if password is incorrect, throw exception
        if (!pwd) throw new ForbiddenException('incorrect credentials');

        // send back user
        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}>
    {
        const payload = {
            sub: userId,
            email,
        };

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(
            payload, 
            {
                expiresIn: '15m',
                secret,
            }
        );

        return {
            access_token: token,
        }
    }
}
