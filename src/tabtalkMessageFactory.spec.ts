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

    it('sets the createdAt property to the current epoch time within a 10ms second margin', () => {
        const factory = new TabtalkMessageFactory();
        factory.setBody({foo: 'bar'});
        factory.setRecipientId(generateUuid());
        factory.setSenderId(generateUuid());
        
        const { createdAt } = factory.build().meta;

        const now = Date.now();
        const oneSecondBeforeNow = now - 5;
        const oneSecondAfterNow = now + 5;
        
        expect(oneSecondBeforeNow <= createdAt).toBeTruthy();
        expect(oneSecondAfterNow >= createdAt).toBeTruthy();
    });

    it('returns a TabtalkMessage with the correct properties', () => {
        const bodyStub = {foo: 'bar'};
        const recipientIdStub = generateUuid();
        const senderIdStub = generateUuid();

        const factory = new TabtalkMessageFactory();

        factory.setBody(bodyStub);
        factory.setRecipientId(recipientIdStub);
        factory.setSenderId(senderIdStub);

        const { body, meta } = factory.build();

        expect(body).toEqual(bodyStub);
        expect(meta.recipientId).toEqual(recipientIdStub);
        expect(meta.senderId).toEqual(senderIdStub);
        expect(meta.createdAt).not.toBeFalsy();
    });
});