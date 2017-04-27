import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import postcss from 'rollup-plugin-postcss';
import postcssModules from 'postcss-modules';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

const cssExportMap = {};

export default {
  entry: 'src/Histogram.js',
  plugins: [
    postcss({
      plugins: [
        postcssModules({
          getJSON (id, exportTokens) {
            cssExportMap[id] = exportTokens;
          }
        })
      ],
      getExport (id) {
        return cssExportMap[id];
      }
    }),
    babel(babelrc())
  ],
  globals:{
    "d3":"d3"
  },
  external: external,
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'Histogram',
      sourceMap: true
    },
    {
      dest: pkg.module,
      format: 'es',
      sourceMap: true
    }
  ]
};
