window.addEventListener('load',()=>{
    window.addEventListener('click',(event)=>{
        let pf_card = document.getElementById("profile-card");
        let pf_btn = document.getElementById("profile-btn");
        let tg_element = event.target;
        if(!pf_card.contains(tg_element) && getComputedStyle(pf_card).display=='flex' && tg_element!=pf_btn){
            pf_card.style.display = 'none';
        }
        
    });
})

function checkLogout(){
    return confirm("Are you sure you want to logout?");
}

function delAcc(){
    let password =  encodeURIComponent(prompt("Enter the password associated with your account to confirm the deletion of account"));
    if(password===null || password===""){
        return false;
    }
    let xhttp = new XMLHttpRequest();
    let check;
    xhttp.onload = function(){
        check = JSON.parse(this.responseText.toLowerCase());
    }
    xhttp.open("GET",`${PROTOCOL}://${HOST}:${PORT}/delAcc?password=${password}`,false);
    xhttp.send();
    if(!check){
        alert("Incorrect password entered, Account deletion cancelled!");
    }
    return check;
}

function onClick(){
    // Used in base.pug and its children to show-hide the profile card
    let prof_card = document.getElementById("profile-card");
    if(getComputedStyle(prof_card).display=="flex"){
        prof_card.style.display = "none";
    }
    else{
        prof_card.style.display = "flex";
    }
}

function b_changeDate(){
    let d_element = document.getElementById("acDate");
    let date_text = encodeURIComponent(d_element.innerHTML.split(":")[1]);
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function (){
        if(this.response!="err"){
            d_element.innerHTML = `Account Created : ${this.responseText}`;
        }
    }
    xhttp.open("GET",`${PROTOCOL}://${HOST}:${PORT}/bDateChange?date=${date_text}`,false);
    xhttp.send();
}