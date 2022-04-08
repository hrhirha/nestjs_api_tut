import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {

    singnup() {
        return "signing up"
    }

    signin() {
        return "signing in"
    }
}
