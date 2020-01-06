import { expect } from 'chai';
import { stringifyValue, stringifyTagValue } from "./influx";

describe('Influx', function () {
    describe('stringifyTagValue()', function () {
        it('should return correctly escaped values', function () {
            expect(stringifyTagValue('test')).to.equal('test');
            expect(stringifyTagValue('test mit space')).to.equal('test\\ mit\\ space');
            expect(stringifyTagValue('test,mit,komma')).to.equal('test\\,mit\\,komma');
            expect(stringifyTagValue('test=mit=gleich')).to.equal('test\\=mit\\=gleich');
        });
    });
    describe('stringifyValue()', function () {
        it('should return correctly escaped values', function () {
            expect(stringifyValue('test')).to.equal('"test"');
            expect(stringifyValue('test a')).to.equal('"test a"');
            expect(stringifyValue('test,a')).to.equal('"test,a"');
            expect(stringifyValue('test=a')).to.equal('"test=a"');
            expect(stringifyValue('test\\a')).to.equal('"test\\\\a"');
            expect(stringifyValue('test"a')).to.equal('"test\\"a"');
        });
    });
});