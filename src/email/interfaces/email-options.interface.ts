export interface EmailOptionsInterface {
  validationSchema: {
    user: string;
    password: string;
    host: string;
    port: number;
  };
}
