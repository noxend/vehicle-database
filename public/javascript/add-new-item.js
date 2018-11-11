fetch("/api/vehicle/mark")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let mark = document.getElementById("mark");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.mark_name;
      mark.appendChild(option);
    });
  });

fetch("/api/vehicle/country")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("country");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.country;
      country.appendChild(option);
    });
  });

  fetch("/api/vehicle/color")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("color");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.color;
      country.appendChild(option);
    });
  });

fetch("/api/vehicle/type-engine")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("engine");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.type;
      country.appendChild(option);
    });
  });

fetch("/api/vehicle/type-fuel")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("fuel");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.type;
      country.appendChild(option);
    });
  });

  fetch("/api/vehicle/type-gearbox")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("transmission");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.type;
      country.appendChild(option);
    });
  }); 



  
  fetch("/api/vehicle/type-car")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    let country = document.getElementById("body");
    data.forEach(el => {
      let option = document.createElement("option");
      option.value = el.id;
      option.textContent = el.type;
      country.appendChild(option);
    });
  }); 
