// Use this function in login.html form
function onSubmit(){
    let email_inp = document.getElementById('email_');
    let password_inp = document.getElementById('password');
    let flag = true;
    if(email_inp.value== '' || password_inp.value == ''){
        alert("Enter your credentials!");
        flag = false;
    }

    if(flag){
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function(){
            let error_element = document.getElementById('error');
            if(this.responseText!="pass"){
                error_element.innerHTML = this.responseText;
                flag = false;
            }
            else{
                flag = true;
            }
        }
        xhttp.open("GET",`http://localhost/lgcheck?email||is||${email_inp.value}||end_value||password||is||${password_inp.value}||end_value||`,false);
        xhttp.send();
    }
    
    return flag;
}

// Use this function in index.html form
function on_submit() {
    let textInps = document.getElementsByClassName('text-inp');
    let genInp = document.getElementById("gendertxt");
    let genDiv = document.getElementById("gentxt-div");
    let flag = true;
    let i = 0;
    Object.keys(textInps).forEach((key) => {
        if (flag) {
            if (textInps[key].value == '') {
                if (genInp == textInps[key] && getComputedStyle(genDiv).display == 'none') {
                    // If the element is custom gender input and it is disabled then ignore the empty field.
                    flag = true;
                }
                else {
                    alert("Please Enter all the details.");
                    flag = false;
                }
            }
        }
        i++;
    });

    if(flag){
        let xhttp = new XMLHttpRequest();
        let email_value = document.getElementById("email_").value;
        let password_value = document.getElementById("password").value;
        let name_value = document.getElementById("name_").value;
        let err_element = document.getElementById("error");
        xhttp.onload = function(){
            if(this.responseText!='pass'){
                err_element.innerHTML = this.responseText;
                flag = false;
            }
            else{
                flag = true;
            }
        }
        xhttp.open("GET",`http://localhost/createAccCheck?name||is||${name_value}||end_value||email||is||${email_value}||end_value||password||is||${password_value}||end_value||`,false);
        xhttp.send();
    }

    if (flag && getComputedStyle(genDiv).display != 'none') {
        radElement.setAttribute('value', genInp.value);
    }
    return flag;
}

function show_hide() {
    let passInp = document.getElementById('password');
    if (passInp.type == 'password') {
        passInp.type = 'text';
    }
    else {
        passInp.type = 'password';
    }
}

function checkLogout(){
    return confirm("Are you sure you want to logout?");
}
function delAcc(){
    let password =  prompt("Enter the password associated with your account to confirm the deletion of account");
    if(password===null || password===""){
        return false;
    }
    let xhttp = new XMLHttpRequest();
    let check;
    xhttp.onload = function(){
        check = JSON.parse(this.responseText.toLowerCase());
    }
    xhttp.open("GET",`http://localhost:80/delAcc?password||is||${password}||end_value||`,false);
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