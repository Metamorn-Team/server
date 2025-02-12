// src/domain/exceptions/user.exception.ts
export class NotFoundException extends Error {
    constructor(message: string = '존재하지 않는 값입니다.') {
        super(message);
        this.name = 'Not found';
    }
}

export class UserNotFoundException extends NotFoundException {
    constructor() {
        super('존재하지 않는 사용자입니다.');
        this.name = 'User not found';
    }
}

export class ConflictException extends Error {
    constructor(message: string = '이미 존재하는 값입니다.') {
        super(message);
        this.name = 'Conflict';
    }
}

export class ProviderConflictException extends ConflictException {
    constructor() {
        super('Oauth Provider가 다릅니다.');
        this.name = 'Provider Conflict';
    }
}

export class UserConflictException extends ConflictException {
    constructor() {
        super('이미 존재하는 사용자 입니다.');
        this.name = 'User Conflict';
    }
}

export class ForbiddenException extends Error {
    constructor(message: string = '권한이 없습니다.') {
        super(message);
        this.name = 'Forbidden';
    }
}

export class UnauthorizedException extends Error {
    constructor(message: string = '인증 정보가 적절하지 않습니다') {
        super(message);
        this.name = 'Unauthorized';
    }
}

export class AccessTokenUnauthorizedException extends UnauthorizedException {
    constructor() {
        super('Access 토큰 권한이 없습니다.');
        this.name = 'Access Token Unauthorized';
    }
}

export class BadRequestException extends Error {
    constructor(message: string = '잘못된 요청입니다.') {
        super(message);
        this.name = 'BadRequest';
    }
}
