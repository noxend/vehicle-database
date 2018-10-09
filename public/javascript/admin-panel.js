let check = document.getElementsByClassName("checkbox");
let btnSave = document.getElementById("btn-save");
let btnRemove = document.getElementById("btn-remove");
let dataTable = document.getElementById("data");
let userName = document.getElementsByClassName("user-name"); 

for(let i = 0; i < userName.length; i++){
  userName[i].addEventListener('dblclick', () => {
    console.log(userName[i]);
  });
}

btnSave.addEventListener("click", () => {
  let arrID = [];
  let removeID = [];
  let counter = 0;

  for (let i = 0; i < check.length; i++) {
    if (check[i].checked == true) {
      arrID[counter++] =
        check[i].parentNode.parentNode.lastChild.previousSibling.textContent;
      removeID[i] = check[i].parentNode.parentNode;
    }
  }

  fetch("/api/admin-panel/remove", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(arrID)
  }).then(function(response) {
    response.json().then(function(data) {
      console.log(data.message);
      removeID.forEach((item) => {
        dataTable.removeChild(item);
      });
    });
  });
});
