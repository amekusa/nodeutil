/**
 * Rollup Config
 *
 * Use with:
 *   rollup -c
 */

import {env} from 'node:process';
import rNode from '@rollup/plugin-node-resolve';

const output = {
	name: 'nodeutil',
	sourcemap: env.NODE_ENV != 'production',
	indent: false,
};

export default {
	input: 'src/main.js',
	output: [
		{
			file: 'dist/import/bundle.js',
			format: 'es',
			...output
		},
		{
			file: 'dist/require/bundle.cjs',
			format: 'cjs',
			...output
		},
	],
	treeshake: true,
	plugins: [
		rNode({ // support importing npm packages
			browser: false,
		}),
	],
};
