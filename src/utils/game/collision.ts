import { Circle, Rectangle } from 'src/domain/types/game.types';

export const isCircleInRect = (circle: Circle, rect: Rectangle): boolean => {
    const rectLeft = rect.x - rect.width / 2;
    const rectRight = rect.x + rect.width / 2;
    const rectTop = rect.y - rect.height / 2;
    const rectBottom = rect.y + rect.height / 2;

    if (
        circle.x >= rectLeft &&
        circle.x <= rectRight &&
        circle.y >= rectTop &&
        circle.y <= rectBottom
    ) {
        return true;
    }

    const closestX = Math.max(rectLeft, Math.min(circle.x, rectRight));
    const closestY = Math.max(rectTop, Math.min(circle.y, rectBottom));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    const distanceSq = dx * dx + dy * dy;
    return distanceSq < circle.radius * circle.radius;
};

export const isRectInRect = (rect1: Rectangle, rect2: Rectangle): boolean => {
    const rect1Left = rect1.x - rect1.width / 2;
    const rect1Right = rect1.x + rect1.width / 2;
    const rect1Top = rect1.y - rect1.height / 2;
    const rect1Bottom = rect1.y + rect1.height / 2;

    const rect2Left = rect2.x - rect2.width / 2;
    const rect2Right = rect2.x + rect2.width / 2;
    const rect2Top = rect2.y - rect2.height / 2;
    const rect2Bottom = rect2.y + rect2.height / 2;

    // 두 사각형이 겹치지 않는 조건
    if (
        rect1Right < rect2Left || // rect1이 rect2의 왼쪽에 있음
        rect1Left > rect2Right || // rect1이 rect2의 오른쪽에 있음
        rect1Bottom < rect2Top || // rect1이 rect2의 위에 있음
        rect1Top > rect2Bottom // rect1이 rect2의 아래에 있음
    ) {
        return false;
    }

    return true;
};

// 범용 충돌 검사 함수
export const isColliding = (
    shape1: Circle | Rectangle,
    shape2: Circle | Rectangle,
): boolean => {
    if ('radius' in shape1 && 'radius' in shape2) {
        const dx = shape1.x - shape2.x;
        const dy = shape1.y - shape2.y;
        const distanceSq = dx * dx + dy * dy;
        const radiusSum = shape1.radius + shape2.radius;
        return distanceSq <= radiusSum * radiusSum;
    }

    if ('width' in shape1 && 'width' in shape2) {
        return isRectInRect(shape1, shape2);
    }

    if ('radius' in shape1 && 'width' in shape2) {
        return isCircleInRect(shape1, shape2);
    }

    if ('width' in shape1 && 'radius' in shape2) {
        return isCircleInRect(shape2, shape1);
    }

    return false;
};
