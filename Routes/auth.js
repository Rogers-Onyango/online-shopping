const express = require('express')
const router = express.Router();
const {getloginPageView,getCustomerRegisterPageView, RegisterCustomer, LoginCustomer,getAdminLoginPageView,getnewAdminPageView,
    RegisterNewAdmin,LoginAdmin,getEmailVerificationPage,EmailVerification,getResetPasswordPage, ResetPassword} = require('../controllers/auth')
const {Admin_Authorisation,Customer_Authorisation} = require('../middleware/protect')

//customer login page
router.get('/customer_signIn',getloginPageView)
router.post('/customer_signIn',LoginCustomer)

//customer register page
router.get('/customer_signUp', getCustomerRegisterPageView)
router.post('/customer_signUp',RegisterCustomer)

//admin login page
router.get('/admin',getAdminLoginPageView)
router.post('/admin',LoginAdmin)

//admin register
router.get('/newAdmin',Admin_Authorisation,getnewAdminPageView)
router.post('/newAdmin',Admin_Authorisation,RegisterNewAdmin)

//verify email
router.get('/verify_email',getEmailVerificationPage)
router.post('/verify_email',EmailVerification)

//reset password
router.get('/reset_password/:id',getResetPasswordPage)
router.post('/reset_password/:id',ResetPassword)



module.exports = router