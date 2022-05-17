import { EntityRepository, Repository } from "typeorm";
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt";
import { ConflictException } from "@nestjs/common";
import { CredentialsDto } from "./dto/credentials.dto";
import { GenericResponse } from "src/common/interfaces/generic-response.interface";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async signUp(credentialsDto: CredentialsDto): Promise<GenericResponse> {
        const { email, password } = credentialsDto;
        const hashedPassword = await this.hashPassword(password, await bcrypt.genSalt());
        const user = this.create({ email, password: hashedPassword });
        try {
            await this.save(user);
            return { message: `The user ${email} has been created` }
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('email already exists');
            } else {
                console.log(error);
            }
        }
    }

    async signIn(credentialsDto: CredentialsDto): Promise<User> {
        const { email, password } = credentialsDto;
        const user = await this.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }


    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

}