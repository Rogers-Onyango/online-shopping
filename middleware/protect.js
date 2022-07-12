const jwt = require('jsonwebtoken')
const Customer_Authorisation = async(req,res,next) =>{
    const token = req.cookies.Customer_Authorisation;
    //console.log("This is the Protected part" + token)
    if(token){
        const userData = jwt.verify(token,'rollinsshadrack1234567890');
        //console.log(userData.user)
        req.user = userData.user
        return next()
    }else{
        return res.sendStatus(403)
    }

}

const Admin_Authorisation = async(req,res,next) =>{
    const token = req.cookies.AdminAuthorization;
    //console.log("This is the Protected part" + token)
    if(token){
        const userData = jwt.verify(token,'rollinsshadrack1234567890');
        //console.log(userData.user)
        req.admin = userData.user
        return next()
    }else{
        return res.sendStatus(403)
    }

}
module.exports = {
    Customer_Authorisation,
    Admin_Authorisation
}