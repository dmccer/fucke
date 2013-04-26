var 
    config = {
        servers: {
            f2e: {
                host: '192.168.8.174',
                user: 'e2f',
                pass: '654321',
                port: 21,
                path: './biz-ftp'
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
        }
    }
;

module.exports = config;