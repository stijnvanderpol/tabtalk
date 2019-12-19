import { throwIfLocalStorageUnavailable, generateUuid } from './utils';

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
}