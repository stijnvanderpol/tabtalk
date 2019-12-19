import { throwIfLocalStorageUnavailable, generateUuid } from './utils';

export class Tabtalk {
    private id: string;
    private TABTALK_WINDOW_OBJECT_PROPERTY_KEY = 'tabtalk';
    
    init() {
        throwIfLocalStorageUnavailable();
        this.id = generateUuid();
        
        // @ts-ignore implicit any is acceptable here
        window[this.TABTALK_WINDOW_OBJECT_PROPERTY_KEY] = this;        
    }

    destroy() {
        // @ts-ignore implicit any type is acceptable in this situation
        delete window[this.TABTALK_WINDOW_OBJECT_PROPERTY_KEY];
    }

    getId = () => this.id;
}