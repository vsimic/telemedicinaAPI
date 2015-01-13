var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//define model user

var UserSchema = new Schema({
    first_name:{type:String,required:true},
    last_name :{type:String,required:true},
    email:{ type:String, required:true,match:[/.+\@.+\..+/,'Please fill a valid email address']},
    licence_number:{type: String,required: true},
    password:{type: String, required:true},
    role:{type:String},
    created_at:{type:Date, default : Date.now()},
    active:{type:Boolean,default:true}
});

module.exports = mongoose.model('users', UserSchema);