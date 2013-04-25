exports.index = function (req, res) {	
	res.render('index');
};

exports.add = function (req, res) {
<<<<<<< HEAD
};

exports.collect = function (req, res) {
	res.send()
}

=======
	
};

>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
exports.del = function (req, res) {};

exports.update = function (req, res) {};

exports.list = function (req, res) {
<<<<<<< HEAD
=======
	// console.log('errs: ', req.query.errs);
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
	res.send({ code: 200, msg: req.query.errs });
};