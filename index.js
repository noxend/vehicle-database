const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const mysql = require("./db");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");

const router = express.Router();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  mysql.connection.query("SELECT * FROM vehicle", (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.render("index", { data: results });
    }
  });
});

app.get("/add", (req, res) => {
  mysql.connection.query("SELECT * FROM vehicle_type", (err, results) => {
    if (!err) res.render("create", { data: results });
    else console.log(err);
  });
});

app.post("/add", (req, res) => {
  res.send(req.body);
  // res.redirect("/");
});

// app.get('/info/:id', (req, res) => {
//     mysql.connection.query(`SELECT * FROM vehicle`, (err, results) => {
//         if (err) { res.send(err); } else {
//             if(req.params.id > results.length){
//                 res.render('404');
//             } else {
//                 var result = results.find((result) => {
//                     return result.id === Number(req.params.id);
//                 });
//                 res.send(result);
//                 // res.render('infocar', { data: result, dbl: results.length});
//             }
//         }
//     });
// });

app.get("/info/:id", (req, res) => {
  mysql.connection.query(`call query_car(${req.params.id})`, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      if (!results[0][0]) {
        res.render("404", { data: "Вибачте, такої сторінки не існує!" });
      } else {
        // res.send(results);
        res.render("infocar", {
          data: results[0][0],
          dbl: results.length
        });
      }
    }
  });
});

app.get("/db", (req, res) => {
  mysql.connection.query(mysql.selectCar(), (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.json({
        data: results
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render('login')
});

app.post("/login", (req, res) => {
  res.send(req.body)
});

app.get("/signin", (req, res) => {
  res.render('signin')
});

app.post("/signin", (req, res) => {
  const userName = req.body.login;
  const pass = req.body.pass;
  const passConfirm = req.body.passConfirm;

  if(!userName || !pass || !passConfirm){
    res.json({
      ok: false,
      errMessage: "Всі поля повинні бути заповненні!",
      fields: ['userName', 'pass', 'confirmPass']
    });
  } else if (userName.length < 3 || userName.length > 16) {
    res.send({
      ok: false,
      errMessage: "Довжина логіну від 3 до 16 символів!",
      fields: ['userName']
    });
  } else if (pass !== passConfirm){
    res.send({
      ok: false,
      errMessage: "Паролі не співпадають",
      fields: ['pass', 'confirmPass']
    });
  } else{
    res.json({
      ok: true
    });
    
    bcrypt.hash(pass, null, null, function(err, hash) {
      console.log(hash)
      mysql.connection.query(`INSERT INTO users (user_name, pass_hash) VALUES ('${userName}', '${hash}');`, (err, results) => {
        if (err) {res.send(err)} else {}
      });
    });
  }
});

app.use(function(req, res, next) {
  res.status(404);
  res.render("404", { data: "Вибачте, такої сторінки не існує!" });
});

app.listen(config.PORT, () => {
  console.log(`Listening port ${config.PORT}`);
});
