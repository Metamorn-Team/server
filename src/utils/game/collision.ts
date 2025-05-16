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
