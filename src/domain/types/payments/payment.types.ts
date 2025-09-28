import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';

export const paymentStatus = ['PENDING', 'COMPLETE', 'FAILED'] as const;
export type PaymentStatus = (typeof paymentStatus)[number];

export interface CreatePendingPaymentInput {
    merchantPaymentId: string;
    userId: string;
    type: PaymentProductTypesEnum;
    paymentProductId: string;
    amount: number;
}

export interface UpdatePaymentInput {
    method?: string | null;
    methodDetail?: string | null;
    status: PaymentStatus;
}

export interface PaymentRecord {
    id: string;
    amount: number;
    currency: string;
    merchantPaymentId: string;
    paymentProductId: string;
    status: PaymentStatus;
    userId: string;
}

export type Payment = {
    paymentId: string;
    productId: string;
    userId: string;
    totalPrice: number;
    productType: PaymentProductTypesEnum;
    paymentMethod: string;
    paymentMethodDetail?: string;
};
