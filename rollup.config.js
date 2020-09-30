import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'


/**
 * 缺少动态引入
 * 合并成一个文件太大，不可控
 */
export default {
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
    interop: false,
    exports: 'auto'
  },
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    json()
  ]
}
