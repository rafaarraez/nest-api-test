import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/common/interfaces/generic-response.interface';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { SignInResponseDto } from './dto/signin-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({
        description: 'Sign up a user',
    })
    @ApiOkResponse({
        type: GenericResponse,
    })
    @Post('/signup')
    async signUp(@Body() credentialsDto: CredentialsDto): Promise<GenericResponse> {
        return await this.authService.signUp(credentialsDto);
    }


    @ApiOperation({
        description: 'Sign in a user',
    })
    @ApiOkResponse({
        type: SignInResponseDto,
    })
    @Post('/signin')
    async signIn(@Body() credentialsDto: CredentialsDto): Promise<SignInResponseDto> {
        return await this.authService.signIn(credentialsDto);
    }

    @ApiOperation({
        description: 'Send an email with a code to allow the user to create a new password',
    })
    @ApiOkResponse({
        type: GenericResponse,
    })
    @Post('/recover-password')
    async requestRecoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<GenericResponse> {
        return await this.authService.requestPasswordRecovery(recoverPasswordDto);
    }

    @ApiOperation({
        description: 'Allows an user to update his password if they lost/forgot it using a verification code',
    })
    @ApiOkResponse({
        type: GenericResponse,
    })
    @Post('/update-password')
    async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto): Promise<GenericResponse> {
        return await this.authService.updatePassword(updatePasswordDto);
    }
}