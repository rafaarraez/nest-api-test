import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({length: 100, unique: true})
    email: string;
    
    @Column({length: 100})
    password: string;
        
    @CreateDateColumn()
    createdAt: Date;
}