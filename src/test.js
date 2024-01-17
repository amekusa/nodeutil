/*!
 * Test Utils
 * @author amekusa
 */

import assert from 'node:assert';

const test = {

	/**
	 * @param {function} fn
	 * @param {Array|object} tests
	 * @param {string|function} [assertFn]
	 */
	testFn(fn, tests, assertFn = 'equal') {
		if (typeof assertFn == 'string') {
			if (!(assertFn in assert)) throw `no such method in assert as '${assertFn}'`;
			assertFn = assert[assertFn];
		}
		describe(fn.displayName || fn.name, () => {
			if (Array.isArray(tests)) {
				for (let i = 0; i < tests.length; i++) {
					let t = tests[i];
					it(`#${i} ${t[0].join(', ')}`, () => {
						assertFn(fn(...t[0]), t[1]);
					});
				}
			} else {
				let keys = Object.keys(tests);
				for (let i = 0; i < keys.length; i++) {
					let t = tests[keys[i]];
					it(`#${i} ${keys[i]}`, () => {
						assertFn(fn(...t[0]), t[1]);
					});
				}
			}
		});
	},

	/**
	 * @param {object} obj
	 * @param {string} method
	 * @param {Array|object} tests
	 * @param {string} [assertFn]
	 */
	testMethod(obj, method, ...args) {
		let className = obj.constructor.name;
		if (!(method in obj)) throw `no such method in ${className} as '${method}`;
		let fn = obj[method].bind(obj);
		fn.displayName = `${className}::${method}`;
		test.testFn(fn, ...args);
	},

};

export default test;
