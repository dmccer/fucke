var Stream = require('stream').Stream,
	util = require('util'),
	path = require('path'),
	fs = require('fs');

// 构造函数
function LineStream() {
	this.writable = true;
	this.readable = true;
	this.buffer = '';
}

module.exports = LineStream;

// 继承流接口
util.inherits(LineStream, Stream);

// 重写 write 方法，所有 pipe 过来的数据都会调用此方法
LineStream.prototype.write = function(data, encoding) {
	var that = this;

	// 把 buffer 转换为 string 类型
	if (Buffer.isBuffer(data)) {
		data = data.toString(encoding || 'utf8');
	}

	var parts = data.split(/\n/g);

	// 如果有上一次的 buffer 存在就添加到最前面
	if (this.buffer.length) {
		parts[0] = this.buffer + parts[0];
	}

	// 遍历并发送数据
	for (var i = 0; i < parts.length - 1; i++) {
		this.emit('data', parts[i]);
	}

	// 把最后一行数据保存到 buffer，使传递过来的数据保持连续和完整
	this.buffer = parts[parts.length - 1];
};

// end 方法，在流结束时调用
LineStream.prototype.end = function () {
	// 如果还有 buffer，发送出去
	if(this.buffer.length > 0) {
		this.emit('data', this.buffer);
		this.buffer = '';
	}

	this.emit('end');
};

