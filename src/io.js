import fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import {join, basename, dirname, isAbsolute} from 'node:path';
import {Transform} from 'node:stream';
import {exec} from './sh.js';

/*!
 * I/O Utils
 * @author amekusa
 */

/**
 * Searchs the given file path in the given directories.
 * @param {string} file - File to find
 * @param {string[]} dirs - Array of directories to search
 * @param {object} [opts] - Options
 * @return {string|boolean} found file path, or false if not found
 */
export function find(file, dirs = [], opts = {}) {
	let {allowAbsolute = true} = opts;
	if (allowAbsolute && isAbsolute(file)) return fs.existsSync(file) ? file : false;
	for (let i = 0; i < dirs.length; i++) {
		let find = join(dirs[i], file);
		if (fs.existsSync(find)) return find;
	}
	return false;
}

/**
 * Deletes the contents of the given directory.
 * @return {Promise}
 */
export function clean(dir, pattern, depth = 1) {
	return exec(`find '${dir}' -type f -name '${pattern}' -maxdepth ${depth} -delete`);
}

/**
 * Deletes the given file or directory.
 * @param {string} file
 * @return {Promise}
 */
export function rm(file) {
	return fsp.rm(file, {recursive: true, force: true});
}

/**
 * Deletes the given file or directory synchronously.
 * @param {string} file
 */
export function rmSync(file) {
	return fs.rmSync(file, {recursive: true, force: true});
}

/**
 * Copies the given file(s) to another directory
 * @param {string|object|string[]|object[]} src
 * @param {string} dst Base destination directory
 * @return {Promise}
 */
export function copy(src, dst) {
	return Promise.all((Array.isArray(src) ? src : [src]).map(item => {
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
		return fsp.mkdir(dirname(_dst), {recursive: true}).then(fsp.copyFile(_src, _dst));
	}));
}

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
export function modifyStream(fn) {
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
}

export default {
	find,
	clean,
	rm,
	copy,
	modifyStream,
};

