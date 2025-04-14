export class ChatMessageEntity {
    constructor(
        readonly id: string,
        readonly senderId: string,
        readonly type: string,
        readonly contextId: string,
        readonly message: string,
        readonly sentAt: Date,
    ) {}

    static create(
        input: {
            senderId: string;
            type: string;
            contextId: string;
            message: string;
        },
        idGen: () => string,
        stdDate: Date,
    ): ChatMessageEntity {
        return new ChatMessageEntity(
            idGen(),
            input.senderId,
            input.type,
            input.contextId,
            input.message,
            stdDate,
        );
    }
}
