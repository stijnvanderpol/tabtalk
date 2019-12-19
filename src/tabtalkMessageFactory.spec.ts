import { TabtalkMessageFactory, VALIDATION_ERROR_INVALID_SENDER_ID } from './tabtalkMessageFactory';
import { generateUuid } from './utils';

describe('TabtalkMessageFactory', () => {
    it('throws if no sender id has been provided', () => {
        let thrownError: Error;
        const factory = new TabtalkMessageFactory();

        factory.setBody({});
        factory.setRecipientId(generateUuid());
        
        try {
            factory.build();
        } catch(error) {
            thrownError = error;
        }

        expect(thrownError).not.toBeUndefined();
        expect(thrownError.message).toContain(VALIDATION_ERROR_INVALID_SENDER_ID);
        expect(VALIDATION_ERROR_INVALID_SENDER_ID).not.toBeFalsy();
    });

    it('returns a TabtalkMessage with the correct properties', () => {
        const bodyStub = {foo: 'bar'};
        const recipientIdStub = generateUuid();
        const senderIdStub = generateUuid();

        const factory = new TabtalkMessageFactory();

        factory.setBody(bodyStub);
        factory.setRecipientId(recipientIdStub);
        factory.setSenderId(senderIdStub);

        expect(factory.build()).toStrictEqual({
            body: bodyStub,
            meta: {
                recipientId: recipientIdStub,
                senderId: senderIdStub
            }
        });
    });
});