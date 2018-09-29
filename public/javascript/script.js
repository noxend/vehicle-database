
let dark_theme = localStorage.setItem('dark_theme', 'false');

if(localStorage.getItem('dark_theme') === 'true'){
  document.getElementsByTagName('html')[0].classList = 'dark-theme';
} else {
  document.getElementsByTagName('html')[0].classList = 'none';
}
