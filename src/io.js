/*!
 * I/O Utils
 * @author amekusa
 */

import fs from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { Transform } from 'node:stream';

import sh from './sh.js';

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
			_dst = join(dst, _dst || basename(_src));
			tasks.push(
				fs.mkdir(dirname(_dst), { recursive: true })
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
		return new Transform({
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

export default io;
