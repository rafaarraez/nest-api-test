import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from "./entities/user.entity";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { UserRepository } from "./user.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('jwt.secret') as string
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { email } = payload;
        const user = this.userRepository.findOne({ email });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}