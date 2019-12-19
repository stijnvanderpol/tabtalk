import { throwIfLocalStorageUnavailable, generateUuid } from './utils';
import { TabtalkMessage, TabtalkMessageMeta, TabtalkMessageFactory } from './tabtalkMessageFactory';

export type TabtalkMessageEventCallback = <T = any>(message: TabtalkMessage<T>) => void;
export type TabtalkMessageEventHandler = (event: CustomEvent) => void;


export class Tabtalk {
    private id: string;
    private TABTALK_WINDOW_OBJECT_PROPERTY_KEY = 'tabtalk';
    private TABTALK_MESSAGE_KEY_PREFIX = 'TABTALK-';
    private TABTALK_MESSAGE_EVENT_NAME = 'TABTALK_MESSAGE_RECEIVED';
    private messageEventHandlersMap: {[key: string]: TabtalkMessageEventHandler} = {}
    
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

        if (this.isTabtalkMessage(key)) {
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

        const serializedMessage = JSON.stringify(factory.build());
        
        window.localStorage.setItem(this.generateMessageKey(this.id), serializedMessage);
    }

    private generateMessageKey = (senderId: string) => {
        return `${this.TABTALK_MESSAGE_KEY_PREFIX}${senderId}-${Date.now()}`;
    }
    
    private isTabtalkMessage = (storageEventKey: string) => storageEventKey.match(new RegExp(`^${this.TABTALK_MESSAGE_KEY_PREFIX}`));
    private isMessageAddressedToMe = (message: TabtalkMessage<any>) => message.meta.recipientId === this.id;
    private isMessageAddressedToEveryone = (message: TabtalkMessage<any>) => message.meta.recipientId === null;
}