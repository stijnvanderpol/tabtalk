import { Tabtalk } from './tabtalk';

describe('Tabtalk', () => {
    describe('init', () => {

        // todo: add a test that verifies the app throws an error on unavailable session storage

        it('does not throw an error if the session storage api is available', () => {
            const tabtalk = new Tabtalk();
            expect(() => tabtalk.init()).not.toThrow();
        });

        it('sets a uuid after being initialized', () => {
            const tabtalk = new Tabtalk();

            expect(tabtalk.getId()).toBeUndefined();
            tabtalk.init();

            expect(tabtalk.getId()).not.toBeUndefined();
            expect(typeof tabtalk.getId()).toEqual('string');
        });
    });
});