module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-preset-env'),
    require('postcss-nested'),
    require('cssnano'),
  ],
};