module.exports = {
    lintOnSave: false, 
    publicPath: "./", // 公共路径(必须有的)
    outputDir: "dist", // 输出文件目录
    assetsDir: "static", //静态资源文件名称 
    productionSourceMap: false, //去除打包后js的map文件
   
    //去掉console
    configureWebpack: (config) => {
        // 判断为生产模式下，因为开发模式我们是想保存console的
        if (process.env.NODE_ENV === "production") {
            config.optimization.minimizer.map((arg) => {
                const option = arg.options.terserOptions.compress;
                option.drop_console = true; // 打开开关
                return arg;
            });
        }
    },
    devServer: {
        open: true, // 自动打开浏览器
        host: '0.0.0.0', // 真机模拟，使用
        port: '8080', // 前台代理端口号
        https: false, // https： {type: Booleam}
        hotOnly: false, // 热更新
        proxy: {
            '/model': {
                target: 'http://10.0.3.39:8081/', // 要访问的跨域的域名
                ws: true, // 如果要代理websockets
                changeOrigin: true, // 开启代理
                pathRewrite: { // 路径重写
                    '^/model': '' // 使用 `/api` 代替 `target` 要访问的跨域的域名
                }
            }
        }
    }
}