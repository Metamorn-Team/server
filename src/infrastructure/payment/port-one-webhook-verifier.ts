import { Injectable } from '@nestjs/common';
import * as PortOne from '@portone/server-sdk';
import { INVALID_DATA } from 'src/domain/exceptions/message';
import {
    isCustomData,
    isPayment,
    Payment,
} from 'src/infrastructure/types/portone.types';

@Injectable()
export class PortOneWebhookVerifier {
    private readonly PORTONE_API_KEY = process.env.PORTONE_API_KEY!;
    private readonly WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY!;
    private readonly portOneClient = PortOne.PortOneClient({
        secret: this.PORTONE_API_KEY,
    });

    async verifyWebhook(
        body: string,
        header: Record<string, string>,
    ): Promise<Payment | null> {
        const webhook = await PortOne.Webhook.verify(
            this.WEBHOOK_SECRET_KEY,
            body,
            header,
        );

        if (
            webhook.type !== 'Transaction.Paid' ||
            !('paymentId' in webhook.data)
        ) {
            return null;
        }

        const paymentResponse = await this.portOneClient.payment.getPayment({
            paymentId: webhook.data.paymentId,
        });

        if (!isPayment(paymentResponse)) {
            throw new Error(
                INVALID_DATA(JSON.stringify(paymentResponse, null, 2)),
            );
        }

        const customData: unknown = JSON.parse(paymentResponse.customData);

        if (!isCustomData(customData)) {
            throw new Error(
                INVALID_DATA(JSON.stringify(paymentResponse, null, 2)),
            );
        }

        return { ...paymentResponse, customData };
    }
}
