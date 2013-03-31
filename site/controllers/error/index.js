exports.index = function (req, res) {	
	res.render('index');
};

exports.add = function (req, res) {
};

exports.collect = function (req, res) {
	res.send()
}

exports.del = function (req, res) {};

exports.update = function (req, res) {};

exports.list = function (req, res) {
	res.send({ code: 200, msg: req.query.errs });
};