import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test, io} from '../src/main.js';
const {testFn} = test;

testFn(io.untilde, {
	'~': {
		args: ['~', 'Home'],
		return: 'Home'
	},
	'~/foo': {
		args: ['~/foo', 'Home'],
		return: 'Home/foo'
	},
	'foo': {
		args: ['foo', 'Home'],
		return: 'foo'
	}
});

