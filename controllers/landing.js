const mongoose = require('mongoose')
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage
const Grid = require('gridfs-stream')
const MongoURI = process.env.DATABASE;
const {Product} = require('../models/products');

//create connection
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

let getHomePageView = async(req,res) =>{
    const list = await Product.find().exec()
    const new_Products = await Product.find().sort({_id:-1}).limit(10).exec()
    gfs.files.find().toArray((err,files) =>{
        //check if files exists
        if(!files || files.length == 0){
            res.render('landing',{
                files:false,
                products:list,
                arrivals:new_Products
            })
        }else{
            files.map(file =>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true;
                }else{
                    file.isImage = false
                }
            })
            res.render('landing',{
                files:files,
                products:list,
                arrivals:new_Products
            })
        }
    })
}
let getProductImage = async(req,res) =>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({
                err:'no file'
            })
        }
        //check if its an image
        if(file.contentType === 'image/jpeg' || contentType === 'image/png'){
            //read the output to the broser
const readStream = gridfsBucket.openDownloadStream(file._id);
readStream.pipe(res)
}else{
    res.status(404).json({
        err:'not an Image'
    })
}
    })
}
module.exports = {
    getHomePageView,
    getProductImage
}