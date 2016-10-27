var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var empSchema   = new Schema({ 
	id: String,
    name: String,
  	age: { type: Number, min: 0 },
  	tittle: String,
  	gender: String,
  	manager: {type:String, default: "not assigned"},
  	phone: { type: String, trim: true },
  	email: { type: String, lowercase: true, trim: true },
	profilePic: { type: String, default: '575f947e28c38e441ec233e9'},
  	avalMang: { type: Boolean, default: true }
});

module.exports = mongoose.model('empSchema', empSchema);