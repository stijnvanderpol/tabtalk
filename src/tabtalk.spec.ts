import { Tabtalk } from './tabtalk';

describe('Tabtalk', () => {
    describe('init', () => {

        // todo: add a test that verifies the app throws an error on unavailable session storage

        it('does not throw an error if the session storage api is available', () => {
            expect(() => new Tabtalk()).not.toThrow();
        });

        it('sets a uuid after being initialized', () => {
            const tabtalk = new Tabtalk();

            expect(tabtalk.getId()).not.toBeUndefined();
            expect(typeof tabtalk.getId()).toEqual('string');
        });
    });

    describe('garbageCollect', () => {
        it('removes all tabtalk messages that are due for garbage collection', (finish) => {
            const tabtalk = new Tabtalk();
            
            // Set the initial garbage collection delay to 10s to prevent automatic
            // garbage collection.
            tabtalk.setGarbageCollectionDelay(10000);
            
            tabtalk.broadcast({message: 'some arbitrary message'});
            tabtalk.broadcast({message: 'some arbitrary message'});
            
            setTimeout(() => {
                tabtalk.broadcast({message: 'some arbitrary message'});
                
                // Set garbage collection delay to 500ms so that every message that has 
                // existed for longer than 500ms will be considered due for garbage collection.
                tabtalk.setGarbageCollectionDelay(500);
                
                expect(localStorage.length).toEqual(3);
                tabtalk.garbageCollect();
                
                // The third message has not existed for longer than 500ms, so should not
                // be garbage collected.
                expect(localStorage.length).toEqual(1);
                finish();
            }, 1000);
        });
    })
});