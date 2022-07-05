const express = require('express');
const fs  = require('fs');
const path = require('path');
const hashing = require('./custom_hash')

/* APP CONFIGURATIONS */
const port = 80;
const app = express();

app.use(express.static('static'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','pug')
app.set('views',path.join(__dirname,'templates'))


const STATIC_GETS = {
    '/'             : './static/html/index.html',
    '/login'        : './static/html/login.html',
};

const mapExtToContentType = {
    'html': 'text/html',
    'css' : 'text/css',
    'js'  : 'text/javascript',
    'png' : 'image/png',
    'ico' : 'image/x-icon',
    'jpg' : 'image/jpeg',
};

/* GET requests */ 
// Default GET Servings -------------------------------------------------------------------------------------------------------------------
Object.keys(STATIC_GETS).forEach((key)=>{
    app.get(key,(req,res)=>{
        console.log("--".repeat(15));
        console.log(req.url);
        let fileToSend = STATIC_GETS[key];
        fs.readFile(fileToSend,(err,data)=>{
            if(err){
                console.log("Some unknown error occured: ");
                console.log(err);
            }
            else{
                let ext = fileToSend.split('.');
                ext = ext[ext.length-1];
                res.writeHead(200,{"Content-Type":mapExtToContentType[ext]});
                res.end(data,()=>{
                    console.log(`sent ${fileToSend}`);
                });
            }
        });
    });
});

app.get("/dashboard",(req,res)=>{
    res.status(200).render('dashboard');
});

// --- POST requests ----------------------------------------------------------------------------------------------------------------------
app.post('/',(req,res)=>{
    let inps = req.body;
    let params = {
        'name'      : inps.name,
        'phonenum'  : inps.phonenum,
        'email'     : inps.email,
        'h_pass'    : hashing.hash(inps.password),
        'gender'    : inps.gender
    }
    console.log(inps);
    let form_inputs = JSON.stringify(req.body,null,4);
    res.status(200).render('temp',params);
});

app.post('/login',(req,res)=>{
    let inps = req.body;
    console.log('post /login');
    console.log(inps);
    if((inps.email == 'a@b.com') && (hashing.hash(inps.password) == hashing.hash("pass123"))){
        res.status(200).redirect('/dashboard');
    }
    else{
        res.status(404).redirect('404');
    }
})

// 404 Page  !! THIS SHOULD ALWAYS BE KEPT AT BOTTOM OF ALL MIDDLEWARES !!
app.use((req,res)=>{
    console.log("--".repeat(15));
    console.log(req.url);
    let fileToSend = "./static/html/404.html";
    fs.readFile(fileToSend,(err,data)=>{
        if(err){
            console.log("Some unknown error occured: ");
            console.log(err);
            res.writeHead(500,{"Content-Type":"text/plain"});
            res.end("Error Code 500 : Internal Server Error",()=>{
                console.log("Sent \"Error Code 500 : Internal Server Error\"");
            })
        }
        else{
            let ext = fileToSend.split('.');
            ext = ext[ext.length-1];
            res.writeHead(404,{"Content-Type":mapExtToContentType[ext]});
            res.end(data,()=>{
                console.log(`sent ${fileToSend}`);
            });
        }
    });
})

app.listen(port,()=>{
    console.log(`Express: Server is up and running on port ${port} \nlocalhost:${port}`);
});