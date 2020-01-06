import { expect } from 'chai';
import { DataProvider } from './getData';

describe('GetData', function () {
    let sut = new DataProvider();

    describe('parseWaitTime()', function () {
        it('should return parsed time in seconds', function () {
            expect(sut.parseWaitTime('test'), 'test').to.equal(null);
            expect(sut.parseWaitTime('0:NAN'), '0:NAN').to.equal(0);
            expect(sut.parseWaitTime('0:15'), '0:15').to.equal(15);
            expect(sut.parseWaitTime('1:15'), '1:15').to.equal(75);
            expect(sut.parseWaitTime('01:15'), '01:15').to.equal(75);
            expect(sut.parseWaitTime('0:01:15'), '0:01:15').to.equal(75);
            expect(sut.parseWaitTime('00:01:15'), '00:01:15').to.equal(75);
            expect(sut.parseWaitTime('01:01:15'), '01:01:15').to.equal(3675);
        });
    });
});