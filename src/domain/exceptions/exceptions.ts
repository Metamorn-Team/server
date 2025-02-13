// src/domain/exceptions/user.exception.ts
export interface ErrorBody {
    message: string;
    userInfo?: {
        email: string;
        name: string;
        provider: string;
        registerProvider?: string;
    };
}
export class NotFoundException extends Error {
    public errorBody: ErrorBody;

    constructor(message: string = '존재하지 않는 값입니다.') {
        super(message);
        this.name = 'Not found';
        this.errorBody = { message: this.message };
    }
}

export class UserNotFoundException extends NotFoundException {
    constructor(userInfo: { email: string; name: string; provider: string }) {
        super('존재하지 않는 사용자입니다.');
        this.name = 'User not found';
        this.errorBody = {
            message: this.message,
            userInfo: userInfo,
        };
    }
}

export class ConflictException extends Error {
    public errorBody: ErrorBody;

    constructor(message: string = '이미 존재하는 값입니다.') {
        super(message);
        this.name = 'Conflict';
    }
}

export class ProviderConflictException extends ConflictException {
    constructor(userInfo: {
        email: string;
        name: string;
        provider: string;
        registeredProvider: string;
    }) {
        super('Oauth Provider가 다릅니다.');
        this.name = 'Provider Conflict';
        this.errorBody = {
            message: this.message,
            userInfo: userInfo,
        };
    }
}

export class UserConflictException extends ConflictException {
    constructor(userInfo: { email: string; name: string; provider: string }) {
        super('이미 존재하는 사용자 입니다.');
        this.name = 'User Conflict';
        this.errorBody = {
            message: this.message,
            userInfo: userInfo,
        };
    }
}

export class ForbiddenException extends Error {
    public errorBody: ErrorBody;

    constructor(message: string = '권한이 없습니다.') {
        super(message);
        this.name = 'Forbidden';
        this.errorBody = {
            message: this.message,
        };
    }
}

export class UnauthorizedException extends Error {
    public errorBody: ErrorBody;

    constructor(message: string = '인증 정보가 적절하지 않습니다') {
        super(message);
        this.name = 'Unauthorized';
        this.errorBody = {
            message: this.message,
        };
    }
}

export class AccessTokenUnauthorizedException extends UnauthorizedException {
    constructor() {
        super('Access 토큰 권한이 없습니다.');
        this.name = 'Access Token Unauthorized';
    }
}

export class BadRequestException extends Error {
    public errorBody: ErrorBody;

    constructor(message: string = '잘못된 요청입니다.') {
        super(message);
        this.name = 'BadRequest';
        this.errorBody = {
            message: this.message,
        };
    }
}
