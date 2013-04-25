<<<<<<< HEAD
var 
    config = {
        servers: {
            f2e: {
                host: '192.168.8.174',
                user: 'e2f',
                pass: '654321',
                port: 21,
                path: './biz-static'
            },
            beta: {
                host: '10.1.4.124',
                user: 'ftpuser',
                pass: 'ftpuser',
                port: 21,
                path: './finance/beta'
            },
            online: {
                host: '10.1.4.124',
                user: 'ftpuser',
                pass: 'ftpuser',
                port: 21,
                path: './finance/v0.0.1'
            }
        },
        apps: {
            finance: {
                locPath: 'd:/work/dianping/dp_sys/mod_finance',
                f2e: {
                    remotePath: './biz-static/proj_finance/mod_finance'
                }
            },
            test: {
                locPath: 'd:/work/dianping/finance-ftp',
                f2e: {
                    remotePath: './biz-static/finance-ftp'
                }
            },
            sales: {
                locPath: 'd:/work/dianping/hr/sales'
            }
        }
    }
;

module.exports = config;

// {
//     f2e: {
//         server: {
//             host: '192.168.8.174',
//             user: 'e2f',
//             pass: '654321'
//         },

//         locPath: 'd:/work/dianping/dp_sys/mod_finance',
//         remotePath: './biz-static/proj_finance/mod_finance',

//         compressSource: './src/app.js',
//         compressTarget: 'http://f2e.dp:3002/proj_finance/mod_finance/src/app.js'
//     },
//     beta: {
//         server: {
//             host: '10.1.4.124',
//             user: 'ftpuser',
//             pass: 'ftpuser'
//         },

//         locPath: 'd:/work/dianping/dp_sys/mod_finance',
//         remotePath: './finance/beta/mod_finance'
//     },
//     online: {
//         server: {
//             host: '10.1.4.124',
//             user: 'ftpuser',
//             pass: 'ftpuser'
//         },

//         locPath: 'd:/work/dianping/dp_sys',
//         remotePath: './finance/v0-14'
//     }
// };
=======
module.exports = {
    f2e: {
        server: {
            host: '192.168.8.174',
            user: 'e2f',
            pass: '654321'
        },

        locPath: './../../test-res',
        remotePath: './biz-static/testftp',

        compressSource: './src/app.js',
        compressTarget: 'http://f2e.dp:3002/proj_finance/mod_finance/src/app.js',

        ignore: [
            'sync.js'
        ]
    },    
    svger: {
        server: {
            host: '173.231.39.213',
            user: 'xxxxx',
            pass: 'xxxxx'
        },        
        locPath: './../test-res',
        remotePath: './kane/testftp',

        ignore: [
            'sync.js',
            'custom/min-css.js'
        ]
    },
    moduleConfigUrl: 'http://f2e.dp:3002/dpm-files/dpm-modules.json'
};
   
        
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
