import { throwIfLocalStorageUnavailable, generateUuid } from './utils';
import { TabtalkMessageMeta, TabtalkMessageFactory } from './tabtalkMessageFactory';

export class Tabtalk {
    private id: string;
    private TABTALK_WINDOW_OBJECT_PROPERTY_KEY = 'tabtalk';
    private TABTALK_MESSAGE_KEY_PREFIX = 'TABTALK-';
    private TABTALK_MESSAGE_EVENT_NAME = 'TABTALK_MESSAGE_RECEIVED';
    
    init() {
        throwIfLocalStorageUnavailable();
        this.id = generateUuid();
        
        // @ts-ignore implicit any is acceptable here
        window[this.TABTALK_WINDOW_OBJECT_PROPERTY_KEY] = this;   
        
        window.addEventListener('storage', this.onStorageUpdate);
    }

    destroy() {
        // @ts-ignore implicit any type is acceptable in this situation
        delete window[this.TABTALK_WINDOW_OBJECT_PROPERTY_KEY];
    }

    getId = () => this.id;

    private onStorageUpdate = (event: StorageEvent) => {
        const { key, newValue: value } = event;
        const isTabtalkMessage = key.match(new RegExp(`^${this.TABTALK_MESSAGE_KEY_PREFIX}`));

        if (isTabtalkMessage) {
            const event = new CustomEvent(this.TABTALK_MESSAGE_EVENT_NAME, { detail: value });
            window.dispatchEvent(event);    
        }
    }
    
    sendMessage = (recipientId: TabtalkMessageMeta['recipientId'] = null, body: any ) => {
        throwIfLocalStorageUnavailable();

        const factory = new TabtalkMessageFactory();
        factory.setSenderId(this.id);
        factory.setRecipientId(recipientId);
        factory.setBody(body);

        const serializedMessage = JSON.stringify(factory.build());
        
        window.localStorage.setItem(this.generateMessageKey(this.id), serializedMessage);
    }

    private generateMessageKey = (senderId: string) => {
        return `${this.TABTALK_MESSAGE_KEY_PREFIX}${senderId}-${Date.now()}`;
    }
}