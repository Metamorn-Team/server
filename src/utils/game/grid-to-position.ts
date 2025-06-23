import { GRID_SIZE } from 'src/constants/game/grid';

export const gridToPosition = (gridX: number, gridY: number) => {
    return {
        x: gridX * GRID_SIZE + GRID_SIZE / 2,
        y: gridY * GRID_SIZE + GRID_SIZE / 2,
    };
};
