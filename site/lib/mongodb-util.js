var mongodb = require('mongodb'),
	_ = require('underscore'),
	DB = mongodb.Db,
	Conn = mongodb.Connection,
	Server = mongodb.Server,
	DBUtil,
	dbUtil,
	gconf;

gconf = {
	mgo_host: 'MONGO_NODE_DRIVER_HOST',
	mgo_port: 'MONGO_NODE_DRIVER_PORT',
	loc: 'localhost',
	dbname: 'err-looker',
	tb_err: 'error'
};

DBUtil = function () {
	var host, port;

	this.dbConf = gconf;

	host = process.env[gconf.mgo_host] != null ? process.env[gconf.mgo_host] : gconf.loc;
	port = process.env[gconf.mgo_port] != null ? process.env[gconf.mgo_port] : Conn.DEFAULT_PORT;

	// 构建数据库连接器
	this.db = new DB(gconf.dbname, new Server(host, port, {}), { native_parser: true });
};

// 连接数据库
DBUtil.prototype.open = function (callback) {
	!callback && (callback = function () {});

	this.db.open(function (err, db) {
		if(err) {
			console.log('打开数据库连接发生错误！错误信息：%s', err);
		}
		callback(err, db);
	});
};

DBUtil.prototype.close = function (force, callback) {
	(force === undefined || force === null)	&& (force = true);

	this.db.close(force, callback);
};

DBUtil.prototype.bindInit = function () {
	this.db.on('close', function (err) {
		console.log('已经断开数据库连接！')
	});

	this.db.on('error', function (err) {
		console.log('数据库操作发生错误！错误信息：%s', err)		
	});
}

DBUtil.prototype.getCollection = function (collectionName) {
	return this.db.collection(collectionName);
	
};

dbUtil = module.exports = new DBUtil();

dbUtil.open();
dbUtil.bindInit();




