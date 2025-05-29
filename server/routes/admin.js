const express = require('express');
const app = express();
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const methodOverride = require('method-override');

// Use method override for forms with DELETE and PUT methods
router.use(methodOverride('_method'));

const jwtsecret = process.env.jwtSECRET;
const adminUsername = process.env.adminUsername;
const adminPassword = process.env.adminPassword;
const appPassword = process.env.appPassword;
const appEmail = process.env.appEmail;

const adminLayout = '../views/layouts/admin';
const authmiddleware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json( { message: 'Unauthorized'} );
    }
    try{
        const decoded = jwt.verify(token, jwtsecret);
        req.user = decoded;
        console.log("User ID:", req.user.userId);

        // req.userId = decoded.userId;
        next();
    }catch(error){
        console.log(error);
    }
}
/**
 * get /
 * home
 */
router.get('/admin',async (req,res) =>{
try {
    const locals = {
        title: "Admin",
        description: "Simple Blog "
    }
    res.render('admin/index',{locals, layout: adminLayout});
}catch(error){  
    console.log(error);
}
});


/**
 * post /
 * admin - chack login
 */
router.post('/admin',async (req,res) =>{
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if(!user){
            res.redirect('/errorfile');
        }
        const isPasswordvalid  = await bcrypt.compare(password, user.password);
        if(!isPasswordvalid){
            res.redirect('/errorfile');
        }
        const token = jwt.sign({userId: user._id},jwtsecret);
        res.cookie('token', token, {httpOnly: true});
        if(username === adminUsername && password === adminPassword){
            res.redirect('/adminDashboard');
        }else{
            res.redirect('/dashboard');
        }
        
    }catch(error){
        console.log(error);
    }
    });
    router.get('/errorfile',async (req,res) =>{
        res.send('errorfile');
    });

router.get('/adminDashboard', authmiddleware ,async (req,res) =>{
        const locals = {
            title: 'DashBoard',
            description : 'Simple Blog DashBoard'
        };
        try{
            const data = await Post.find();
            res.render('admin/adminDashboard',{locals, data, layout: adminLayout});
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        
        }
         
    });
router.get('/dashboard', authmiddleware, async (req, res) => {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog Dashboard'
    };
  
    try {
      const userId = req.user.userId; // Assuming authmiddleware sets req.user
      const userReports = await Post.find({ author: userId }); // Fetch logged-in user's reports
      const otherReports = await Post.find({ author: { $ne: userId } }); // Fetch other users' reports
      console.log("User ID:", req.user.userId);

      res.render('admin/dashboard', { locals, userReports, otherReports, layout: adminLayout });
    } catch (error) {
      console.log(error);
      // Handle error rendering dashboard
      res.render('error', { message: 'Error loading dashboard', error });
    }
  });

//   sending post route for admindashboard

function formatReport(report) {
    return `
Report details, please take action on the below report:

Title: ${report.title}
Problem description: ${report.body}
State: ${report.state}
City: ${report.city}

Why this problem arised, please investigate.
    `;
}

async function sendEmail(report) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service
            auth: {
                user: appEmail,
                pass: appPassword,
            },
        });

        let mailOptions = {
            from: appEmail,
            to: 'komal148btit21@igdtuw.ac.in',
            subject: 'New Report Submitted',
            text: formatReport(report),
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Rethrow the error to be handled in the route
    }
}

// Route to handle sending the report via email
router.post('/submit-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send('Report not found');
        }

        await sendEmail(post);

        res.redirect('/adminDashboard');
    } catch (error) {
        console.error('Error in /submit-post route:', error);
        res.status(500).send('Internal Server Error');
    }
});

    router.get('/add-Post', authmiddleware ,async (req,res) =>{
        const locals = {
            title: 'Add Post',
            description : 'Simple Blog DashBoard'
        };
        try{
            const data = await Post.find();
            res.render('admin/add-Post',{locals,layout: adminLayout});
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });
    
    /**
     * post
     * admin-add new post
     */

    router.post('/add-Post', authmiddleware ,async (req,res) =>{
        
        try{
            try{
                const newpost = new Post({
                    name: req.body.Name,
                    phone: req.body.phone,
                    title: req.body.title,
                    body: req.body.body,
                    state: req.body.state,
                    city: req.body.city,
                    pincode: req.body.pincode,
                    author: req.user.userId
                });
                console.log('Creating new post with author:', req.user.userId); // Debug log
                await Post.create(newpost);  
                res.redirect('/dashboard');

            }catch(error){
                res.send('/errorfile');
            }


          
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });


    router.put('/edit-post/:id', authmiddleware ,async (req,res) =>{
       
        try{
            await Post.findByIdAndUpdate(req.params.id, {
                name: req.body.Name,
                phone: req.body.phone,
                title: req.body.title,
                body: req.body.body,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                updatedAt: Date.now()
            });
            res.redirect(`/edit-post/${req.params.id}`);
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });
    



    router.get('/edit-post/:id', authmiddleware ,async (req,res) =>{
       
        try{
            const locals = {
                title: 'Edit Post',
                description : 'Simple Blog Edititng DashBoard'
            };
            const data = await Post.findOne({ _id: req.params.id});
            res.render('admin/edit-post',
            {locals,
            data,
            layout: adminLayout});
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });
    
   /**
 * delete /
 * admin - delete post
 */


    router.delete('/delete-post/:id', authmiddleware ,async (req,res) =>{
       
        try{
           await Post.deleteOne({ _id: req.params.id});
           res.redirect('/dashboard');
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });

    // admin delete route
    router.delete('/admin-delete-post/:id', authmiddleware ,async (req,res) =>{
       
        try{
           await Post.deleteOne({ _id: req.params.id});
           res.redirect('/adminDashboard');
        }catch(error){
            console.log(error);
        // Handle error rendering dashboard
        res.send('/errorfile');
        }
         
    });
 /**
 * get /
 * admin - logout
 */
router.get('/logout', authmiddleware ,async (req,res) =>{
    res.clearCookie('token');
    res.redirect('/');
});
    
    /**
 * post /
 * admin - chack register
 */
router.post('/register',async (req,res) =>{
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try{
            const user = await User.create({username, password: hashedPassword});
            res.status(201).json({message: 'User Created', user});
        }catch(error){
            if(error.code === 11000){
                res.status(409).json({message: 'user already in use'});
            }
            res.status(500).json({message: 'Internal Server error'});
        }

       
    }catch(error){
        console.log(error);
    }
    });
  
module.exports = router;
// dfgrfhrtfjtrju