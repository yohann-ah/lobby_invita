const files = require.context("./", true, /\.js$/);
const modules = {};

files.keys().forEach((key) => {
  if (key !== "./index.js") {
    modules[key.replace(/(\.\/|\/index\.js)/g, "")] = files(key).default;
  }
});

export default modules;
