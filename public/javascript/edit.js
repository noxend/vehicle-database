

const url = location.href;
const id = url.split("edit/")[1];

const form = document.querySelector('form');

const mark = document.getElementById('mark');
const body = document.getElementById('body');
const model = document.querySelector('input[name=model]');
const year = document.querySelector('input[name=year]');
const image = document.querySelector('input[name=image]');
const country = document.getElementById('country');
const color = document.getElementById('color');
const engine = document.getElementById('engine');
const fuel = document.getElementById('fuel');
const power = document.querySelector('input[name=power]');
const transmission = document.getElementById('transmission');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  updateData();
});

const getData = (id) => {
  fetch(`/api/vehicle/edit-data/${id}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
      mark.value = data[0].mark_id;
      model.value = data[0].model;
      body.value = data[0].type_of_car_id;
      country.value = data[0].country_id;
      year.value = data[0].year;
      color.value = data[0].color_id;
      engine.value = data[0].type_of_engine_id;
      fuel.value = data[0].type_of_fuel_id;
      power.value = data[0].power;
      image.value = data[0].image;
      transmission.value = data[0].type_of_gearbox_id;
  });
}

const updateData = () => {
  const data = {
    id,
    mark: mark.value,
    model: model.value,
    body: body.value,
    country: country.value,
    year: year.value,
    color: color.value,
    engine: engine.value,
    fuel: fuel.value,
    power: power.value,
    image: image.value,
    transmission: transmission.value
  }

  fetch("/edit", {
    method: "post",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
  .then(function(response) {
    response.json().then(function(data) {
      if (data.state) {
        location.href = '/';
      }
    });
  })
  .catch(function(err) {
    console.log("Fetch  :-S", err);
  });

}

const main = () => {
  getData(id);
}

main();