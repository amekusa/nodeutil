/*!
 * Test Utils
 * @author amekusa
 */

import assert from 'node:assert';

const test = {

	/**
	 * @param {function} fn
	 * @param {Array|object} cases
	 * @param {string|function} [assertFn]
	 */
	testFn(fn, cases, assertFn = 'equal') {
		if (typeof assertFn == 'string') {
			if (!(assertFn in assert)) throw `no such method in assert as '${assertFn}'`;
			assertFn = assert[assertFn];
		}
		let testCase = (c, title) => {
			let args, ret;
			if (Array.isArray(c)) {
				args = c[0];
				ret = c[1];
			} else {
				args = c.args;
				ret = c.return;
			}
			it(title, () => {
				assertFn(fn(...args), ret);
			});
		}
		describe(fn.displayName || fn.name, () => {
			if (Array.isArray(cases)) {
				for (let i = 0; i < cases.length; i++) {
					testCase(cases[i], `#${i} ${cases[i][0].join(', ')}`);
				}
			} else {
				let keys = Object.keys(cases);
				for (let i = 0; i < keys.length; i++) {
					testCase(cases[keys[i]], `#${i} ${keys[i]}`);
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

export const {
	testFn,
	testMethod,
} = test;
export default test;
