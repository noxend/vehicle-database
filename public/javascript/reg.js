"use strict";

document.getElementById("btnSignIn").addEventListener("click", e => {
  e.preventDefault();
  let data = {
    login: document.getElementById("userNameSignIn").value,
    pass: document.getElementById("passNameSignIn").value,
    passConfirm: document.getElementById("confirmPassNameSignIn").value
  };

  fetch("http://localhost:3000/signin", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
    .then(function(response) {
      response.json().then(function(data) {
        console.log(data);
      });
    })
    .catch(function(err) {
      console.log("Fetch Error :-S", err);
    });

  // var xhr = new XMLHttpRequest();
  // xhr.open("POST", '/signin', true);
  // xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8 ');
  // xhr.send(JSON.stringify(data));
  // xhr.onreadystatechange = function() {
  //   console.log(this.responseText);
  // }
});
