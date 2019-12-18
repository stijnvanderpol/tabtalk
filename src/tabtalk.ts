import { throwIfSessionStorageUnavailable, generateUuid } from './utils';

export class Tabtalk {
    private id: string;
    
    init() {
        throwIfSessionStorageUnavailable();
        this.id = generateUuid();
    }
}