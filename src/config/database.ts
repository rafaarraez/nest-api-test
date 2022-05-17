import * as path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';


export default () => ({
  typeorm: {
    type: 'postgres',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    synchronize: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    //logging: true,
    port: parseInt(process.env.DB_PORT),
    extra: {
      decimalNumbers: true,
    },
    autoLoadEntities: true,
  } as PostgresConnectionOptions,
});

