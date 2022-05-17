import { EmailOptionsInterface } from "../email/interfaces/email-options.interface";

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } = process.env;

export default {
    validationSchema: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
    }
} as EmailOptionsInterface;
