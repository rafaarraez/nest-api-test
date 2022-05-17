import { JwtModuleOptions } from '@nestjs/jwt';


const expireTime: number = parseInt(<string>process.env.JWT_EXPIRE_TIME, 10) || 3600;

export default () => ({
    jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: expireTime,
        },
    } as JwtModuleOptions,
});