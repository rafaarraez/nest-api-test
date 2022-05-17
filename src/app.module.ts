import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import application from './config/application';
import database from './config/database';
import jwt from './config/jwt';
import mail from './config/mail';
import { EmailModule } from './email/email.module';
import { EmailOptionsInterface } from './email/interfaces/email-options.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [application, database, jwt],
      isGlobal: true,
    }),
    EmailModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): EmailOptionsInterface =>
      ({
        ...configService.get('mail'),
      } as EmailOptionsInterface),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('typeorm') as TypeOrmModuleOptions,
    }),
    AuthModule,
    EmailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
