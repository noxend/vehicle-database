
// let darkTheme = localStorage.setItem('dark_theme', 'true');
let ifDarkTheme = localStorage.getItem('dark_theme');

if(ifDarkTheme === 'true'){
  document.getElementsByTagName('html')[0].classList = 'dark-theme';
} else {
  document.getElementsByTagName('html')[0].classList = 'none';
}