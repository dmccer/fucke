var fs = require('fs'),
	path = require('path'),
	LineStream = require('./linestream'),
	DepsStream = require('./depstream'),
	fileStream,
	lineStream,
	depsStream;

fileStream = fs.createReadStream(filepath);
lineStream = new LineStream();
depsStream = new DepsStream();

fileStream.pipe(lineStream);
lineStream.pipe(depsStream);
depsStream.pipe(lineStream);