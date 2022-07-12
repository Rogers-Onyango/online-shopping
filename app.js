const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
require('dotenv').config()


//middleware
app.use(cookieParser())

//method overrider
app.use(methodOverride('_method'))

//templating Engine
app.use(expressLayout);
app.set('view engine', 'ejs');

//setting up the database
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('DB connected')
});

//Body parser
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//middleware
app.use(cookieParser())

//static pages
app.use(express.static('public'))

//routes
app.use('/',require('./Routes/landing'))
app.use('/auth' ,require('./Routes/auth'))
app.use('/dashboard', require('./Routes/dashboard'))



//setting the server
const PORT = process.env.PORT || 8000;
app.listen(PORT,() =>{
    console.log(`Server started at port ${PORT}`)
})