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
    let user_id = req.session.userId;
    let params = {

    };
    res.status(200).render('dashboard', params);
});

/* POST requests -------------------------------------------------------------------------------------------------------------------------- */
app.post('/',utils.authLoginPages, (req, res) => {
    let new_user = req.body;
    console.log(new_user);

    let joined_at = Math.floor(Date.now() / 1000);
    let user_id = utils.generateUUID(new_user.name, joined_at);

    // check if email is already in collection
    let email_exists = true;
    Users.findOne({ email: new_user.email }, (err, doc) => {
        if (err) {
            console.log(err);
            email_exists = false;
        }
        else {
            if (doc) {
                console.log("email exists");
                res.status(404).redirect('/404');
                return;
            }
            else {
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
                console.log(`user doc unsaved : \n ${user}`);
                user.save((err, doc) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    }
                    else {
                        if(doc){
                            // Modifying session cookies
                            req.session.userID = doc.user_id;
                            req.session.loggedIn = true;
                            res.status(200).redirect('/dashboard');
                        }
                        else{
                            res.status(500).send("Internal Server Error");
                        }
                    }
                });
            }
        }
    })
});

app.post('/login', (req, res) => {
    let inps = req.body;
    console.log('post /login');
    console.log(inps);
    if ((inps.email == 'a@b.com') && (utils.hash(inps.password) == utils.hash("pass123"))) {
        req.session.loggedIn = true;
        res.status(200).redirect('/dashboard');
    }
    else {
        res.status(404).redirect('404');
    }
})

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