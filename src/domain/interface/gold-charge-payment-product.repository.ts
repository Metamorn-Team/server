import { GoldChargePaymentProduct } from 'src/domain/types/payment-products/gold-charge-payment-product.types';

export interface GoldChargePaymentProductRepository {
    findAll(): Promise<GoldChargePaymentProduct[]>;
}

export const GoldChargePaymentProductRepository = Symbol(
    'GoldChargePaymentProductRepository',
);
