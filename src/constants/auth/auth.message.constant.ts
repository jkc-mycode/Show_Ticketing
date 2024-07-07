export const AUTH_MESSAGE = {
  DTO: {
    EMAIL: {
      IS_NOT_EMPTY: '이메일을 입력해 주세요.',
    },
    PASSWORD: {
      IS_NOT_EMPTY: '비밀번호를 입력해 주세요.',
    },
    PASSWORD_CHECK: {
      IS_NOT_EMPTY: '비밀번호 확인을 입력해 주세요.',
    },
    NICKNAME: {
      IS_NOT_EMPTY: '닉네임을 입력해 주세요.',
    },
  },
  REFRESH_TOKEN: {
    BAD_REQUEST: '인증 정보가 없습니다.',
    NOT_FOUND: '인증 정보와 일치하는 사용자가 없습니다.',
    UNAUTHORIZED: '인증정보가 유효하지 않습니다.',
  },
  COMMON: {
    USER: {
      NOT_FOUND: '일치하는 사용자가 없습니다.',
    },
  },
  SIGN_UP: {
    PASSWORD: {
      BAD_REQUEST: '비밀번호 확인과 일치하지 않습니다.',
    },
    EMAIL: {
      CONFLICT: '이미 해당 이메일로 가입된 사용자가 있습니다.',
    },
    NICKNAME: {
      CONFLICT: '이미 해당 닉네임으로 가입된 사용자가 있습니다.',
    },
  },
  SIGN_IN: {
    PASSWORD: {
      UNAUTHORIZED: '비밀번호가 틀렸습니다.',
    },
  },
  SIGN_OUT: {
    EXIST: '이미 로그아웃되었습니다.',
    SUCCEED: '로그아웃에 성공했습니다.',
  },
};
