var Schema = require('jugglingdb').Schema;
var Invoice = new Schema('redis', {port: 6379}); //port number depends on your configuration

var Invoice = Invoice.define('Invoice', {
    id: {type: String},
    title:     { type: String, length: 255 },
    note:   { type: Schema.Text },
    timestamp: { type: Date,  default: Date.now },
    address: {type: String, length:34},
    amountRemaining: { type: Number },
    amountPaid: {type: Number, default: 0},
    totalAmount: {type: Number },
    qr: {type: String},
    txids: {type: Array},
    invoiceStatus: {type: String, default: 'UNPAID'}
});

module.exports = { 
        Invoice: Invoice
};    


