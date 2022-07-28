const fs = require("fs");

/* Loading .env */
require("dotenv").config();
const envs = process.env;

const config = {
    "PROTOCOL" : "http",
    "HOST" : "localhost",
    "PORT" : 80,
}

function generateConfigFile(){
    let config_text = "";
    Object.keys(config).forEach((key)=>{
        config_text += `let ${key} = "${config[key]}";\n`;
    });
    fs.writeFileSync("./static/js/config.js",config_text);
    console.log(config);
}

module.exports = {
    envs,
    config,
    generateConfigFile
}