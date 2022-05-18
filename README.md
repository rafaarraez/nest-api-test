## Description

This is a NestJS API

## Configuration

For the database we need PostgreSQL.

First of all, we must create an .env file in the root folder of the project with the following environment variables:

```
PORT=
NODE_ENV=

DB_HOST=
DB_NAME=
DB_USER=
DB_PORT=
DB_PASSWORD=
DB_SYNC=

JWT_SECRET=
JWT_EXPIRE_TIME=

EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_HOST=
EMAIL_PORT=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=

UNSPLASH_ACCESS_KEY=
UNPSLASH_SECRET_KEY=
```
## Installation


```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# using Docker
$ docker-compose up
```
