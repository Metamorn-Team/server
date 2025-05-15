import type { Circle, Rectangle } from 'src/domain/types/game.types';
import { isCircleInRect } from 'src/utils/game/collision';

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
