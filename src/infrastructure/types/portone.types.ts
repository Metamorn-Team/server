import { PaymentProductTypes } from 'src/domain/types/payment-products/payment-product.types';

// TODO 결제 수단 추가 시 확장 필요
type PaymentStatus = 'PAID' | 'FAILED' | 'CANCELLED';
type EasyPayMethodType =
    | 'PaymentMethodCard'
    | 'PaymentMethodEasyPayMethodCharge'
    | 'PaymentMethodEasyPayMethodRefund';
type PaymentMethodType = 'PaymentMethodEasyPay';

export interface Payment {
    status: PaymentStatus;
    id: string;
    method: {
        type: PaymentMethodType;
        provider: string;
        easyPayMethod: {
            type: EasyPayMethodType;
        };
    };
    customData: CustomData;
    orderName: string;
    amount: {
        total: number;
    };
    currency: 'KRW';
}

export interface CustomData {
    productId: string;
    userId: string;
    productType: PaymentProductTypes;
}

/**
 * @description 포트원 결제 커스텀 데이터 가드
 */
export function isCustomData(obj: unknown): obj is CustomData {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'productId' in obj &&
        typeof obj.productId === 'string' &&
        'userId' in obj &&
        typeof obj.userId === 'string' &&
        'productType' in obj &&
        typeof obj.productType === 'string'
    );
}

/**
 * @description 포트원 결제 타입 가드
 */
export function isPayment(obj: unknown): obj is Payment {
    if (typeof obj !== 'object' || obj === null) return false;

    const p = obj as Record<string, unknown>;

    // status
    const validStatuses = ['PAID', 'READY', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(p.status as string)) return false;

    if (typeof p.id !== 'string') return false;

    // method
    const method = p.method as Record<string, unknown> | undefined;
    if (!method || typeof method !== 'object') return false;

    if (method.type !== 'PaymentMethodEasyPay') return false;
    if (typeof method.provider !== 'string') return false;

    const easyPayMethod = method.easyPayMethod as
        | Record<string, unknown>
        | undefined;
    if (!easyPayMethod || typeof easyPayMethod !== 'object') return false;

    const validEasyPayTypes = [
        'PaymentMethodCard',
        'PaymentMethodEasyPayMethodCharge',
        'PaymentMethodEasyPayMethodRefund',
    ];
    if (!validEasyPayTypes.includes(easyPayMethod.type as string)) return false;

    // orderName
    if (typeof p.orderName !== 'string') return false;

    // amount
    const amount = p.amount as Record<string, unknown> | undefined;
    if (!amount || typeof amount !== 'object') return false;

    if (typeof amount.total !== 'number') return false;

    // currency
    if (p.currency !== 'KRW') return false;

    return true;
}
