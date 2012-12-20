exports.index = function (req, res) {	
	res.render('index');
};

exports.add = function (req, res) {
	
};

exports.del = function (req, res) {};

exports.update = function (req, res) {};

exports.list = function (req, res) {
	// console.log('errs: ', req.query.errs);
	res.send({ code: 200, msg: req.query.errs });
};