let male = document.getElementById('male');
let genInp = document.getElementById('gendertxt');
let female = document.getElementById('female');
let targDiv = document.getElementsByClassName('dis')[0];
let radElement = document.getElementById('other');
let mainContainer = document.getElementsByClassName('mainContainer')[0];

male.addEventListener('change', () => {
    mainContainer.style.height = '27.2rem';
    targDiv.style.display = 'none';
    genInp.value = '';
});
female.addEventListener('change', () => {
    mainContainer.style.height = '27.2rem';
    targDiv.style.display = 'none';
    genInp.value = '';
});
radElement.addEventListener('change', () => {
    mainContainer.style.height = '30rem';
    targDiv.style.display = 'block';
});
