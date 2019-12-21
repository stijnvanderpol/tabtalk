import { throwIfLocalStorageUnavailable, generateUuid } from './utils';
import { TabtalkMessage, TabtalkMessageMeta, TabtalkMessageFactory } from './tabtalkMessageFactory';

export type TabtalkMessageEventCallback = <T = any>(message: TabtalkMessage<T>) => void;
export type TabtalkMessageEventHandler = (event: CustomEvent) => void;


export class Tabtalk {
    private id: string;
    private TABTALK_MESSAGE_KEY_PREFIX = 'TABTALK-';
    private TABTALK_MESSAGE_EVENT_NAME = 'TABTALK_MESSAGE_RECEIVED';
    private messageEventHandlersMap: {[key: string]: TabtalkMessageEventHandler} = {}
    private garbageCollectionDelay = 3000;

    constructor() {
        throwIfLocalStorageUnavailable();
        this.id = generateUuid();
        window.addEventListener('storage', this.onStorageUpdate);
    }
    
    /**
     * Permanently deactivates the Tabtalk instance by removing event handlers. Note that the event 
     * handlers of parallel instances of Tabtalk within the same browsing context will be affected as well.
     */
    destroy() {
        window.removeEventListener('storage', this.onStorageUpdate);
        this.unsubscribeAllEventHandlers();
    }
    
    getId = () => this.id;
    
    /**
     * Set the garbage collection delay. All messages will be deleted by their sender after this delay.
     * @param delay Time time in milliseconds between sending and garbage collection.
     */
    setGarbageCollectionDelay = (delay: number) => {
        this.garbageCollectionDelay = delay;
    }
    
    /**
     * Adds a Tabtalk message event handler with the passed callback.
     */
    subscribe = (callback: TabtalkMessageEventCallback) => {
        if(!callback) {
            console.warn('[tabtalk] falsy callback passed.');
            return;
        }

        const handler = this.createTabtalkMessageEventHandler(callback);
        this.messageEventHandlersMap[callback.toString()] = handler;

        window.addEventListener(this.TABTALK_MESSAGE_EVENT_NAME, handler);
    }
    
    /**
     * Removes the Tabtalk message event handler that belongs to the passed callback. 
     * If no callback is passed it will remove all the Tabtalk message event handlers.
     * 
     * @param callbackToUnsubscribe (optional) The callback of the event listener to remove.
     */
    unsubscribe = (callbackToUnsubscribe?: TabtalkMessageEventCallback) => {
        if (callbackToUnsubscribe) {
            const handler = this.messageEventHandlersMap[callbackToUnsubscribe.toString()];
            window.removeEventListener(this.TABTALK_MESSAGE_EVENT_NAME, handler);
            delete this.messageEventHandlersMap[callbackToUnsubscribe.toString()];
        } else {
            this.unsubscribeAllEventHandlers();
        }
    }

    private unsubscribeAllEventHandlers = () => {
        Object.keys(this.messageEventHandlersMap).forEach(key => {
            const handler = this.messageEventHandlersMap[key];
            window.removeEventListener(this.TABTALK_MESSAGE_EVENT_NAME, handler);
        });

        this.messageEventHandlersMap = {};
    }

    private createTabtalkMessageEventHandler = (callback: TabtalkMessageEventCallback): TabtalkMessageEventHandler => {
        return (event) => callback(event.detail);
    }
    
    /**
     * Handles storage events that are caused by Tabtalk and transmits the serialized message if necessary.
     */
    private onStorageUpdate = (event: StorageEvent) => {
        const { key, newValue: value } = event;

        if (this.isTabtalkMessage(key) && !this.isMessageBeingDeleted(value)) {
            const message = this.deserializeMessage(value);

            if (this.isMessageAddressedToMe(message) || this.isMessageAddressedToEveryone(message)) {
                const event = new CustomEvent(this.TABTALK_MESSAGE_EVENT_NAME, { detail: message });
                window.dispatchEvent(event);    
            }
        }
    }
    
    /**
     * Deserializes a JSON string to a TabtalkMessage object.
     */
    private deserializeMessage = (message: string): TabtalkMessage<any> => {
        try {
            return JSON.parse(message);
        } catch(e) {
            throw new Error(`[tabtalk] could not deserialize message contents: ${e}`);
        }
    }
    
    /**
     * Sends a message to all Tabtalk instances.
     */
    broadcast = (body: any) => {
        this.sendMessage(null, body);
    }
    
    /**
     * Sends a message to a specific Tabtalk instance.
     */
    sendMessage = (recipientId: TabtalkMessageMeta['recipientId'] = null, body: any ) => {
        throwIfLocalStorageUnavailable();

        const factory = new TabtalkMessageFactory();
        factory.setSenderId(this.id);
        factory.setRecipientId(recipientId);
        factory.setBody(body);
        
        const messageKey = this.generateMessageKey(this.id);
        const serializedMessage = JSON.stringify(factory.build());
        
        window.localStorage.setItem(messageKey, serializedMessage);
        setTimeout(() => this.clearMessage(messageKey), this.garbageCollectionDelay);
    }
    
    /**
     * Removes all Tabtalk messages from local storage that are due for garbage collection.
     */
    garbageCollect = () => {
        const tabtalkMessageKeys = this.getAllTabtalkMessageKeys();

        tabtalkMessageKeys.forEach(tabtalkMessageKey => {
            const message = localStorage.getItem(tabtalkMessageKey);
            if (message) {
                const deserializedMessage = this.deserializeMessage(message);

                if (this.isMessageDueForGarbageCollection(deserializedMessage)) {
                    localStorage.removeItem(tabtalkMessageKey);
                }
            };
        });
    }

    private getAllTabtalkMessageKeys = () => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (this.isTabtalkMessage(key)) {
                keys.push(key);
            }
        }

        return keys;
    }
    
    /**
     * Removes a Tabtalk message from the local storage.
     */
    private clearMessage = (messageKey: string) => {
        throwIfLocalStorageUnavailable();
        localStorage.removeItem(messageKey);
    }

    private generateMessageKey = (senderId: string) => {
        return `${this.TABTALK_MESSAGE_KEY_PREFIX}${senderId}-${Date.now()}`;
    }
    
    private isTabtalkMessage = (storageEventKey: string) => storageEventKey.match(new RegExp(`^${this.TABTALK_MESSAGE_KEY_PREFIX}`));
    private isMessageAddressedToMe = (message: TabtalkMessage<any>) => message.meta.recipientId === this.id;
    private isMessageAddressedToEveryone = (message: TabtalkMessage<any>) => message.meta.recipientId === null;
    private isMessageBeingDeleted = (serializedMessage: string | null) => !serializedMessage;
    private isMessageDueForGarbageCollection = (message: TabtalkMessage<any>) => message.meta.createdAt < (Date.now() - this.garbageCollectionDelay);
}