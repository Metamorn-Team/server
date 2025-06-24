import type { Circle, Rectangle } from 'src/domain/types/game.types';
import {
    isCircleInRect,
    isRectInRect,
    isColliding,
} from 'src/utils/game/collision';

describe('isCircleInRect - 원과 사각형 충돌 판정', () => {
    const rectangle: Rectangle = { x: 0, y: 0, width: 10, height: 10 };

    it('원이 사각형 안에 완전히 들어갈 경우 충돌', () => {
        const circle: Circle = { x: 0, y: 0, radius: 1 };
        expect(isCircleInRect(circle, rectangle)).toBe(true);
    });

    it('원의 중심이 사각형 경계 위에 있는 경우 충돌', () => {
        const circle: Circle = { x: 5, y: 0, radius: 1 };
        expect(isCircleInRect(circle, rectangle)).toBe(true);
    });

    it('원의 일부가 사각형과 겹치는 경우 충돌', () => {
        const circle: Circle = { x: 6, y: 0, radius: 2 };
        expect(isCircleInRect(circle, rectangle)).toBe(true);
    });

    it('원이 사각형 밖에 완전히 있는 경우 충돌 X', () => {
        const circle: Circle = { x: 20, y: 20, radius: 1 };
        expect(isCircleInRect(circle, rectangle)).toBe(false);
    });

    it('원이 사각형에 딱 닿기만 할 경우 충돌 X', () => {
        const circle: Circle = { x: 6, y: 0, radius: 1 };
        expect(isCircleInRect(circle, rectangle)).toBe(false);
    });

    it('원의 중심은 밖에 있지만 모서리에 닿는 경우 충돌', () => {
        const circle: Circle = { x: 6, y: 6, radius: 2 };
        expect(isCircleInRect(circle, rectangle)).toBe(true);
    });
});

describe('isRectInRect - 사각형과 사각형 충돌 판정', () => {
    it('두 사각형이 완전히 겹치는 경우 충돌', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(true);
    });

    it('한 사각형이 다른 사각형 안에 완전히 들어간 경우 충돌', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 2, y: 2, width: 4, height: 4 };
        expect(isRectInRect(rect1, rect2)).toBe(true);
    });

    it('두 사각형이 부분적으로 겹치는 경우 충돌', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 5, y: 5, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(true);
    });

    it('두 사각형이 모서리에서만 닿는 경우 충돌', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 10, y: 10, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(true);
    });

    it('두 사각형이 완전히 분리된 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 20, y: 20, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });

    it('사각형이 다른 사각형의 왼쪽에 있는 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: -15, y: 0, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });

    it('사각형이 다른 사각형의 오른쪽에 있는 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 15, y: 0, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });

    it('사각형이 다른 사각형의 위에 있는 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 0, y: -15, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });

    it('사각형이 다른 사각형의 아래에 있는 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 0, y: 15, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });

    it('사각형이 다른 사각형의 대각선 방향에 있는 경우 충돌 X', () => {
        const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
        const rect2: Rectangle = { x: 15, y: 15, width: 10, height: 10 };
        expect(isRectInRect(rect1, rect2)).toBe(false);
    });
});

describe('isColliding - 범용 충돌 검사', () => {
    describe('Circle vs Circle', () => {
        it('두 원이 겹치는 경우 충돌', () => {
            const circle1: Circle = { x: 0, y: 0, radius: 5 };
            const circle2: Circle = { x: 3, y: 0, radius: 3 };
            expect(isColliding(circle1, circle2)).toBe(true);
        });

        it('두 원이 닿는 경우 충돌', () => {
            const circle1: Circle = { x: 0, y: 0, radius: 5 };
            const circle2: Circle = { x: 10, y: 0, radius: 5 };
            expect(isColliding(circle1, circle2)).toBe(true);
        });

        it('두 원이 분리된 경우 충돌 X', () => {
            const circle1: Circle = { x: 0, y: 0, radius: 5 };
            const circle2: Circle = { x: 15, y: 0, radius: 5 };
            expect(isColliding(circle1, circle2)).toBe(false);
        });
    });

    describe('Rectangle vs Rectangle', () => {
        it('두 사각형이 겹치는 경우 충돌', () => {
            const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            const rect2: Rectangle = { x: 5, y: 5, width: 10, height: 10 };
            expect(isColliding(rect1, rect2)).toBe(true);
        });

        it('두 사각형이 분리된 경우 충돌 X', () => {
            const rect1: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            const rect2: Rectangle = { x: 20, y: 20, width: 10, height: 10 };
            expect(isColliding(rect1, rect2)).toBe(false);
        });
    });

    describe('Circle vs Rectangle', () => {
        it('원이 사각형 안에 있는 경우 충돌', () => {
            const circle: Circle = { x: 0, y: 0, radius: 2 };
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            expect(isColliding(circle, rect)).toBe(true);
        });

        it('원이 사각형 밖에 있는 경우 충돌 X', () => {
            const circle: Circle = { x: 20, y: 20, radius: 2 };
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            expect(isColliding(circle, rect)).toBe(false);
        });

        it('원이 사각형과 부분적으로 겹치는 경우 충돌', () => {
            const circle: Circle = { x: 6, y: 0, radius: 3 };
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            expect(isColliding(circle, rect)).toBe(true);
        });

        it('순서가 바뀌어도 동일한 결과', () => {
            const circle: Circle = { x: 6, y: 0, radius: 3 };
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
            expect(isColliding(circle, rect)).toBe(isColliding(rect, circle));
        });
    });
});
