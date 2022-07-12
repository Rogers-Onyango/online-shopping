const express = require('express')
const router = express.Router();
const multer = require('multer')
require('dotenv').config()
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage
const {HomePageView, CustomerLogout,getAdminPageView,AdminLogout, changepasscodeView,changepasscode,getAllCustomersPage,
    getUpdateCustomerView,updateCustomer,getDeleteCustomerView,deleteCustomer,getNewProductPageView,newProduct,
    getProductlistPage,getProductImage,ProductImage,getUpdateProductPage,UpdateProduct,getUpdate_DeleteProductImagePage,deleteProdImage,getCartPageView,
    addToCart,deleteCart,getChartPage} = require('../controllers/dashboard')
const {Customer_Authorisation,Admin_Authorisation} = require('../middleware/protect')

//database
const MongoURI = process.env.DATABASE;


//Grid Fs Storage
// Create storage engine
const storage = new GridFsStorage({
    url: MongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            metadata:req.params.id

            
            };
            resolve(fileInfo);
        });
    }
    });
    const upload = multer({storage})
//customer Dashboard
router.get('/customer',Customer_Authorisation,HomePageView)
//log out
router.get('/customer_logOut',Customer_Authorisation,CustomerLogout)

router.get('/admin_logOut',AdminLogout)

//admin dashboard
router.get('/admin',Admin_Authorisation,getAdminPageView)

//change passcode
router.get('/admin/changePasscode',Admin_Authorisation,changepasscodeView)
router.post('/admin/changePasscode',Admin_Authorisation,changepasscode)

//all customers
router.get('/all_customers',Admin_Authorisation,getAllCustomersPage)

//update Customer
router.get('/admin/updateCustomer/:id',Admin_Authorisation,getUpdateCustomerView)
router.post('/admin/updateCustomer/:id',Admin_Authorisation,updateCustomer)

//delete customer
router.get('/admin/deleteCustomer/:id',Admin_Authorisation,getDeleteCustomerView)
router.post('/admin/deleteCustomer/:id',Admin_Authorisation,deleteCustomer)

//new Product
router.get('/new_product',Admin_Authorisation,getNewProductPageView)
router.post('/new_product',Admin_Authorisation,newProduct)

//All Products
router.get('/product_list',Admin_Authorisation,getProductlistPage)

//product Image
router.get('/product_image/:id',Admin_Authorisation,getProductImage)
router.post('/product_image/:id',Admin_Authorisation,upload.single('file'),ProductImage)

//update product
router.get('/update_product/:id',Admin_Authorisation,getUpdateProductPage)
router.post('/update_product/:id',Admin_Authorisation,UpdateProduct)

//delete product image
router.get('/updateProduct_image/:prodId/:imageId',Admin_Authorisation,getUpdate_DeleteProductImagePage)
router.delete('/admin/files/:prodId/:imageId',Admin_Authorisation,deleteProdImage)

//add to cart
router.post('/add-to-cart',Customer_Authorisation,addToCart)
//cart page
router.get('/customer/cart',Customer_Authorisation,getCartPageView)
router.post('/customer/delete-cart',Customer_Authorisation,deleteCart)

//chart zone
router.get('/chart',Customer_Authorisation,getChartPage)


module.exports = router