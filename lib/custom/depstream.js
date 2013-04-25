var Stream = require('stream').Stream,
	util = require('util'),
	fs = require('fs'),
	path = require('path');

function DepsStream() {
	this.writable = true;
	this.readable = true;
	this.buffer = '';
	this.depsList = [];
}

module.exports = DepsStream;
util.inherits(DepsStream, Stream);

// 这里的 write 方法只发送数据，不对数据做任何处理
DepsStream.prototype.write = function (data) {
	this.emit('data', data);
};

// 重写 pipe 方法，使其能够处理依赖关系和生成最终文件
DepsStream.prototype.pipe = function (dest, opt) {
	var that = this, ondata, onend;

	ondata = function (chunk) {
		var matches = findImport(chunk), code;

		if(matches) {
			if(this.depsList.indexOf(matches) >= 0) {
				// 把处理过后的数据 pipe 回 LineStream
				dest.write('\n');
			} else {
				this.depsList.push(matches);
				code = getFileContent(matches);
				// 把处理过后的数据 pipe 回 LineStream
				dest.write('\n' + code);
			}
		} else {
			this.buffer += chunk + '\n';
		}
	};

	onend = function () {
		// 生成最终文件
		var code = this.buffer;
		fs.writeFileSync(filePublishUrl, code);
		console.log(filePublishUrl + ' combine done.');
	};

	// 监听 end 事件
	that.on('end', onend);
	// 监听 data 事件
	that.on('data', ondata);
};

// end 方法
DepsStream.prototype.end = function () {
	this.emit('end');
};
