/* 
    Utility Functions which are used in app.js 
*/
const prompt = require('prompt-sync')({sigint:true});

function generateAlphabets(){
    let alphArr = [];
    for (let i = 97;i<123;i++){
        alphArr.push(String.fromCharCode(i));
    }
    return alphArr;
}

function max(a,b){
    return a>b? a:b; 
}

function replaceAt(stringx,index,char) {
    if(index<0){
        index = stringx.length-index;
    }
    if(index>=stringx.length){
        return stringx;
    }
    else{
        let strArr = stringx.split("");
        strArr[index] = char;
        return strArr.join("");
    }
}

function hash(string){
    let alphabets = generateAlphabets();
    let intervalList = [];
    let charCodes = [];
    let hashed = '';
    let maxNum = max(0,string.charCodeAt(0));
    charCodes.push(string.charCodeAt(0));
    for(let i=0;i<string.length-1;i++){
        intervalList.push(`${string.charCodeAt(i+1)}`.length);
        charCodes.push(string.charCodeAt(i+1));
        hashed += `${string.charCodeAt(i)}${string.charCodeAt(i+1)}`;
        maxNum = max(maxNum,string.charCodeAt(i+1));
    }
    let availableIndicies = Array.from(Array(hashed.length).keys());
    for(let i=0,j=0,iter=0;i<intervalList.length && iter<2;i++){
        hashed = j%2==0? replaceAt(hashed,(j+1)%hashed.length,alphabets[(charCodes[i])%26]) : replaceAt(hashed,(j+1)%hashed.length,alphabets[(charCodes[i])%26].toUpperCase());
        availableIndicies[(j+1)%hashed.length] = -1;
        j += intervalList[i];
        if(i==intervalList.length-1){
            i=0;
            iter++;
        }
    }
    let tempAvlInd = availableIndicies.filter((x)=>{return x != -1});
    for(let i=0;i<tempAvlInd.length;i++){
        let indx = tempAvlInd[i];
        hashed = i%2==0? replaceAt(hashed,indx,alphabets[(charCodes[indx%charCodes.length])%26]) : hashed = replaceAt(hashed,indx,`${indx%10}`);
    }
    return hashed;
}

function generateUUID(username,timestamp) {
    let tstr = `${timestamp}`;
    let id_length = 30;
    let hashed = hash(username);
    let uuid = '-'.repeat(id_length);
    // Writing timestamp numbers at the even indicies of uuid
    for(let i=0,j=0;i<tstr.length*2;i++){
        if(i%2==0){
            uuid = replaceAt(uuid,i,tstr[j]);
            j++;
        }
    }
    // Writing hashed text characters at odd indicies of uuid only until the index where writing of timestamp ended
    let tempI = 0;
    let tempJ = 0;
    for(let i=0,j=0;(i<hashed.length*2) && (i<tstr.length*2);i++){
        if(i%2!=0){
            uuid = replaceAt(uuid,i,hashed[j]);
            j++;
            // keeping record of till where the characters have been written
            tempI = i;
            tempJ = j;
        }
    }
    // writing hashed text at remaining indicies of uuid, until id_length is reached
    for(let i=tempI,j=tempJ;i<id_length;i++,j++){
        uuid = replaceAt(uuid,i,hashed[j]);
    }
    return uuid;
}

function authCheck(req,res,next){
    if(req.session.loggedIn && req.session.userID){
        next();
    }
    else{
        res.status(200).redirect("/");
    }
}

function authLoginPages(req,res,next){
    // req.session.loggedIn = true; // TODO : Remove this line after designing dashboard pages 
    if(req.session.loggedIn){
        res.status(200).redirect("/home");
    }
    else{
        next();
    }
}

function getDateTimeStr(dt){
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let seconds = dt.getUTCSeconds();
    let minutes = dt.getUTCMinutes();
    let hours = dt.getUTCHours();
    let day = dt.getUTCDate();
    let month = dt.getUTCMonth();
    let year = dt.getUTCFullYear();
    let ampm = "AM";
    if (hours > 12) {
        hours -= 12;
        ampm = "PM";
    }
    let tcomponents = [day,hours,minutes,seconds];
    for(let i = 0;i<tcomponents.length;i++){
        if(tcomponents[i]<10){
            tcomponents[i] = `0${tcomponents[i]}`;
        }
    }
    [day,hours,minutes,seconds] = tcomponents;
    return `${day}/${months[month]}/${year} - ${hours}:${minutes}:${seconds} ${ampm} [UTC]`;
}

function getAgeFromTimestamp(timestamp){
    let birthday = new Date(timestamp);
    let ageDiffMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function getTimeAgo(timestamp){
    let tsnow = Math.floor(Date.now()/1000);
    let temp_ts = tsnow-timestamp;
    let minute = 60;
    let hour = 60*minute;
    let day = 24*hour;
    let week = 7*day;
    let year = 365*day;
    let res_str = "";
    let tlist = [0,0,0,0,0];
    while(temp_ts>=minute){
        if(temp_ts>=year){
            tlist[0]++;
            temp_ts -= year;
        }
        else if(temp_ts>=week){
            tlist[1]++;
            temp_ts -= week;
        }
        else if(temp_ts>=day){
            tlist[2]++;
            temp_ts -= day;
        }
        else if(temp_ts>=hour){
            tlist[3]++;
            temp_ts -= hour;
        }
        else{
            tlist[4]++;
            temp_ts -= minute;
        }
    }
    let changed = false;
    for(let i=0;i<tlist.length;i++){
        if(tlist[i]){
            changed = true;
        }
    }
    let slist = ["Years","Weeks","Days","Hours","Minutes"];
    if(changed){
        for(let i=0;i<slist.length;i++){
            if(tlist[i]){
                res_str += `${tlist[i]} ${slist[i]} `;
            }
        }
        res_str += `${temp_ts} Seconds `;
        return `${res_str}ago`;
    }
    else{
        return "few seconds ago";
    }
}

if(require.main===module){
    let ts = Math.floor(Date.now()/1000);
    let ots = 1657301023;
    console.log(`getDate : ${getTimeAgo(ots)}`);
}

module.exports = {
    generateAlphabets,
    max,
    replaceAt,
    getTimeAgo,
    hash,
    authCheck,
    generateUUID,
    authLoginPages,
    getDateTimeStr,
    getYearsFromTimestamp: getAgeFromTimestamp,
}
