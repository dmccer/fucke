var express = require('express'),
	fs = require('fs');

module.exports = function (req, res) {
	var d = req.query;
    
    d.time = new Date();

	console.log(d)

	res.send();
};