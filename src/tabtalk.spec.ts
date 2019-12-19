import { Tabtalk } from './tabtalk';

describe('Tabtalk', () => {
    describe('init', () => {
        let tabtalk: Tabtalk;
        
        afterEach(() => {
            if (tabtalk) {
                tabtalk.destroy();
            }
        });

        // todo: add a test that verifies the app throws an error on unavailable session storage

        it('does not throw an error if the session storage api is available', () => {
            tabtalk = new Tabtalk();
            expect(() => tabtalk.init()).not.toThrow();
        });

        it('sets a uuid after being initialized', () => {
            tabtalk = new Tabtalk();

            expect(tabtalk.getId()).toBeUndefined();
            tabtalk.init();

            expect(tabtalk.getId()).not.toBeUndefined();
            expect(typeof tabtalk.getId()).toEqual('string');
        });

        it('adds the tabtalk instance as a property to the window object after initializing', () => {
            tabtalk = new Tabtalk();
            
            // @ts-ignore implicit any type is acceptable here
            expect(window[tabtalk.TABTALK_WINDOW_OBJECT_PROPERTY_KEY]).toBeUndefined();

            tabtalk.init();            
            // @ts-ignore implicit any type is acceptable here
            expect(window[tabtalk.TABTALK_WINDOW_OBJECT_PROPERTY_KEY]).toStrictEqual(tabtalk);
        });
    });
});