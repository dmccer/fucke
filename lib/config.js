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
            user: 'svgercom',
            pass: 'yunhua190926xiao'
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
   
        
