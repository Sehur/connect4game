var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game  = new Schema({
     id: String,
	   player1: String,
     player2: String,
     board: Schema.Types.Mixed,
     turn: Boolean,
     status: Number,
     lastMove: Number,
     date: { type: Date, default: Date.now }

 });

 module.exports = mongoose.model('Game', Game);
