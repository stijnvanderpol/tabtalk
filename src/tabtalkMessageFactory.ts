export interface TabtalkMessage<T> {
    body: T;
    meta: TabtalkMessageMeta;
}

export interface TabtalkMessageMeta {
    recipientId: string | null;
    senderId: string;
    createdAt: number;
}

export const VALIDATION_ERROR_INVALID_SENDER_ID = 'Invalid senderId';

export class TabtalkMessageFactory {
    body: any;
    recipientId: TabtalkMessageMeta['recipientId'];
    senderId: TabtalkMessageMeta['senderId'];
    createdAt: TabtalkMessageMeta['createdAt'];

    setBody = (body: any) => {
        this.body = body;
    }

    setRecipientId = (recipientId: TabtalkMessageMeta['recipientId']) => {
        this.recipientId = recipientId;
    }

    setSenderId = (senderId: TabtalkMessageMeta['senderId']) => {
        this.senderId = senderId;
    }

    throwIfInvalidMessageProperties = () => {
        const validationErrors: string[] = [];

        if (typeof this.senderId != 'string') {
            validationErrors.push(VALIDATION_ERROR_INVALID_SENDER_ID);
        }

        if (validationErrors.length) {
            throw new Error('[tabtalk] invalid Tabtalk message:' + validationErrors.join(', '));
        }
    }

    build = <T>(): TabtalkMessage<T> => {
        this.throwIfInvalidMessageProperties();

        return {
            body: this.body,
            meta: {
                recipientId: this.recipientId,
                senderId: this.senderId,
                createdAt: Date.now()
            }
        }
    };
}