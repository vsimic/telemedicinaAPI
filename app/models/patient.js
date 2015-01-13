var mongoose = require('mongoose');
var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
//define model patient

var PatientSchema = new Schema({
        personal_data:{
            first_name:{type: String,required: true},
            middle_name:{type: String,required: true},
            last_name:{type: String,required: true},
            date_of_birth:{type: Date,required: true},
            sex:{type: String,required:true},
            marital_status:{ type: String},
            personal_id:{ type: String,unique:true },
            address:{
                city:{type:String,required:true},
                address_line_1:{ type:String,required:true},
                address_line_2:{type:String }
            }
        },
        health_insurance_data:{
            health_insurance_id: { type:String,unique:true, required: true}//,
            /*doctor:{
                doctor_id: {type: ObjectId,required:true},
                first_name: {type:String, required:true},
                last_name: {type:String, required:true},
                license_number:{type:String, required:true}
            }*/
        },
        health_card:[
            {
                date_of_visit:{type:Date},
                anamnesis:{type:String},
                doctor:{type:String}
            }
        ]
    }

);

module.exports = mongoose.model('patients', PatientSchema);