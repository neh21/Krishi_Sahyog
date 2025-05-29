const express = require('express');
const app = express();
const router = express.Router();
const Post = require('../models/post');
const Event = require('../models/event');
const CommunityPost = require('../models/community_post');

const multer = require('multer');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


router.get("", async (req,res)=>{
  const locals = {
    title: "Node Js Blog",
    description: "Simple Blog Creation"
  }
  try {
    const data = await Post.find();
    res.render("index", {data});
  } catch(error){
    console.log(error);
  }
    
  });

  router.get("/about", async (req,res)=>{
    try {
      const data = await Event.find();
      res.render("about", {data});
    } catch(error){
      console.log(error);
    }
  });
  router.get("/contact", async (req,res)=>{
    const locals = {
      title: "Node Js Blog",
      description: "Simple Blog Creation"
    }
    try {
      res.render("contact", locals);
    } catch(error){
      console.log(error);
    }
  });
  
  router.get("/community", async (req,res)=>{
    try {
      res.render("community");
    } catch(error){
      console.log(error);
    }
  });

  router.get("/weather", async (req,res)=>{
    try {
      res.render("weather");
    } catch(error){
      console.log(error);
    }
  });

  router.get("/weather", async (req,res)=>{
    try {
      res.render("weather");
    } catch(error){
      console.log(error);
    }
  });
  // **
  // * Get /
  // * Post: id
  // */
 router.get("/post/:id", async (req,res)=>{
   try {
     let slug = req.params.id;
     const data = await Post.findById({_id : slug});

     const locals = {
       title: data.title,
       description: "Simple Blog Creation"
     }
     
     
     res.render('post', {locals, data, currentRoute: `/post/${slug}`});
   } catch(error){
     console.log(error);
   }
     
   });
   /**
  * post /
  * Post: search
  */
 router.post("/search", async (req,res)=>{
   try {
     const locals = {
       title: "Search",
       description: "Simple Blog Creation"
     }
     let searchTerm = req.body.searchTerm;
     const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")

     const data = await Post.find({
       $or: [
        { Name: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { phone: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { state: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { city: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { pincode: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
      ]

       
     });
     res.render( 'search',{
       locals,
       data
     });
   } catch(error){
     console.log(error);
   }
     
   });

    // COMMUNITY ROUTES
    router.get('/api/posts', async (req, res) => {
      try {
          const posts = await CommunityPost.find();
          res.json(posts);
      } catch (err) {
          res.status(500).json({ message: err.message });
      }
  });
  
  router.post('/api/posts', upload.single('photo'), async (req, res) => {
      const cpost = new CommunityPost({
          title: req.body.title,
          body: req.body.body,
          photo: req.file ? `/uploads/${req.file.filename}` : null
      });
      try {
          const newCPost = await cpost.save();
          res.status(201).json(newCPost);
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
  });
  
  router.patch('/api/posts/:id/like', async (req, res) => {
      try {
          const cpost = await CommunityPost.findById(req.params.id);
          if (!cpost) return res.status(404).json({ message: 'Post not found' });
  
          cpost.likes = (cpost.likes || 0) + 1;
          const updatedPost = await cpost.save();
          res.json(updatedPost);
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
  });
  

//  function insertPostData (){
//    Post.insertMany([
//      {
//        title: "Bhartiya Janta Party",
//      body: "Lorem",    state: "Delhi",    city: "jfhio",    pincode: "8945"
//    }
      
//     ])
//     }
// insertPostData();

//function insertEventData (){
//     Event.insertMany([
//       {
//         title: "Aam Aadmi Party",
//       body: "badhiya party hai",
//       link: "https://www.google.com/search?q=Aam+Aadmi+party&sca_esv=2e47e62a151241ca&bih=679&biw=1366&hl=en&tbm=nws&sxsrf=ADLYWII7XkWRdBQ7BhdeATaAujSKYFIVUw:1716026142398&story=GiMSIUFBUCBNUCBTd2F0aSBNYWxpd2FsIGFzc2F1bHQgY2FzZTIyCij1rqiq4vHb69UBhs7Km7f9konkAbKekr6WiKP7jwHK04vVw_O36tQBELLY0NALGAVyAhAB&fcs=ACgqzeda-5htx4fotKoM2mIX4vka4wmSyw&sa=X&ved=2ahUKEwj445HF95aGAxUlfGwGHRVdBIsQjcEJegQIGxAD"
//     },
//     {
//       title: "Bhartiya Janta Party",
//     body: "Donation should be done",
//      link: "https://www.bjp.org/home"
//     },
//     {
//      title: "Samajwadi Party",
//    body: "Kardo inhe bhi",
//    link: "https://www.samajwadiparty.in/"
//  }
//        ])
//      }
//  insertEventData();
 module.exports = router;