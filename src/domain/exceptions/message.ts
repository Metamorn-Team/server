export const FORBIDDEN_MESSAGE = '권한이 없습니다.';
export const USER_NOT_REGISTERED_MESSAGE = '가입되지 않은 회원입니다.';
export const PROVIDER_CONFLICT = '다른 플랫폼으로 가입한 이력이 존재합니다.';
export const USER_EMAIL_CONFLIC_MESSAGE = '이미 존재하는 이메일입니다.';
export const USER_NOT_FOUND_MESSAGE = '존재하지 않는 회원입니다.';
export const GET_USER_BAD_REQUEST_MESSAGE =
    '자기 자신의 정보는 조회할 수 없습니다.';
export const FRIEND_REQUEST_BAD_REQUEST_MESSAGE =
    '자기 자신에게 친구 요청을 보낼 수 없습니다.';
export const FRIEND_REQUEST_NOT_FOUND_MESSAGE =
    '존재하지 않는 친구 요청입니다.';
export const FRIEND_REQUEST_CONFLICT_MESSAGE = '이미 친구 요청을 보냈습니다';
export const TAG_CONFLICT_MESSAGE = '이미 존재하는 태그입니다.';
export const INVALID_TOKEN_MESSAGE = '유효하지 않은 토큰입니다.';
export const INVALID_INPUT_MESSAGE = '잘못된 입력입니다.';
export const PRODUCT_NOT_FOUND_MESSAGE = (data: string) =>
    `${data}, 존재하지 않는 상품입니다.`;
export const ITEM_NOT_FOUND_MESSAGE = '존재하지 않는 아이템입니다';
export const NOT_ENOUGH_GOLD_MESSAGE = '골드가 부족합니다.';
export const PRODUCT_PURCHASE_LIMIT_EXCEEDED_MESSAGE =
    '해당 상품 구매 횟수를 초과했습니다.';
export const ISLAND_NOT_FOUND_MESSAGE = '존재하지 않는 섬입니다.';
export const PLAYER_NOT_FOUND_IN_STORAGE = '참여 중인 회원이 아닙니다.';
export const TAG_AT_LEAST_ONE_MESSAGE =
    '섬의 태그는 적어도 하나 이상이어야합니다.';
export const LOCK_ACQUIRED_FAILED_MESSAGE = (key: string) =>
    `lock 획득 실패: ${key}`;
export const TOO_MANY_PARTICIPANTS_MESSAGE = '참여 인원이 너무 많습니다.';
