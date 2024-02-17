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
			let args, expect;
			if (Array.isArray(c)) {
				args = c[0];
				expect = c[1];
			} else {
				args = c.args;
				expect = c.expect;
			}
			it(title, () => {
				assertFn(fn(...args), expect);
			});
		}
		describe(fn.displayName || fn.name, () => {
			if (Array.isArray(cases)) {
				for (let i = 0; i < cases.length; i++) {
					testCase(cases[i], `#${i} ${args.join(', ')}`);
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
