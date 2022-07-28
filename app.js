const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const utils = require("./utils");
const https = require("https");
const path = require("path");
const cfg = require("./configGen");
const fs = require("fs");

/* Generating config file for client side scripts */
cfg.generateConfigFile();
const envs = cfg.envs;

/* CONNECTING TO MONGODB CLIENT */
let mongo_user = envs.MONGO_USER;
let mongo_password = envs.MONGO_PASSWORD;
let mongo_options = {
    dbName: "WebP1",
    autoIndex: false,
}

mongoose.connect(`mongodb+srv://${mongo_user}:${mongo_password}@cluster0.zfovk.mongodb.net/test`, mongo_options,(err)=>{
    if(err){
        console.log(`ERROR CONNECTING TO MONGO : ${err}`);
    }
    else{
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
const protocol = cfg.config.PROTOCOL;
const host = cfg.config.HOST;
const port = cfg.config.PORT;
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
    '/': './static/html/login.html',
    '/createAcc': './static/html/createAcc.html',
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
Object.keys(LOGIN_GETS).forEach((key)=>{
    app.get(key, utils.authLoginPages,(req, res)=>{
        console.log("--".repeat(15));
        console.log(req.url);
        let fileToSend = LOGIN_GETS[key];
        fs.readFile(fileToSend,(err, data)=>{
            if(err){
                console.log("Some unknown error occured: ");
                console.log(err);
            }
            else{
                let ext = fileToSend.split('.');
                ext = ext[ext.length - 1];
                res.writeHead(200, { "Content-Type": mapExtToContentType[ext] });
                res.end(data,()=>{
                    console.log(`sent ${fileToSend}`);
                });
            }
        });
    });
});

app.get("/home", utils.authCheck,(req, res)=>{
    let dob_ts = Number(envs.MY_DOB_TS);
    let user_id = req.session.userID;
    Users.findOne({ user_id: user_id },(err, doc)=>{
        if(err){
            res.status(500).send("Internal server error");
            return;
        }
        if(doc){
            let params = {
                name: doc.user_name,
                user_id: doc.user_id,
                email: doc.email,
                gender: doc.gender,
                phone: doc.phone,
                member_since: utils.getTimeAgo(doc.joined_at),
                my_age : utils.getYearsFromTimestamp(dob_ts*1000),
            }
            res.status(200).render("home", params);
        }
    })
});

app.get("/projects",utils.authCheck,(req, res)=>{
    let req_options = {
        hostname: "api.github.com",
        port: 443,
        path: "/users/UraniumX92/repos",
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': "My-web-proj"
        }
    }
    let resStr = '';
    let repoList;
    const request = https.request(req_options,(response)=>{
        response.on('data',(chunk)=>{
            resStr += chunk;
        });
        response.on('end',()=>{
            const card_class = "card";
            const lnk_class = "rlink";
            const heading = "h2";
            const heading_class = "hclass";
            const cardItem_class = "rcard-item";
            const descTxt_class = "dsc-text";
            repoList = JSON.parse(resStr);
            let temp = repoList[0];
            fs.writeFileSync("struct.txt", `${JSON.stringify(temp, null, 4)}`);
            // Todo : send the github repos from here.
            let cardsStr = '';
            for (let i = 0; i < repoList.length; i++){
                // <div></div>
                let temp_repo = repoList[i];
                let created = utils.getDateTimeStr(new Date(temp_repo.created_at));
                let updated = utils.getDateTimeStr(new Date(temp_repo.pushed_at));
                let name = temp_repo.name=="My-first-web-project"? `${temp_repo.name} (This website)` : temp_repo.name;
                cardsStr += `
                    <div class="${card_class}">
                        <${heading} class="${heading_class}">${name}</${heading}>
                        <a class="${lnk_class} ${cardItem_class}" href="${temp_repo.html_url}" target="_blank">Link to repository</a>
                        <p class="${cardItem_class}"><b>Main language : </b>${temp_repo.language}</p>
                        <p class="${descTxt_class} ${cardItem_class}"><b>Description:</b> ${temp_repo.description}</p>
                        <p class="${cardItem_class}"><b>Created on :</b>${created}</p>
                        <p class="${cardItem_class}"><b>Last updated on :</b>${updated}</p>
                        <p class="${cardItem_class}"><b>Stars :</b>${temp_repo.stargazers_count}</p>
                        <p class="${cardItem_class}"><b>Watchers :</b>${temp_repo.watchers_count}</p>
                    </div>
                `;
            }
            let user_id = req.session.userID;
            Users.findOne({ user_id: user_id },(err, doc)=>{
                if(err){
                    res.status(500).send("Internal server error");
                    return;
                }
                if(doc){
                    let params = {
                        name: doc.user_name,
                        user_id: doc.user_id,
                        email: doc.email,
                        gender: doc.gender,
                        phone: doc.phone,
                        member_since: utils.getTimeAgo(doc.joined_at),
                        repo_cards : cardsStr,
                    }
                    res.status(200).render("projects", params);
                }
            })
        });
    });
    request.on('error',(error)=>{
        res.status(200).render("err", { 'text': "Some error occured while fetching the page, try reloading the page", 'error': `${error}` });
    });
    request.end();
});

app.get("/socials",utils.authCheck,(req,res)=>{
    let user_id = req.session.userID;
    Users.findOne({ user_id: user_id },(err, doc)=>{
        if(err){
            res.status(500).send("Internal server error");
            return;
        }
        if(doc){
            let params = {
                name: doc.user_name,
                user_id: doc.user_id,
                email: doc.email,
                gender: doc.gender,
                phone: doc.phone,
                member_since: utils.getTimeAgo(doc.joined_at),
            }
            res.status(200).render("socials", params);
        }
    })
});

app.get('/logout', utils.authCheck,(req, res)=>{
    req.session.destroy();
    res.redirect("/");
});

app.get('/delAccount', utils.authCheck,(req, res)=>{
    if(req.session.delAcc){
        Users.deleteOne({ user_id: req.session.userID },(err)=>{
            if(err){
                res.status(500).send("Internal server error");
            }
            else{
                req.session.destroy();
                res.redirect("/");
            }
        })
    }
    else{
        res.redirect("/");
    }
});

// AJAX GETS -- Technically these are GET methods but they act like POST method

// AJAX -> check login credentials
app.get('/lgcheck',(req, res)=>{
    console.log('/lgcheck AJAX');
    let info = req.query;
    Users.findOne({ email: info.email },(err, doc)=>{
        if(err){
            res.status(200).send("Some error occured on server side. please reload the page and try again.");
        }
        if(!doc){
            // Email is not in db
            res.status(200).send("This Email is not registered!");
        }
        else{
            // Email is in db. now we check for correct password
            if(doc.password === utils.hash(info.password)){
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
app.get('/createAccCheck',(req, res)=>{
    console.log('/createAccCheck AJAX');
    let minPasswordLength = 8;
    let minNameLength = 5;
    let info = req.query;
    Users.findOne({ email: info.email },(err, doc)=>{
        if(err){
            res.status(200).send("Some error occured on server side. please reload the page and try again.");
        }
        if(!doc){
            // Email is not in db - Success
            if(info.name.length < minNameLength){
                res.status(200).send(`Your username must have atleast ${minNameLength} characters.`);
            }
            else if(info.password.length < minPasswordLength){
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

// AJAX -> check user's password before deleting account
app.get('/delAcc', utils.authCheck,(req, res)=>{
    console.log('/delAcc AJAX');
    let info = req.query;
    Users.findOne({ user_id: req.session.userID },(err, doc)=>{
        if(err){
            res.status(200).send("false");
        }
        if(doc){
            if(utils.hash(info.password) == doc.password){
                req.session.delAcc = true;
                res.status(200).send("true");
            }
            else{
                res.status(200).send("false");
            }
        }
    });
});

// AJAX -> change Date/Relative date in user profile card
app.get('/bDateChange', utils.authCheck,(req, res)=>{
    console.log('/bDateChange AJAX');
    let info = req.query;

    Users.findOne({ user_id: req.session.userID },(err, doc)=>{
        if(err){
            res.status(200).send("err");
            return;
        }
        if(doc){
            let ts = doc.joined_at;
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            if(info.date.includes("ago")){
                let date = new Date(ts * 1000);
                let hour = date.getUTCHours();
                let ampm = "AM";
                if(hour > 12){
                    hour -= 12;
                    ampm = "PM";
                }
                res.status(200).send(`on ${date.getUTCDate()}-${months[date.getUTCMonth()]}-${date.getUTCFullYear()} ${hour}:${date.getUTCMinutes()}:${date.getUTCSeconds()} ${ampm} [UTC]`);
            }
            else{
                res.status(200).send(utils.getTimeAgo(ts));
            }
        }
        else{
            res.status(200).send("err");
        }
    })
});

/* ----------------------------------------------------------------- POST requests --------------------------------------------------------- */
app.post('/createAcc', utils.authLoginPages,(req, res)=>{
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
    user.save((err, doc)=>{
        if(err){
            res.status(500).send("Internal Server Error");
        }
        else{
            // Modifying session cookies
            req.session.userID = doc.user_id;
            req.session.loggedIn = true;
            res.status(200).redirect('/home');
        }
    });
});

app.post('/', utils.authLoginPages);

/* 404 Page  !! THIS SHOULD ALWAYS BE KEPT AT BOTTOM OF ALL MIDDLEWARES !! */
app.use((req, res)=>{
    console.log("--".repeat(15));
    console.log(req.url + req.method);
    let fileToSend = "./static/html/404.html";
    fs.readFile(fileToSend,(err, data)=>{
        if(err){
            console.log("Some unknown error occured: ");
            console.log(err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error Code 500 : Internal Server Error",()=>{
                console.log("Sent \"Error Code 500 : Internal Server Error\"");
            })
        }
        else{
            let ext = fileToSend.split('.');
            ext = ext[ext.length - 1];
            res.writeHead(404, { "Content-Type": mapExtToContentType[ext] });
            res.end(data,()=>{
                console.log(`sent ${fileToSend}`);
            });
        }
    });
})

/* SERVER DEPLOYMENT */
app.listen(port, host,()=>{
    console.log(`Express: Server is up and running on port ${protocol}://localhost:${port} \nlocalhost:${port}`);
});