

let menuDetails = document.getElementById('my-menu-id');
let menu = document.getElementById('menu-container');
let toggleBtn = document.getElementById('toggle-btn');
let state = false;

menu.addEventListener('click', () => {
  if(!state) {
    menuDetails.classList = 'my-menu show';
    state = !state;
  } else {
    menuDetails.classList = 'my-menu hiden';
    state = !state;
  }
});

document.addEventListener('mouseup', (e) => { 
  
  if(e.target != menuDetails && state && e.target.parentNode.parentNode.parentNode.parentNode != menuDetails){
    menuDetails.classList = 'my-menu hiden';
    state = !state;
  }
});


