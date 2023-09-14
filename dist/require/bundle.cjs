'use strict';

var node_child_process = require('node:child_process');
var fs = require('node:fs/promises');
var node_path = require('node:path');
var node_stream = require('node:stream');

/*!
 * Shell Utils
 * @author amekusa
 */


const sh = {

	/**
	 * Executes the given shell command, and returns a Promise that resolves the stdout
	 * @param {string} cmd
	 * @param {object} [opts]
	 * @return {Promise}
	 */
	exec(cmd, opts = {}) {
		opts = Object.assign({
			dryRun: false,
		}, opts);
		return new Promise((resolve, reject) => {
			if (opts.dryRun) {
				console.log(`[DRYRUN] ${cmd}`);
				return resolve();
			}
			node_child_process.exec(cmd, (err, stdout, stderr) => {
				if (err) reject(stderr);
				resolve(stdout);
			});
		});
	},

	/**
	 * Converts the given objects to shell arguments in a string form
	 * @param {object} args
	 * @param {object} [opts]
	 * @return {string}
	 */
	args(args, opts = {}) {
		opts = Object.assign({
			sep: ' ', // key-value separator
		}, opts);
		let r = [];
		for (let key in args) {
			let value = args[key];
			switch (typeof value) {
			case 'boolean':
				r.push(key);
				break;
			case 'number':
				r.push(key + opts.sep + value);
				break;
			case 'string':
				r.push(key + opts.sep + `"${value}"`);
				break;
			}
		}
		return r.join(' ');
	},

};

/*!
 * I/O Utils
 * @author amekusa
 */


const io = {

	/**
	 * Deletes the contents of the given directory
	 * @return {Promise}
	 */
	clean(dir, pattern, depth = 1) {
		return sh.exec(`find '${dir}' -type f -name '${pattern}' -maxdepth ${depth} -delete`);
	},

	/**
	 * Deletes the given file or directory
	 * @param {string} file
	 * @return {Promise}
	 */
	rm(file) {
		return fs.rm(file, { force: true, recursive: true });
	},

	/**
	 * Copies the given file(s) to another directory
	 * @param {string|object|string[]|object[]} src
	 * @param {string} dst Base destination directory
	 * @return {Promise}
	 */
	copy(src, dst) {
		let tasks = [];
		(Array.isArray(src) ? src : [src]).forEach(item => {
			let _src, _dst;
			switch (typeof item) {
			case 'object':
				_src = item.src;
				_dst = item.dst;
				break;
			case 'string':
				_src = item;
				break;
			default:
				throw 'invalid type';
			}
			_dst = node_path.join(dst, _dst || node_path.basename(_src));
			tasks.push(
				fs.mkdir(node_path.dirname(_dst), { recursive: true })
				.then(fs.copyFile(_src, _dst))
			);
		});
		return Promise.all(tasks);
	},

};

/**
 * Stream Utils
 */
io.stream = {

	/**
	 * Returns a Transform stream object with the given function as its transform() method.
	 * `fn` must return a string which is to be the new content, or a Promise which resolves a string.
	 *
	 * @example
	 * return gulp.src(src)
	 *   .pipe(modify((data, enc) => {
	 *     // do stuff
	 *     return newData;
	 *   }));
	 *
	 * @param {function} fn
	 * @return {Transform}
	 */
	modify(fn) {
		return new node_stream.Transform({
			objectMode: true,
			transform(file, enc, done) {
				let r = fn(file.contents.toString(enc), enc);
				if (r instanceof Promise) {
					r.then(modified => {
						file.contents = Buffer.from(modified, enc);
						this.push(file);
						done();
					});
				} else {
					file.contents = Buffer.from(r, enc);
					this.push(file);
					done();
				}
			}
		});
	},

};

var main = {
	sh,
	io,
};

module.exports = main;
//# sourceMappingURL=bundle.cjs.map
