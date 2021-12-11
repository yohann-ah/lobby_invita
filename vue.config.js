var path = require("path");

function resolve(dir) {
    console.log(__dirname);
    return path.join(__dirname, dir);
}

module.exports = {
    productionSourceMap: false,
    publicPath: "./",
    outputDir: "dist/view",
    configureWebpack: {
        externals: {
            vue: "Vue",
            "element-ui": "ELEMENT",
            axios: "axios",
            "vue-router": "VueRouter",
        },
    },
    chainWebpack: (config) => {
        config.resolve.alias.set("@", resolve("src")); // 设置别名 @ 等于src
    },
    devServer: {
        proxy: {
            "/": {
                target: "http://127.0.0.1:49223/",
                changeorigin: true,
                pathrewrite: {
                    "^/": "/",
                },
            },
        },
    },
};