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

router.post('/update', (request, response) => {
  promiseMySqlQuery(`UPDATE users SET user_name = '${request.body.newLogin}', admin = '${request.body.userRole ? 1 : 0}' WHERE id = '${request.body.ID}'`)
  .then(results => console.log(results))
  .catch(err => {console.log(err)});
}),
router.post('/remove', (request, response) => {
  for(item of request.body){
    if(request.session.userId != item){
      mysql.connection.query(`DELETE FROM users WHERE id = ${item}`, (err, req) => {
        response.json({state: true, message: "successful", arr: request.body});
      });
    } else {
      response.json({state: false, message: "error", arr: request.body});
    }
  }
})

module.exports.router = router;