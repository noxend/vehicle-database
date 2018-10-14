let ifDarkTheme = localStorage.getItem('dark_theme');

window.onload = () => {
  let toggle = document.getElementById('checkbox-nav');
  toggle.addEventListener('click', (e) => {
    if(toggle.checked == true){
      localStorage.setItem('dark_theme', 'true');
      document.getElementsByTagName('html')[0].classList = 'dark-theme';
    } else {
      localStorage.setItem('dark_theme', 'false');
      document.getElementsByTagName('html')[0].classList = 'none';
    }
  });
  if(ifDarkTheme == "true"){
    toggle.checked = true;
  }
}

if(ifDarkTheme == 'true'){
  document.getElementsByTagName('html')[0].classList = 'dark-theme';
} else {
  document.getElementsByTagName('html')[0].classList = 'none';
}
