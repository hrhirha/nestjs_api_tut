import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { domainToASCII } from "url";

@Injectable()
export class AuthService {

    constructor (private prisma: PrismaService) {}

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
            delete user.hash
            return user
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
            {
                    throw new ForbiddenException('Credentials already taken');
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
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
        delete user.hash;
        return user;
    }
}
