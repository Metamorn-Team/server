import {
    Body,
    Get,
    Headers,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { PaymentsService } from 'src/domain/services/payments/payments.service';
import { PaymentReader } from 'src/domain/components/payments/payment-reader';
import { GetPaymentStatusResponse } from 'src/presentation/dto/payments/response/get-payment-status.response';
import { PortOnePaymentMapper } from 'src/infrastructure/payment/port-one-payment-wrapper';
import { PortOneWebhookVerifier } from 'src/infrastructure/payment/port-one-webhook-verifier';
import { CreatePaymentRequest } from 'src/presentation/dto/payments/request/create-payment.request';
import { PaymentWriter } from 'src/domain/components/payments/payment-writer';
import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@LivislandController('payments', false)
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly paymentReader: PaymentReader,
        private readonly paymentWriter: PaymentWriter,
        private readonly paymentVerifier: PortOneWebhookVerifier,
    ) {}

    @ApiOperation({
        summary: '결제 데이터 생성',
        description: '결제 중 상태의 결제 데이터를 생성한다.',
    })
    @ApiResponse({ status: 201, description: '생성 완료' })
    @UseGuards(AuthGuard)
    @Post()
    async start(
        @Body() dto: CreatePaymentRequest,
        @CurrentUser() userId: string,
    ) {
        await this.paymentWriter.createPendingPayment({
            ...dto,
            userId,
            type: PaymentProductTypesEnum[dto.type],
        });
    }

    @ApiOperation({
        summary: '포트원 결제 웹훅 전용 API',
        description: '결제 상태가 변경될 때마다 호출됨.',
    })
    @ApiResponse({ status: 201, description: '결제 완료 처리' })
    @Post('webhook')
    async webHook(
        @Body() body: object,
        @Headers() header: Record<string, string>,
    ) {
        // NOTE 여기서 외부 의존성 관련 처리를 다 해줘야 함.
        const bodyString = JSON.stringify(body);
        const payment = await this.paymentVerifier.verifyWebhook(
            bodyString,
            header,
        );
        if (!payment) {
            return;
        }
        const domainPayment = PortOnePaymentMapper.toDomain(payment);

        await this.paymentsService.completePayment(domainPayment);
    }

    @ApiOperation({
        summary: '결제 상태 조회',
        description:
            '특정 결제 건의 상태를 조회한다. (완료 확인 폴링으로 사용)',
    })
    @ApiResponse({
        status: 200,
        description: '결제 상태 조회 성공',
        type: GetPaymentStatusResponse,
    })
    @UseGuards(AuthGuard)
    @Get('status')
    async getPaymentStatus(
        @Query('merchantPaymentId', ParseUUIDPipe) merchantPaymentId: string,
    ): Promise<GetPaymentStatusResponse> {
        const status = await this.paymentReader.getStatus(merchantPaymentId);
        return { status };
    }
}
