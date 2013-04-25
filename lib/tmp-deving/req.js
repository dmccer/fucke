var https = require('https'),
	_ = require('underscore');

// 登录：http://www.12306.cn/otsweb/loginAction.do?method=login

https.get('https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=queryLeftTicket&orderRequest.train_date=2013-01-25&orderRequest.from_station_telecode=SNH&orderRequest.to_station_telecode=OMQ&orderRequest.train_no=&trainPassType=QB&trainClass=QB%23D%23Z%23T%23K%23QT%23&includeStudent=00&seatTypeAndNum=&orderRequest.start_time_str=00%3A00--24%3A00', function (res) {
	console.log(res)

	res.on('data', function (d) {
		console.log(d)
	})
}).on('error', function (e) {
	console.error(e)
});

//https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=queryLeftTicket&orderRequest.train_date=2013-01-25&orderRequest.from_station_telecode=SNH&orderRequest.to_station_telecode=OMQ&orderRequest.train_no=&trainPassType=QB&trainClass=QB%23D%23Z%23T%23K%23QT%23&includeStudent=00&seatTypeAndNum=&orderRequest.start_time_str=00%3A00--24%3A00