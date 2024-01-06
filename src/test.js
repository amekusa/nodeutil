/*!
 * Test Utils
 * @author amekusa
 */

import assert from 'node:assert';

const $ = {

	/**
	 * @param {function} fn
	 * @param {Array|object} tests
	 * @param {string} [assertFn]
	 */
	testFn(fn, tests, assertFn = 'equal') {
		if (!(assertFn in assert)) throw `no such method in assert as '${assertFn}'`;
		describe(fn.displayName || fn.name, () => {
			for (let i in tests) {
				it(`${i}`, () => {
					assert[assertFn](fn(...tests[i][0]), tests[i][1]);
				});
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
		$.testFn(fn, ...args);
	},

};

export default $;
