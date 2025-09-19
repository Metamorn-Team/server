export const paymentStatus = ['PENDING', 'COMPLETE', 'FAILED'] as const;
export type PaymentStatus = (typeof paymentStatus)[number];
