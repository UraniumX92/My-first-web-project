// Use this function in login.html form
function onSubmit(){
    let inps = document.getElementsByClassName('inps');
    let flag = true;
    Object.keys(inps).forEach((key)=>{
        if(flag){
            if(inps[key].value == ''){
                alert("Fields cannot be empty");
                flag = false;
            }
        }
    });
    return flag;
}

// Use this function in index.html form
function on_submit() {
    let textInps = document.getElementsByClassName('text-inp');
    let flag = true;
    let i = 0;
    Object.keys(textInps).forEach((key) => {
        if (flag) {
            if (textInps[key].value == '') {
                if (i == 4 && getComputedStyle(targDiv).display == 'none') {
                    // If the element is custom gender input and it is disabled then ignore the empty field.
                    flag = true;
                }
                else {
                    alert("Your form cannot have Empty Entries");
                    flag = false;
                }
            }
        }
        i++;
    });
    if (flag) {
        radElement.setAttribute('value', genInp.value);
        alert("Your form has been submitted successfully!");
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