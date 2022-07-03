let male = document.getElementById('male');
let genInp = document.getElementById('gendertxt');
let female = document.getElementById('female');
let targDiv = document.getElementsByClassName('dis')[0];
let radElement = document.getElementById('other');
let mainContainer = document.getElementsByClassName('mainContainer')[0];

male.addEventListener('change', () => {
    mainContainer.style.height = '27rem';
    targDiv.style.display = 'none';
    genInp.value = '';
});
female.addEventListener('change', () => {
    mainContainer.style.height = '27rem';
    targDiv.style.display = 'none';
    genInp.value = '';
});
radElement.addEventListener('change', () => {
    mainContainer.style.height = '29.5rem';
    targDiv.style.display = 'block';
});
