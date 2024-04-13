import assert from 'node:assert';
const merge = Object.assign;

/*!
 * Test Utils
 * @author amekusa
 */

class InvalidTest extends Error {
}

function invalid(...args) {
	throw new InvalidTest(...args);
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

function assertType(value, type, msg = '') {
	try {
		if (typeof type == 'string') assert.equal(typeof value, type);
		else assert.ok(value instanceof type);
	} catch (e) {
		if (msg) e.message = msg + '\n' + e.message;
		throw e;
	}
}

/**
 * @param {function} fn
 * @param {Array|object} cases
 * @param {string|function} [assertFn]
 */
export function testFn(fn, cases, opts = {}) {
	let testCase = (c, title) => {
		it(title, () => {
			if (typeof c != 'object') invalid(`a test case must be an object`);
			// ---- call function ----
			let r;
			let args = [];
			if ('args' in c) { // args to pass
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
			}
			r = fn(...args);
			// ---- check ----
			if ('returnType' in c) { // check return type
				assertType(r, c.returnType, `return type failed`);
			}
			if ('return' in c) { // check return
				assertEqual(r, c.return, merge({msg: `return value failed`}, opts));
			}
			if ('test' in c) { // custom test
				if (typeof c.test != 'function') invalid(`'test' must be a function`);
				c.test(r);
			}
		});
	};
	describe(fn.displayName || fn.name, () => {
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
 * @param {string} method - Method name
 * @param {object|object[]} cases - Cases
 * @param {object} [opts] - Options
 */
export function testMethod(construct, method, cases, opts = {}) {
	let testCase = (c, title) => {
		it(title, () => {
			if (typeof c != 'object') invalid(`a test case must be an object`);
			// ---- instantiate ----
			let obj;
			let initArgs = [];
			if ('initArgs' in c) {
				if (!Array.isArray(c.initArgs)) invalid(`'initArgs' must be an array`);
				initArgs = c.initArgs;
			}
			try {
				obj = new construct(...initArgs);
			} catch (e) {
				obj = construct(...initArgs);
			}
			// ---- call method ----
			let r;
			let args = [];
			if ('args' in c) { // args to pass
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
			}
			if (opts.static) { // call method statically
				let {constructor} = obj;
				if (!constructor) invalid(`invalid constructor`);
				if (!(method in constructor)) invalid(`no such method as '${method}`);
				r = constructor[method](...args);
			} else {
				if (!(method in obj)) invalid(`no such method as '${method}`);
				r = obj[method](...args);
			}
			// ---- check ----
			if ('returnType' in c) { // check return type
				assertType(r, c.returnType, `return type failed`);
			}
			if ('return' in c) { // check return value
				assertEqual(r, c.return, merge({msg: `return failed`}, opts));
			}
			if ('props' in c) { // check properties
				for (let k in c.props) {
					let v = c.props[k];
					if (!(k in obj)) assert.fail(`no such property as '${k}'`);
					assertEqual(obj[k], v, merge({msg: `property '${k}' failed`}, opts));
				}
			}
			if ('test' in c) { // custom test
				if (typeof c.test != 'function') invalid(`'test' must be a function`);
				c.test({return: r, instance: obj});
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
		it(title, () => {
			let obj;
			let args = [];
			if ('args' in c) {
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
			}
			try {
				obj = new construct(...args);
			} catch (e) {
				obj = construct(...args);
			}
			if ('props' in c) { // check properties
				for (let k in c.props) {
					let v = c.props[k];
					if (!(k in obj)) assert.fail(`no such property as '${k}'`);
					assertEqual(obj[k], v, merge({msg: `property '${k}' failed`}, opts));
				}
			}
			if ('test' in c) { // custom test
				if (typeof c.test != 'function') invalid(`'test' must be a function`);
				c.test(obj);
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

