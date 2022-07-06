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
    let hashed = hash(username);
    let uuid = '-'.repeat(Array.from(Array(hashed.length+tstr.length).fill('')).length);
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
    uuid = replaceAt(uuid,tempI++,'-');
    // writing hashed text at remaining indicies of uuid. there is 1 '-' character left in the end always
    for(let i=tempI,j=tempJ;j<hashed.length;i++,j++){
        uuid = replaceAt(uuid,i,hashed[j]);
    }
    // Removing the last '-' character
    return uuid.slice(0,uuid.length-1);
}

function authCheck(req,res,next){
    if(req.session.loggedIn){
        next();
    }
    else{
        res.status(200).redirect("/");
    }
}

function authLoginPages(req,res,next){
    if(req.session.loggedIn){
        res.status(200).redirect("/dashboard");
    }
    else{
        next();
    }
}

if(require.main===module){
    let ts = Math.floor(Date.now()/1000);
    let name = prompt("Enter name: ");
    console.log(`UUID : ${generateUUID(name,ts)}`);
    // let sl = [];
    // for(let i=0;i<2;i++){
    //     let stringx = prompt("Enter text to hash: ");
    //     let hashed = hash(stringx);
    //     sl.push(hashed);
    //     console.log(hashed);
    // }
    // console.log(sl[0]==sl[1]);
}

module.exports = {
    generateAlphabets,
    max,
    replaceAt,
    hash,
    authCheck,
    generateUUID,
    authLoginPages,
}
