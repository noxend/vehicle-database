let check = document.getElementsByClassName("checkbox");
let btnSave = document.getElementById("btn-save");
let btnRemove = document.getElementById("btn-remove");
let dataTable = document.getElementById("data");
let userName = document.getElementsByClassName("user-name");
let btnGetData = document.getElementById("button-get-data");
let rowTable = document.getElementsByClassName("my-table");
let updateUserDataBtn = document.getElementById("save-user-data");

let ID;

for (let i = 0; i < rowTable.length; i++) {
  rowTable[i].addEventListener("click", () => {
    let id = +rowTable[i].lastChild.previousSibling.textContent;
    fetch(`/api/data/user/${id}`)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {

        document.getElementById("modal-window-id").classList = "modal-window-bg";
        document.getElementById("modal-window-my-id").classList = "modal-window-my";

        document.getElementById("user-login").value = data.data[0].user_name;
        ID = data.data[0].id;

        if(data.data[0].admin == 1){
          document.getElementById("if-user-admin").checked = true;
        }
      });
  });
}

function closeModal() {

  document.getElementById("modal-window-id").classList = "modal-window-bg hiden";
  document.getElementById("modal-window-my-id").classList = "modal-window-my hiden";

  document.getElementById("if-user-admin").checked = false;
}

window.document.addEventListener('click', () => {
  if (event.target == document.getElementById('modal-window-id')) {
    closeModal();
  }
});


btnSave.addEventListener("click", () => {
  let arrID = [];
  let removeID = [];
  let counter = 0;

  for (let i = 0; i < check.length; i++) {
    if (check[i].checked == true) {
      arrID[counter++] =
        +check[i].parentNode.parentNode.lastChild.previousSibling.textContent;
      removeID[i] = check[i].parentNode.parentNode;
    }
  }


  fetch("/api/user/remove", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(arrID)
  }).then(function(response) {
    response.json().then(function(data) {
      if (data.state) {
        console.log(data.message);
        removeID.forEach(item => {
          dataTable.removeChild(item);
        });
      } else {
        console.log(data.message);
      }
    });
  });
});

updateUserDataBtn.addEventListener('click', (e) => {
  
  let data = {
    newLogin: document.getElementById("user-login").value,
    userRole: document.getElementById("if-user-admin").checked,
    ID
  }

  fetch("/api/user/update", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  }).then(function(response) {
    response.json().then(function(data) {
      console.log(data);
    });
  });

  closeModal();

});

window.addEventListener('keydown', (e) => {
  if(e.keyCode === 27) {
    closeModal();
  }
});