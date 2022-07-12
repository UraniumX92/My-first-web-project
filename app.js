const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const utils = require("./utils");
const path = require("path");
const fs = require("fs");

/* Loading .env */
require("dotenv").config()
const envs = process.env

/* CONNECTING TO MONGODB CLIENT */
let mongo_user = envs.MONGO_USER;
let mongo_password = envs.MONGO_PASSWORD;
let mongo_options = {
    dbName: "WebP1",
    autoIndex: false,
}

mongoose.connect(`mongodb+srv://${mongo_user}:${mongo_password}@cluster0.zfovk.mongodb.net/test`, mongo_options, (err) => {
    if (err) {
        console.log(`ERROR CONNECTING TO MONGO : ${err}`);
    }
    else {
        console.log("Successfully connected to mongo client.");
    }
});

/* MONGO CONFIGURATIONS */
let user_schema = new mongoose.Schema({
    user_name: String,
    password: String,
    user_id: String,
    joined_at: Number,
    email: String,
    gender: String,
    phone: Number,
})

let Users = mongoose.model('users', user_schema);

/* APP CONFIGURATIONS */
const port = 80;
const app = express();
let session_options = {
    secret: envs.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}

app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.use(session(session_options))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'templates'))

// TODO change this method of routing. both / and /login should be sent using pug templates
const LOGIN_GETS = {
    '/': './static/html/index.html',
    '/login': './static/html/login.html',
};

const mapExtToContentType = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'ico': 'image/x-icon',
    'jpg': 'image/jpeg',
};

/* GET requests */
/* Default GET Servings --------------------------------------------------------------------------------------------------------------------*/
Object.keys(LOGIN_GETS).forEach((key) => {
    app.get(key, utils.authLoginPages, (req, res) => {
        console.log("--".repeat(15));
        console.log(req.url);
        let fileToSend = LOGIN_GETS[key];
        fs.readFile(fileToSend, (err, data) => {
            if (err) {
                console.log("Some unknown error occured: ");
                console.log(err);
            }
            else {
                let ext = fileToSend.split('.');
                ext = ext[ext.length - 1];
                res.writeHead(200, { "Content-Type": mapExtToContentType[ext] });
                res.end(data, () => {
                    console.log(`sent ${fileToSend}`);
                });
            }
        });
    });
});

app.get("/dashboard", utils.authCheck, (req, res) => {
    let user_id = req.session.userID;
    Users.findOne({user_id:user_id},(err,doc)=>{
        if(err){
            res.status(500).send("Internal server error");
            return;
        }
        if(doc){
            let params = {
                name : doc.user_name,
                user_id : doc.user_id,
                email : doc.email,
                gender : doc.gender,
                phone : doc.phone,
                member_since : utils.getTimeAgo(doc.joined_at),
            }
            res.status(200).render('dashboard', params);
        }
    })
});

app.get('/logout',utils.authCheck,(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

app.get('/delAccount',utils.authCheck,(req,res)=>{
    Users.deleteOne({user_id:req.session.userID},(err)=>{
        if(err){
            res.status(500).send("Internal server error");
        }
        else{
            req.session.destroy();
            res.redirect("/");
        }
    })
});

// AJAX GETS -- Technically these are GET methods but they act like POST method

// AJAX -> check login credentials
app.get('/lgcheck',(req,res)=>{
    let splitted = req.url.split("||is||");
    let info = {
        email : splitted[1].split("||end_value||")[0],
        password : splitted[splitted.length-1].split("||end_value")[0],
    }
    console.log('/lgcheck AJAX');
    Users.findOne({email:info.email},(err,doc)=>{
        if(err){
            res.status(200).send("Some error occured on server side. please reload the page and try again.");
        }
        if(!doc){
            // Email is not in db
            res.status(200).send("This Email is not registered!");
        }
        else{
            // Email is in db. now we check for correct password
            if(doc.password===utils.hash(info.password)){
                req.session.loggedIn = true;
                req.session.userID = doc.user_id;
                res.status(200).send("pass");
            }
            else{
                res.status(200).send("Incorrect Password!");
            }
        }
    });
});

// AJAX -> Check new user's Email and password length
app.get('/createAccCheck',(req,res)=>{
    let minPasswordLength = 8;
    let minNameLength = 5;
    let splitted = req.url.split("||is||");
    let info = {
        name : splitted[1].split("||end_value||")[0],
        email : splitted[2].split("||end_value||")[0],
        password : splitted[3].split("||end_value")[0],
    }
    console.log('/createAccCheck AJAX');
    Users.findOne({email:info.email},(err,doc)=>{
        if(err){
            res.status(200).send("Some error occured on server side. please reload the page and try again.");
        }
        if(!doc){
            // Email is not in db - Success
            if(info.name.length<minNameLength){
                res.status(200).send(`Your username must have atleast ${minNameLength} characters.`);
            }
            else if(info.password.length<minPasswordLength){
                res.status(200).send(`Your password must have atleast ${minPasswordLength} characters.`);
            }
            else{
                res.status(200).send("pass");
            }
        }
        else{
            // Email is in db. - Failure
            res.status(200).send("Entered Email is already in use by other user.");
        }
    });
});

// AJAX -> check user's password 
app.get('/delAcc',utils.authCheck,(req,res)=>{
    let splitted = req.url.split("||is||");
    let info = {
        password : splitted[1].split("||end_value")[0],
    }
    Users.findOne({user_id:req.session.userID},(err,doc)=>{
        if(err){
            res.status(200).send("false");
        }
        if(doc){
            if(utils.hash(info.password)==doc.password){
                res.status(200).send("true");
            }
            else{
                res.status(200).send("false");
            }
        }
    });
});

/* ----------------------------------------------------------------- POST requests --------------------------------------------------------- */
app.post('/',utils.authLoginPages, (req, res) => {
    let new_user = req.body;

    let joined_at = Math.floor(Date.now() / 1000);
    let user_id = utils.generateUUID(new_user.name, joined_at);

    // check if email is already in collection
    // Creating a doc for new_user
    let user = new Users({
        user_name: new_user.name,
        password: utils.hash(new_user.password),
        user_id,
        joined_at,
        email: new_user.email,
        gender: new_user.gender,
        phone: new_user.phonenum
    })
    user.save((err, doc) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        }
        else {
            // Modifying session cookies
            req.session.userID = doc.user_id;
            req.session.loggedIn = true;
            res.status(200).redirect('/dashboard');
        }
    });
});

app.post('/login',utils.authLoginPages);

/* 404 Page  !! THIS SHOULD ALWAYS BE KEPT AT BOTTOM OF ALL MIDDLEWARES !! */
app.use((req, res) => {
    console.log("--".repeat(15));
    console.log(req.url);
    let fileToSend = "./static/html/404.html";
    fs.readFile(fileToSend, (err, data) => {
        if (err) {
            console.log("Some unknown error occured: ");
            console.log(err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error Code 500 : Internal Server Error", () => {
                console.log("Sent \"Error Code 500 : Internal Server Error\"");
            })
        }
        else {
            let ext = fileToSend.split('.');
            ext = ext[ext.length - 1];
            res.writeHead(404, { "Content-Type": mapExtToContentType[ext] });
            res.end(data, () => {
                console.log(`sent ${fileToSend}`);
            });
        }
    });
})

/* SERVER DEPLOYMENT */
app.listen(port, () => {
    console.log(`Express: Server is up and running on port ${port} \nlocalhost:${port}`);
});