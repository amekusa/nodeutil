import assert from 'node:assert';

/*!
 * Test Utils
 * @author amekusa
 */

class InvalidTest extends Error {
}

function assertEqual(actual, expected, opts = {}) {
	let equal, deepEqual;
	if (opts.strict) {
		equal = assert.strictEqual;
		deepEqual = assert.deepStrictEqual;
	} else {
		equal = assert.equal;
		deepEqual = assert.deepEqual;
	}
	try {
		if (expected) {
			switch (typeof expected) {
			case 'object':
				let proto = Object.getPrototypeOf(expected);
				if (proto === Object.prototype || proto === Array.prototype)
					return deepEqual(actual, expected);
				return equal(actual, expected);
			}
		}
		return equal(actual, expected);
	} catch (e) {
		if (opts.msg) e.message = opts.msg + '\n' + e.message;
		throw e;
	}
}

/**
 * @param {function} fn
 * @param {Array|object} cases
 * @param {string|function} [assertFn]
 */
export function testFn(fn, cases, assertFn = 'equal') {
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
	};
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
}

/**
 * @param {function} construct - Constructor or function that returns an instance
 * @param {string} method - Method name
 * @param {object|object[]} cases - Cases
 * @param {object} [opts] - Options
 */
export function testMethod(construct, method, cases, opts = {}) {
	let testCase = (c, title) => {
		let obj;
		try {
			obj = ('initArgs' in c) ? new construct(...c.initArgs) : new construct();
		} catch (e) {
			obj = ('initArgs' in c) ? construct(...c.initArgs) : construct();
		}
		if (!(method in obj)) throw `no such method as '${method}`;
		it(title, () => {
			let r = obj[method](...c.args);
			if ('return' in c) { // check return value
				assertEqual(r, c.return, Object.assign(opts, {msg: `return failed`}));
			}
			if ('props' in c) { // check properties
				for (let k in c.props) {
					let v = c.props[k];
					if (!(k in obj)) assert.fail(`no such property as '${k}'`);
					assertEqual(obj[k], v, Object.assign(opts, {msg: `property '${k}' failed`}));
				}
			}
		});
	};
	describe(construct.name + ' :: ' + method, () => {
		if (Array.isArray(cases)) {
			for (let i = 0; i < cases.length; i++) {
				let c = cases[i];
				let title = `#${i}`;
				if (Array.isArray(c.args)) title += ' ' + c.args.join(', ');
				testCase(c, title);
			}
		} else {
			let keys = Object.keys(cases);
			for (let i = 0; i < keys.length; i++) {
				testCase(cases[keys[i]], `#${i} ${keys[i]}`);
			}
		}
	});
}

/**
 * @param {function} construct - Constructor or function that returns an instance
 * @param {object|object[]} cases - Cases
 * @param {object} [opts] - Options
 */
export function testInstance(construct, cases, opts = {}) {
	let testCase = (c, title) => {
		let obj;
		try {
			obj = ('args' in c) ? new construct(...c.args) : new construct();
		} catch (e) {
			obj = ('args' in c) ? construct(...c.args) : construct();
		}
		it(title, () => {
			if ('props' in c) { // check properties
				for (let k in c.props) {
					let v = c.props[k];
					if (!(k in obj)) assert.fail(`no such property as '${k}'`);
					assertEqual(obj[k], v, Object.assign(opts, {msg: `property '${k}' failed`}));
				}
			}
			if ('test' in c) { // custom test
				if ('testArgs' in c) {
					if (!Array.isArray(c.testArgs)) throw `invalid test case: 'testArgs' must be an array`;
					c.test(obj, ...c.testArgs);
				} else {
					c.test(obj);
				}
			}
		});
	};
	describe(construct.name, () => {
		if (Array.isArray(cases)) {
			for (let i = 0; i < cases.length; i++) {
				let c = cases[i];
				let title = `#${i}`;
				if (Array.isArray(c.args)) title += ' ' + c.args.join(', ');
				testCase(c, title);
			}
		} else {
			let keys = Object.keys(cases);
			for (let i = 0; i < keys.length; i++) {
				testCase(cases[keys[i]], `#${i} ${keys[i]}`);
			}
		}
	});
}

export default {
	InvalidTest,
	testFn,
	testMethod,
	testInstance,
};

