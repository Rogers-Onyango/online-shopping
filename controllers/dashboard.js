const jwt = require('jsonwebtoken')
const {Customer} = require('../models/customers')
const {Admin} = require('../models/admin')
const {Product} = require('../models/products')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const Cart = require('./cart')

//database
const MongoURI = process.env.DATABASE;

//create connection
const conn = mongoose.createConnection(MongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
},()=>{console.log("image database connected")});

//init gfs
let gfs;
conn.once('open', () => {
    // Init stream
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
      })
    gfs = Grid(conn.db, mongoose.mongo);  
    gfs.collection('uploads');
  });


let HomePageView = async(req,res) =>{
    const list = await Product.find().exec()
    const new_Products = await Product.find().sort({_id:-1}).limit(10).exec()
    const cartLength =0;

    gfs.files.find().toArray((err,files) =>{
        if(!files || files.length == 0){
            res.render('customerDashboard',{
                user:req.user,
                arrivals:new_Products,
                files:false,
                products:list,
                cart:Cart.getCart(),
                cartLength
            })
        }else{
            files.map(file =>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true;
                }else{
                    file.isImage = false
                }
            })
            res.render('customerDashboard',{
                user:req.user,
                arrivals:new_Products,
                files:files,
                products:list,
                cartLength,
                cart:Cart.getCart()
            })
        }
    })
}
let CustomerLogout = async(req,res) =>{
    res.clearCookie('Customer_Authorisation')
    res.redirect('/')
}
let AdminLogout = async(req,res) =>{
    res.clearCookie('AdminAuthorisation')
    res.redirect('/')
}
let getAdminPageView = async(req,res) =>{
    const numberOfCustomers = await Customer.count()
    const numberOfAdmin = await Admin.count()
    const numberOfProducts = await Product.count()
    const lastCustomers = await Customer.find().sort({_id:-1}).limit(3).exec()
    const lastProducts = await Product.find().sort({_id:-1}).limit(3).exec()
    res.render('adminDashboard',{
        admin:req.admin,
        numberOfAdmin,
        numberOfCustomers,
        lastCustomers,
        lastProducts,
        numberOfProducts
    })
}

//change passcode
let changepasscodeView = async(req,res) =>{
    res.render('changePasscode',{
        admin:req.admin
    })
}

let changepasscode = async(req,res) =>{
    const success = []
    const errors = []
    const {id , passcode} = req.body
    let admin = await Admin.findByIdAndUpdate(id,{
        passcode:passcode
    },{new: true});
    if(admin){
        success.push({msg:"Passcode Changed Successfully"})
        return res.render('changePasscode',{success,
        admin:req.admin})
    }else{
        errors.push({msg:"Cannot Change passcode"})
        return res.render('changePasscode',{errors,
        admin:req.admin})
    }
}
//get all customers
let getAllCustomersPage = async(req,res) =>{
    const list = await Customer.find().exec();
    res.render('all_customers',{
        customers:list,
        admin:req.admin
    })
}

//update customer
const getUpdateCustomerView = async(req,res,next) =>{
    try{
            const id = req.params.id;
            const oneCustomer = await Customer.findById(id).exec();
            res.render('updateCustomer',{
                customer:oneCustomer,
                admin:req.admin
            })
    }catch(err){
        res.status(400).send(err.message);
    }
}
const updateCustomer = async(req,res) =>{
    const id = req.params.id;
    const data = req.body
    const success = []
    const errors = []
    let customer = await Customer.findByIdAndUpdate(id,{
        username: data.uname,
        name : data.name,
        mobile :data.mobile,
        county : data.county,
        address : data.address,
        email :data.email
    },{new:true})

    if(customer){
        success.push({msg:`${data.name}'s details Updated Successfully`})
        const list = await Customer.find().exec();
        return res.render('all_customers',{success,
        admin:req.admin,
        customers:list
        })
    }else{
        errors.push({msg:`Unable to Update ${data.uname}'s information`})
        const oneCustomer = await Customer.findById(id).exec();
        return res.render('updateCustomer',{errors,
        admin:req.admin,
        customer:oneCustomer
    })
    }
}
//delete Customer
const getDeleteCustomerView = async(req,res,next) =>{
    try{
        const id = req.params.id;
        const oneCustomer = await Customer.findById(id).exec();
        res.render('deleteCustomer',{
            customer:oneCustomer,
            admin: req.admin
        })
}catch(err){
    res.status(400).send(err.message);
}
}

const deleteCustomer = async(req,res,next) =>{
    try{
        const id = req.params.id
        const customer = await Customer.findByIdAndRemove(id);
        if(!customer) return res.status(404).send("Customer with the given id is not found")
        res.redirect('/dashboard/all_customers')
    
    }catch(err){
        res.status(400).send(err.message);
    
    }
}
//get new Product
let getNewProductPageView = async(req,res) =>{
    res.render('newProduct',{
        admin: req.admin
    })
}
let newProduct = async(req,res) =>{
    const success = []
    const {Pname,Pcategory,Pdesc,Pprice} = req.body
    let product = new Product({
        name : Pname,
        category: Pcategory,
        description : Pdesc,
        price : Pprice
    })
    product = product.save()
    success.push({msg:`${Pname} is Posted Successfully`})
    const list = await Product.find().exec()
    gfs.files.find().toArray((err,files)=>{
        res.render('productList',{
            success,
            admin: req.admin,
            products:list,
            files:files
        })
    })

}
//getting all Products
let getProductlistPage = async(req,res)=>{
    const list = await Product.find().exec()
    gfs.files.find().toArray((err,files)=>{
        res.render('productList',{
            admin:req.admin,
            products:list,
            files:files
        })
    })
    
}
let getProductImage = async(req,res) =>{
    const id = req.params.id
    const product = await Product.findById(id).exec()
    gfs.files.find({metadata:id}).toArray((err,files)=>{
        res.render('productImage',{
            admin: req.admin,
            product:product,
            files:files
            
        })
    })

}
let ProductImage = async(req,res) =>{
    res.redirect('/dashboard/product_list')
}

