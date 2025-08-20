export interface ChatMessagePrototype {
    readonly senderId: string;
    readonly type: string;
    readonly contextId: string;
    readonly message: string;
}

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
        prototype: ChatMessagePrototype,
        idGen: () => string,
        stdDate = new Date(),
    ): ChatMessageEntity {
        return new ChatMessageEntity(
            idGen(),
            prototype.senderId,
            prototype.type,
            prototype.contextId,
            prototype.message,
            stdDate,
        );
    }
}
