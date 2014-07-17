var bitcoin = require('bitcoin');
var bitconf = require('../conf/').bitconf;
var client = new bitcoin.Client(bitconf);
var async = require('async');

module.exports = {

	createInvoice : function(req,res){
		async.waterfall([
			function(callback){
				client.getNewAddress(function(err,address){
					callback(null, address);
				});
			},
			function(address, callback){
				console.log(address, req.body);
			}
		]);		

	},
	
	getInvoice : function(req,res){
		res.status(200)
		res.send('chicken dinner')
	}
}
