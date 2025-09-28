/**
 * @description 결제 상품 타입
 */
export const paymentProductTypes = ['GOLD_CHARGE'] as const;
export type PaymentProductTypes = (typeof paymentProductTypes)[number];
export enum PaymentProductTypesEnum {
    GOLD_CHARGE,
}
export const convertNumberToPaymentProduct = (
    value: number,
): PaymentProductTypes => paymentProductTypes[value];

/**
 * @description 결제 수단 타입
 */
export const paymentMethodTypes = ['KAKAO_PAY'] as const;
export type PaymentMethodTypes = (typeof paymentMethodTypes)[number];
export enum PaymentMethodTypesEnum {
    KAKAO_PAY,
}
export const convertNumberToPaymentMethod = (
    value: number,
): PaymentMethodTypes => paymentMethodTypes[value];

export interface PaymentProduct {
    id: string;
    price: number;
    type: PaymentProductTypesEnum;
    name?: string;
}
