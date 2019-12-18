import { Tabtalk } from './tabtalk';
import { stub } from 'sinon';

describe('Tabtalk', () => {
    describe('init', () => {
        it('throws if the session storage api is not available', () => {
            const sessionStorageStub = stub(window, 'sessionStorage').value(undefined);
            const tabtalk = new Tabtalk();

            expect(() => tabtalk.init()).toThrow();
            sessionStorageStub.restore();
        });
    });
});