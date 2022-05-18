import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialsDto } from './dto/credentials.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { SignInResponseDto } from './dto/signin-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcryptjs';
import { utc } from 'moment/moment';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { RecoverPassword } from './entities/recovery-password.entity';
import { EmailService } from '../email/email.service';
import {
    EMAIL_SENDER,
    RECOVER_PASSWORD_CODE_EXPIRATION_ON_HOURS,
    RECOVER_PASSWORD_EMAIL_BODY,
    RECOVER_PASSWORD_EMAIL_SUBJECT,
    RECOVER_PASSWORD_MAX_CODE,
    RECOVER_PASSWORD_MIN_CODE,
} from './constants/recover-password.constants';
import { GenericResponse } from 'src/common/interfaces/generic-response.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(RecoverPassword)
        private readonly recoverPasswordRepository: Repository<RecoverPassword>,
        private jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    async signUp(credentialsDot: CredentialsDto): Promise<GenericResponse> {
        return this.userRepository.signUp(credentialsDot);
    }

    async signIn(credentialsDot: CredentialsDto): Promise<SignInResponseDto> {
        const user = await this.userRepository.signIn(credentialsDot);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = { id: user.id, email: user.email };
        const accessToken = await this.jwtService.sign(payload);

        return { accessToken };

    }

    async requestPasswordRecovery(recoverPasswordDto: RecoverPasswordDto): Promise<GenericResponse> {
        const { email } = recoverPasswordDto;
        const user = await this.userRepository.findOne({ email }, { select: ['id', 'email'] });

        if (!user) {
            throw new NotFoundException('The email has not been found');
        }

        const code = randomInt(RECOVER_PASSWORD_MIN_CODE, RECOVER_PASSWORD_MAX_CODE).toString();
        const expirationDate = utc().add(RECOVER_PASSWORD_CODE_EXPIRATION_ON_HOURS, 'hours');

        const recover = await this.recoverPasswordRepository.findOne({ email }, { select: ['id', 'email'] });

        await this.recoverPasswordRepository.save({ ...recover, code, expirationDate, email, valid: true });

        let emailResponse = await this.sendRecoverPasswordEmail(email, code);

        return { message: "A message with recovery code has been sent." }


    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<GenericResponse> {
        const { email, code, password } = updatePasswordDto;
        const userPromise = this.userRepository.findOne({ email }, { select: ['id'] });

        const recoverPassword = await this.recoverPasswordRepository.findOne({ email, valid: true, code });

        if (!recoverPassword) {
            throw new BadRequestException('Code is not valid.');
        }

        recoverPassword.valid = false;
        await this.recoverPasswordRepository.save(recoverPassword);

        const now = utc();
        const isCodeAlreadyExpired = now.isAfter(recoverPassword.expirationDate);

        if (isCodeAlreadyExpired) {
            throw new BadRequestException('Code is already expired.');
        }

        await this.recoverPasswordRepository.delete({ email, valid: true, code });

        const user = await userPromise;
        user.password = await bcrypt.hash(password, await bcrypt.genSalt());;
        await this.userRepository.save(user);

        return { message: "Your password has been successfully updated.." }
    }

    private sendRecoverPasswordEmail(email: string, code: string): Promise<void> {
        return this.emailService.sendMail({
            from: EMAIL_SENDER,
            to: email,
            subject: RECOVER_PASSWORD_EMAIL_SUBJECT,
            text: RECOVER_PASSWORD_EMAIL_BODY + code,
        });
    }
}
