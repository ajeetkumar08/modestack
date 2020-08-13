const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");

const mongoClient = require('mongodb').MongoClient

const url = "mongodb://localhost:27017/mydb"
const saltRounds = 10;
const privateKey = "modestack";

userRouter.post("/register", async (req, res) => {
    const { name, email, password, address } = req.body;
  
    try {
      if (!name) {
        throw new Error("Valid name required");
      }
      if (!email) {
        throw new Error("Valid email required");
      }
      if (!password) {
        throw new Error("Valid password required");
      }

      const hashedPwd = await bcrypt.hash(password, saltRounds);
      
      mongoClient.connect(url, function(err, db){
        if(err) throw err
         const dbObj  = db.db("mydb")
         dbObj.collection("users").findOne({email:email}).then(function(data){
             if(data) {
                res.status(400).json({
                    success: true,
                    message: "User email is already present",
                    result: {
                      id: db.id,
                    },
                  });
             }else {

                dbObj.collection("users").insert({name:name,
                    email:email,
                    password: hashedPwd,
                    address: address,
                    createdAt: new Date()})

                res.status(200).json({
                    success: true,
                    statusCode: "201",
                    body: {
                        message: "new user created"
                    },
                  });
             }
         })
         
      })
    
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "User registration failed",
        error: error.message,
      });
    }
  });


  userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("bbb",req.body)
  
    try {
        mongoClient.connect(url, async function(err, db){
            if(err) throw err
             const dbObj  = db.db("mydb")
             const result = await dbObj.collection("users").findOne({ email });
             if (!result) return res.status(400).json({success: true, message:"Email not found"})
             console.log("result", result)
             if (result.password) {
                const isPasswordMatched = await bcrypt.compare(password, result.password);
                if(!isPasswordMatched) return res.status(400).json({success: true, message:"password missmatch"})
                
                  const user = result;
                  const token = jwt.sign({ id: user.name }, privateKey, {
                    expiresIn: "1 days",
                  });
          
                  res.status(200).json({
                    success: true,
                    message: "Login successfully",
                    result: {
                      token
                    },
                  });
              }
        })
        
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Login unsuccessful",
        error: error.message,
      });
    }
  });



  userRouter.post('/article', auth, (req, res) => {

    const { title, body, author } = req.body;
    try {
      if (!title) {
        throw new Error("title required");
      }
      if (!body) {
        throw new Error("body required");
      }
      if (!author) {
        throw new Error("author required");
      }

    mongoClient.connect(url, function(err, db){
      if(err) throw err
       const dbObj  = db.db("mydb")
       dbObj.collection("articles").findOne({title:title}).then(function(data){
           if(data) {
              res.status(400).json({
                  success: true,
                  message: "same title already present",
                  result: {
                    id: db.id,
                  },
                });
           }else {

              dbObj.collection("articles").insert({
                  title:title,
                  body: body,
                  author: author,
                  createdAt: new Date()})

              res.status(200).json({
                  success: true,
                  statusCode: "201",
                  body: {
                      message: "new article created"
                  },
                });
           }
       })
       
    })
   } catch (error) {
      res.status(400).json({
        success: false,
        message: "Input article data",
        error: error.message,
      });
    }
  })


  userRouter.post('/article-list', auth, (req, res) => {
    
    try {

    mongoClient.connect(url, function(err, db){
      if(err) throw err
       const dbObj  = db.db("mydb")
       dbObj.collection("articles").find({}).toArray(function (err, docs){
 
        res.status(200).json({
          success: true,
          statusCode: "201",
          body: {
              message: "fetched all article",
              data: docs
          },
        });
       })
       
    })
   } catch (error) {
      res.status(400).json({
        success: false,
        message: "Input article data",
        error: error.message,
      });
    }
  })





  module.exports = userRouter;