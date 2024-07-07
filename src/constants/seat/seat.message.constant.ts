export const SEAT_MESSAGE = {
  DTO: {
    RESERVE: {
      SEAT_NUMBER: {
        IS_NOT_EMPTY: '좌석 번호를 입력해 주세요.',
      },
      SHOW_TIME_ID: {
        IS_NOT_EMPTY: '공연 시간 ID를 입력해 주세요.',
      },
    },
  },
  COMMON: {
    SEAT_CHECK: {
      RESERVED: '해당 좌석은 이미 예매되었습니다.',
    },
  },
  RESERVE_SEAT: {
    SHOW: {
      NOT_FOUND: '등록된 공연이 없습니다.',
    },
    SHOW_TIME: {
      NOT_FOUND: '등록된 공연 시간이 없습니다.',
    },
    SEAT: {
      NOT_FOUND: '등록된 좌석이 없습니다.',
      SHOW_TIME_OVER: '이미 기간이 지난 공연입니다.',
    },
    USER: {
      NO_POINT: '포인트가 부족합니다.',
    },
    FAIL: '좌석 예매에 실패했습니다.',
  },
  CANCEL_SEAT: {
    TICKET: {
      NOT_FOUND: '예매된 티켓이 없습니다.',
      CANCELED: '이미 취소된 예매입니다.',
      NOT_MINE: '접근 권한이 없습니다.',
    },
    SUCCEED: '공연 예매 취소에 성공했습니다.',
    FAIL: '공연 예매 취소에 실패했습니다.',
  },
};
