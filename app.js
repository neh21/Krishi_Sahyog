require('dotenv').config();
const express = require('express');

const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const port =  process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the 'uploads' directory


connectDB(); // connecting DB
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
       cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
       cb(null, Date.now() + '-' + file.originalname);
   }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
   secret: 'cat dog',
   resave: false,
   saveUninitialized: false,
   store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
   }),
}));
app.use(express.static("public"));
 
 
 
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

 

 
 app.use("/",require('./server/routes/main'));
 app.use("/",require('./server/routes/admin'));
 app.listen(port,()=>{
    console.log(`Server is running on ${port} port.`);
 });