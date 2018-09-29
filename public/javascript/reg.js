"use strict";
let notification = document.createElement("div");
let form = document.getElementById("form");

function insertAfter(elem, refElem) {
  var parent = refElem.parentNode;
  var next = refElem.nextSibling;
  if (next) {
    return parent.insertBefore(elem, next);
  } else {
    return parent.appendChild(elem);
  }
}

document.getElementById("btnSignIn").addEventListener("click", e => {
  e.preventDefault();
  let data = {
    login: document.getElementById("userNameSignIn").value,
    pass: document.getElementById("passNameSignIn").value,
    passConfirm: document.getElementById("confirmPassNameSignIn").value
  };

  fetch("/signin", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
    .then(function(response) {
      response.json().then(function(data) {
        console.log(data);
        if (!data.ok) {
          notification.style.opacity = '1';
          notification.classList = "notification warning";
          notification.innerHTML = `<span class="closebtn">&times;</span>
                                    <strong>Помилка! </strong>${
                                      data.errMessage
                                    }`;
          insertAfter(notification, form.childNodes[1]);
          
        } else {
          notification.style.opacity = '1'; 
          notification.classList = "notification success";
          notification.innerHTML = `<span class="closebtn">&times;</span>
                                    <strong>OK. </strong>${data.errMessage} <a href="/">На головну</a>`;
          insertAfter(notification, form.childNodes[1]);
          location.href = '/';
        }
        let close = document.getElementsByClassName("closebtn");
        for (let i = 0; i < close.length; i++) {
          close[i].onclick = function() {
            var div = this.parentElement;
            div.style.opacity = "0";
            setTimeout(function() {
              form.removeChild(notification);
            }, 600);
          };
        }
      });
    })
    .catch(function(err) {
      console.log("Fetch  :-S", err);
    });
});
