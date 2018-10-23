const express = require("express");
const router = express.Router();
const mysql = require("../db");

function promiseMySqlQuery(query){
  return new Promise(function(resolve, reject) {
    mysql.connection.query(query, (err, results) => {
      if(err) { reject(err) }
      else { resolve(results) }
    });
  })
}

router.get('/all', (request, response) => {
  promiseMySqlQuery(`call select_all_car()`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/select/:id', (request, response) => {
  promiseMySqlQuery(`call q_select_car(${request.params.id})`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/type-car', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM type_of_car`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/type-engine', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM type_of_engine`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/type-fuel', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM type_of_fuel`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/type-gearbox', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM type_of_gearbox`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/mark', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM mark`)
  .then(results => response.send(results))
  .catch(err => {console.log(err)});
}),

router.get('/mark/:id', (request, response) => {
  promiseMySqlQuery(`SELECT * FROM mark WHERE id = '${request.params.id}'`)
  .then(results => response.send(results[0]))
  .catch(err => {console.log(err)});
}),

module.exports.router = router;