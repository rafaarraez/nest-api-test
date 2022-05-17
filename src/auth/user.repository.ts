import { EntityRepository, Repository } from "typeorm";
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt";
import { ConflictException } from "@nestjs/common";
import { CredentialsDto } from "./dto/credentials.dto";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async signUp(credentialsDto: CredentialsDto): Promise<void> {
        const { email, password } = credentialsDto;
        const hashedPassword = await this.hashPassword(password, await bcrypt.genSalt());
        const user = this.create({ email, password: hashedPassword });
        try {
            await this.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('email already exists');
            } else {
                console.log(error);
            }
        }
    }

    async signIn(credentialsDto: CredentialsDto): Promise<string> {
        const { email, password } = credentialsDto;
        const user = await this.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            return user.email;
        }
        return null;
    }


    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

}