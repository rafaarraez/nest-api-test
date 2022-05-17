import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
    @Post('/signup')
    signUp(@Body() credentialsDto: CredentialsDto): Promise<void> {
        return this.authService.signUp(credentialsDto);
    }

    @HttpCode(200)
    @ApiOperation({
        description: 'Sign in a user',
    })
    @Post('/signin')
    signIn(@Body() credentialsDto: CredentialsDto): Promise<SignInResponseDto> {
        return this.authService.signIn(credentialsDto);
    }

    @HttpCode(200)
    @ApiOperation({
        description: 'Send an email with a code to allow the user to create a new password',
    })
    @Post('/recover-password')
    requestRecoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<void> {
        return this.authService.requestPasswordRecovery(recoverPasswordDto);
    }
    @HttpCode(200)
    @ApiOperation({
        description: 'Allows an user to update his password if they lost/forgot it using a verification code',
    })
    @Post('/update-password')
    updatePassword(@Body() updatePasswordDto: UpdatePasswordDto): Promise<void> {
        return this.authService.updatePassword(updatePasswordDto);
    }
}