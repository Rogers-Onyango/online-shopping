const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    personalEmail:{
        type:String,
        required:true
    },
    organisationEmail:{
        type:String,
        required:true
    },
    dealersIn:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    idNum:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    passcode:{
        type:String,
        required:true
    }
})
// adminSchema.methods.generateAuthToken = async() =>{
//     const admin = this
//     const token = jwt.sign({_id: admin._id},'rollin"sEmpire')
//     return token
// }

const Admin = mongoose.model('Admin',adminSchema)
module.exports.Admin = Admin;