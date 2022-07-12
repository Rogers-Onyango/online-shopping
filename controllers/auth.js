const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const{ Customer} = require('../models/customers')
const {Admin} = require('../models/admin')

//customer
let getloginPageView = async(req,res) => {
    res.render('customerLogin')
}
let getCustomerRegisterPageView = async(req,res) =>{
    res.render('customerRegister')
}
let RegisterCustomer = async(req,res) =>{
    const errors = []
    const success = []
    const data = req.body;
    if(data.password != data.Cpassword){
        errors.push({msg:"Passwords Do Not Match"})
        res.render('customerRegister',{
            errors
        })
    }else if(!data.password.match(/\d/) || !data.password.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/) || !data.password.match(/[a-z]/) || !data.password.match(/[A-Z]/)){
        errors.push({msg:"Please Enter a strong Password"})
        res.render('customerRegister',{
            errors
        })
    }else{
        Customer.findOne({email:data.email}).then(
            user=>{
                if(user){
                    errors.push({msg:'Customer already registered'})
                    res.render('customerRegister',{
                        errors
                    })
                }else{
                    const hashedPassword =  bcrypt.hashSync(data.password,10)
                    let customer =  new Customer({
                        username : data.uname,
                        name : data.name,
                        mobile: data.mobile,
                        county : data.county,
                        address : data.address,
                        email : data.email,
                        password : hashedPassword
                    })
                    customer = customer.save()
                    success.push({msg: `Account Created Successfully for ${data.name}` })
                    res.render('customerLogin',{
                        success
                    })
                }
            }
        )
    }



}
let LoginCustomer = async(req,res)=>{
    const errors = []
    const {email, password} = req.body
    Customer.findOne({email:email}).then(
        async(user)=>{
            if(user){
                const compare = await bcrypt.compare(password,user.password)
                if(!compare){
                    errors.push({msg:"Incorrect password"})
                    return res.render('customerLogin',{errors})
                }
                const token = jwt.sign({user},'rollinsshadrack1234567890',{ expiresIn: "2h"});
                res.cookie('Customer_Authorisation',token,{
                    httpOnly: true
                })
                return res.redirect('/dashboard/customer')
            }else{
                errors.push({msg:"Please Create an Account to proceed"})
                return res.render('customerLogin',{errors})
            }
        }
    )
}

//admin 
let getAdminLoginPageView = async(req,res) =>{
    res.render('adminLogin')
}
let getnewAdminPageView = async(req,res) =>{
    res.render('newAdmin',{
        admin:req.admin
    })
}
let RegisterNewAdmin = async(req,res) =>{
    const errors = []
    const success = []
    const data = req.body
    console.log(data.OrgEmail)
    Admin.findOne({personalEmail:data.Pemail}).then(
        user=>{
            if(user){
                errors.push({msg:`${user.name} is already an Admin`})
                res.render('newAdmin',{errors,
                    admin:req.admin})
            }else{
                Admin.findOne({organisationEmail:data.OrgEmail}).then(
                    user =>{
                        if(user){
                            errors.push({msg:`${data.OrgEmail} is Already In Use`})
                            res.render('newAdmin',{errors})
                        }else{
                            const hashedPassword = bcrypt.hashSync(data.passcode,10)
                            let admin = new Admin({
                                username : data.uname,
                                name : data.name,
                                personalEmail : data.Pemail,
                                organisationEmail: data.OrgEmail,
                                dealersIn : data.deals,
                                mobile : data.mobile,
                                idNum : data.id,
                                location : data.location,
                                passcode : hashedPassword
                            })
                            admin = admin.save()
                            success.push({msg:`${data.name} Successfully Added as an Admin`})
                            res.render('newAdmin',{success,
                                admin:req.admin})
                        }
                    }
                )
            }
        }
    )

}

let LoginAdmin = async(req,res) =>{
    const errors = []
    const {email, passcode} = req.body
    Admin.findOne({organisationEmail:email}).then(
        async(user)=>{
            if(user){
                const compare = await bcrypt.compare(passcode,user.passcode)
                if(!compare){
                    errors.push({msg:"Incorrect passcode"})
                    return res.render('adminLogin',{errors})
                }
                const token = jwt.sign({user},'rollinsshadrack1234567890',{ expiresIn: "6h"});
                res.cookie('AdminAuthorization',token,{
                    httpOnly: true
                })
                return res.redirect('/dashboard/admin')
            }else{
                errors.push({msg:"Please Create an Account to proceed"})
                return res.render('adminLogin',{errors})
            }
        }
    )
}

let getEmailVerificationPage = async(req,res) =>{
    res.render('customerEmail_verification')
}
let EmailVerification = async(req,res) =>{
    const errors = []
    const success = []
    const {email} = req.body
    Customer.findOne({email:email}).then(
        user =>{
            if(!user){
                errors.push({msg:"Email not Recognized,Please Enter a valid Email"})
                return res.render('customerEmail_verification',{errors})
            }
            const token = jwt.sign({user},'verifyYourEmail',{expiresIn:"10m"})
            const link =  `http://localhost:8000/auth/reset_password/${user._id}`
            let mailTransporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: 'rshadrackochieng@gmail.com',
                    pass: 'dufhbqmcdepbhvdk'
                }
            })
            let details = {
                from:'rshadrackochieng@gmail.com',
                to:email,
                subject:'Reset Password Link',
                text:"Reset password",
                html:`<p style="color: black;">Hey hi <span style="color: yellowgreen;">${user.name}</span>Thank you very much for being part of <p style="color:blue;"> Rolltech Online Shopping </p> We Have your request to reset your password
                Kindly click the link below to reset your password</p> <br>
                <h5>Please do note that the link will no longer be helpful after 10 minutes</h5>
                <p>${link}</p><br><br>
                <h3>Thank You, Admin</h5>`
            }
            mailTransporter.sendMail(details,(err)=>{
                if(err){
                    console.log('there is an error',err)
                }
                success.push({msg:"Ten minute expiry link has been sent to your Email"})
                return res.render('customerEmail_verification',{success})
            })
        }
    )
}
let getResetPasswordPage = async(req,res)=>{
    const id = req.params.id
    if(!id){
        return res.sendStatus(403)
    }
    Customer.findOne({_id:id}).then(
        user =>{
            if(!user){
                return res.sendStatus(403)
            }
            res.render('customerReset_password')
        }
    )
}
let ResetPassword = async(req,res)=>{
    const errors = []
    const success = []
    const id = req.params.id
    const {password,Cpassword} = req.body
    if(password != Cpassword){
        errors.push({msg:"Passwords do not match"})
        return res.render('customerReset_password',{errors,password})
    }
    Customer.findOne({_id:id}).then(
        user =>{
            if(!user){
                res.sendStatus(403)
            }
            Customer.findByIdAndUpdate(id,{
                password:password
            })
            success.push({msg:"Password reset was successfull"})
            res.render('customerReset_password',{success})
        }
    )

}
module.exports = {
    getloginPageView,
    getCustomerRegisterPageView,
    RegisterCustomer,
    LoginCustomer,
    getAdminLoginPageView,
    getnewAdminPageView,
    RegisterNewAdmin,
    LoginAdmin,
    getEmailVerificationPage,
    EmailVerification,
    getResetPasswordPage,
    ResetPassword
}