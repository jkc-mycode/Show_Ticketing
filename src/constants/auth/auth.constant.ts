export const AUTH_CONSTANT = {
  ENTITY: {
    NAME: 'refresh_token',
  },
  UTIL: {
    AUTHORIZATION: 'authorization',
    BEARER: 'Bearer',
    ROLES: 'roles',
  },
  COMMON: {
    JWT: 'jwt',
    HASH: {
      SALT: 10,
    },
    REFRESH_TOKEN: {
      COLUMN_NAME: 'token',
    },
  },
  JWT: {
    JWT_SECRET_KEY: 'JWT_SECRET_KEY',
    ACCESS_EXPIRES_IN: '7h',
    REFRESH_EXPIRES_IN: '7d',
  },
};