let getUpdateProductPage = async(req,res) =>{
    const id = req.params.id
    const product = await Product.findById(id).exec()
    gfs.files.findOne({metadata:id},(err,file)=>{
        //console.log(file)
        res.render('update_product',{
            product:product,
            admin:req.admin,
            files:file
        })
    })

}
let UpdateProduct = async(req,res) =>{
    const id = req.params.id
    const data = req.body
    const success = []
    const errors = []
    const productid = await Product.findById(id).exec()
    let product = await Product.findByIdAndUpdate(id,{
        name: data.Pname,
        category:data.Pcategory,
        description: data.Pdesc,
        price:data.Pprice
    },{new:true})
    if(product){
        success.push({msg:`${data.Pname}'s details Updated Successfully`})
        gfs.files.findOne({metadata:id},(err,file)=>{
            res.render('update_product',{
                success,
                admin:req.admin,
                product:productid,
                files:file
        })

        })
    }else{
        console.log(err.message)
    }
}
let getUpdate_DeleteProductImagePage = async(req,res) =>{
    const imageId = req.params.imageId
    const prodId = req.params.prodId
    res.render('deleteProduct_image',{
        admin:req.admin,
        imageId:imageId,
        prodId:prodId
    })
}
let deleteProdImage = async(req,res) =>{
    const image_id = req.params.imageId
    const prod_id = req.params.prodId
    gfs.remove({_id:image_id, root: 'uploads'},async(err,gridStore)=>{
        if(err){
            return res.status(404).json({err:err})
        }
        const product = await Product.findById(prod_id).exec()
        gfs.files.findOne({metadata:{productId:prod_id}},(err,file)=>{
            res.render('update_product',{
                product:product,
                admin:req.admin,
                files:file
            })
        })
    })
}

//cart deals
let addToCart = async(req,res) =>{
    let productId = req.body.id
    await Product.findById(productId).then(
        async(product )=>{
            let success = []
            if(!product){
                res.sendStatus(404)
            }
            let selectedProduct = product
            Cart.save(selectedProduct)
            const cartLength = Cart.getCart().products.length || 0;
            const list = await Product.find().exec()
            const new_Products = await Product.find().sort({_id:-1}).limit(10).exec()
            gfs.files.find().toArray((err,files) =>{
                if(!files || files.length == 0){
                    res.render('customerDashboard',{
                        user:req.user,
                        arrivals:new_Products,
                        files:false,
                        products:list,
                        cartLength
                    })
                }else{
                    files.map(file =>{
                        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                            file.isImage = true;
                        }else{
                            file.isImage = false
                        }
                    })
                    res.render('customerDashboard',{
                        user:req.user,
                        arrivals:new_Products,
                        files:files,
                        products:list,
                        cartLength
                    })
                }
            })
        }
        
    )

}

let getCartPageView = async(req,res)=>{
    const cartLength = Cart.getCart().products.length || 0;
    gfs.files.find().toArray((err,files) =>{
        if(!files || files.length == 0){
            res.render('cart',{
                cart:Cart.getCart(),
                pageTitle:'Shopping Cart',
                path:'/cart',
                name:"Rollins",
                user:req.user,
                files:false,
                cartLength
            })
        }else{
            files.map(file =>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true;
                }else{
                    file.isImage = false
                }
            })
            res.render('cart',{
                cart:Cart.getCart(),
                pageTitle:'Shopping Cart',
                path:'/cart',
                name:"Rollins",
                user:req.user,
                files:files,
                cartLength
            })
        }
    })
}
let deleteCart = async(req,res)=>{
    const prodId = req.body.prodId
    await Product.findById(prodId).then(
        product =>{
            Cart.delete(prodId,product.price)
            res.redirect('/dashboard/customer/cart')
        }
    )
    

}
let getChartPage = async(req,res)=>{
    res.render('chart',{
        user:req.user
    })
}
module.exports = {
    HomePageView,
    CustomerLogout,
    getAdminPageView,
    AdminLogout,
    changepasscodeView,
    changepasscode,
    getAllCustomersPage,
    getUpdateCustomerView,
    updateCustomer,
    getDeleteCustomerView,
    deleteCustomer,
    getNewProductPageView,
    newProduct,
    getProductlistPage,
    getProductImage,
    ProductImage,
    getUpdateProductPage,
    UpdateProduct,
    getUpdate_DeleteProductImagePage,
    deleteProdImage,
    addToCart,
    getCartPageView,
    deleteCart,
    getChartPage

}