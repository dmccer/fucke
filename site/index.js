var express = require('express'),
	app = module.exports = express();

// 设置

// 将 .renderFile 映射为 .html 文件
app.engine('html', require('ejs').renderFile);

// 将模版文件后缀名默认设置为 '.html'
app.set('view engine', 'html');

// 设置模版文件位置
app.set('views', __dirname + '/views');

// define a custom res.message() method
// which stores messages in the session
app.response.message = function (msg) {
	// refrence 'req.session' via the 'this.req' reference
	var sess = this.req.session;
	// simply add the msg to an array for later
	sess.messages = sess.messages || [];
	sess.messages.push(msg);
	return this;
};

// log
if (!module.parent) {
	app.use(express.logger('dev'));
}

// 启用session
app.use(express.cookieParser('some secret here'));
app.use(express.session());

// 解析请求正文
app.use(express.bodyParser());
// app.use(express.jsonParser());

app.use(function (req, res, next) {
	if (req.path === '/line.png') {
		require('./lib/err-collect')(req, res);
	}
});

// 设置静态文件位置
app.use(express.static(__dirname + '/public'));

// expose the 'messages' local variable when views are rendered
app.use(function (req, res, next) {
	var msgs = req.session.messages || [];

	// expose 'messages' local variable
	res.locals.messages = msgs;

	// expose 'hasMessages'
	res.locals.hasMessages = !!msgs.length;

	// empty or 'flush' the messages so they
	// don't build up
	req.session.messages = [];
	next();	
}); 

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

// handle http error
app.use(function (err, req, res, next) {
	if(~err.message.indexOf('not found')) {
		return next();
	}

	// log it
	console.error(err.stack);

	// error page
	res.status(500).render('5xx');
});

// assume 404 since no middleware responded
app.use(function (req, res, next) {
	res.status(404).render('404', { url: req.originalUrl });
});

if (!module.parent) {
	app.listen(9999);
	console.log('\n listening on port 9999!\n');
}