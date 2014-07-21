var bitcoin = require('bitcoin');
var bitconf = require('../conf/').bitconf;
var bitclient = new bitcoin.Client(bitconf);
var models = require('../db/');
var isValidAddress = require('bitcoin-address');
var async = require('async');
module.exports = {

	createInvoice : function(req,res){
		bitclient.getNewAddress(function(err,address){
			var qrUrl = 'http://chart.apis.google.com/chart?chld=L|1&choe=ISO-8859-1&chs=300x300&cht=qr&chl=bitcoin:'+address+'?amount='+req.body.amount+'%26label='+req.body.title+'%26message='+req.body.message;
			var invoiceData = {
			 	id : address,
				qr : qrUrl,
				address : address,
				amountRemaining : req.body.amount,
				title : req.body.title,
				note: req.body.message
			};
                        var newInvoice = models.Invoice.create(invoiceData);
			newInvoice.save();
                        res.status(200);
                        res.redirect(('/invoice/'+address+'/'));
		});		

	},
	updateInvoice: function(req, res){
		var txid = req.body.txid || null;
		if(!txid) res.json({error:'no txid specified'});
                if(req.connection.remoteAddress != '127.0.0.1'){
			res.status(403);
			res.json({error:'Unauthorized Access'});
		}

		async.waterfall([
                        function(callback){
                                bitclient.getTransaction(txid, function(err, transaction){
                                        if(err) res.json({error: "No such transaction found"});
					 callback(null,transaction);
                                });
                        },
                        function(transaction, callback){
                                var txid = transaction.txid;
                                var address = transaction.details[0].address;
                                var category = transaction.details[0].category;
                                var amountReceived = transaction.details[0].amount;
                                if( (category == "received") && (amountReceived > 0) )
                                        console.log( 'break2!')
                                        models.Invoice.find(address, function(err, invoice){
						invoice.amountRemaining = invoice.amountRemaining - amountReceived;
                                               	invoice.qr = 'http://chart.apis.google.com/chart?chld=L|1&choe=ISO-8859-1&chs=300x300&cht=qr&chl=bitcoin:'+address+'?amount='+invoice.amountRemaining+'%26label='+invoice.title+'%26message='+invoice.note;
						invoice.amountPaid = invoice.amountPaid + amountReceived;
						invoice.txids.unshift(txid);
                                                if(invoice.amountRemaining == 0) invoice.invoiceStatus = "PAID";
						invoice.save();
						res.status(200);
						res.json(invoice);
                                        });
                        }
                ])
	},
	
	getInvoice : function(req,res){

		var Address = req.params.address;
		
		if(isValidAddress.validate(Address, 'testnet')){	
			models.Invoice.find(Address, function(err, invoice){
				if(err){
					res.status(404);
					res.json({error: 'Invoice not found'});
				}
				res.status(200);
				res.json(invoice);	
			});				
		}
		else{
			res.status(404);
			res.json({status:"not a valid invoice address"});
		}
	}
}
