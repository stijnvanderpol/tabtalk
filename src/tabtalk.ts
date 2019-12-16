import { throwIfSessionStorageUnavailable } from './utils';

export class Tabtalk {
    init() {
        throwIfSessionStorageUnavailable();
    }
}