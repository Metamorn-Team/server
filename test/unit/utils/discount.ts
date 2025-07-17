/**
 * @param rate 할인율 (0 ~ 1)
 * @param origin 원래 가격
 * @returns 할인된 가격
 */
export function discount(rate: number, origin: number) {
    return Math.floor(origin * (1 - rate));
}
