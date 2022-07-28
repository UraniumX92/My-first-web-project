// Use this function in login.html form
function onSubmit(){
    let email_val = document.getElementById('email_').value;
    let password_val = document.getElementById('password').value;
    let flag = true;
    if(email_val== '' || password_val == ''){
        alert("Enter your credentials!");
        flag = false;
    }
    if(flag){
        email_val = encodeURIComponent(email_val);
        password_val = encodeURIComponent(password_val);
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
        xhttp.open("GET",`${PROTOCOL}://${HOST}:${PORT}/lgcheck?email=${email_val}&password=${password_val}`,false);
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
        let email_value = encodeURIComponent(document.getElementById("email_").value);
        let password_value = encodeURIComponent(document.getElementById("password").value);
        let name_value = encodeURIComponent(document.getElementById("name_").value);
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
        xhttp.open("GET",`${PROTOCOL}://${HOST}:${PORT}/createAccCheck?name=${name_value}&email=${email_value}&password=${password_value}`,false);
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
