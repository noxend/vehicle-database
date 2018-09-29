const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const config = require("./config");
const mysql = require("./db");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");

const router = express.Router();

const app = express();

const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "128500",
  database: "mydb"
});

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: sessionStore
  })
);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let ID, LOGIN, ADMIN;

app.get("/", (request, response) => {
  ID = request.session.userId;
  LOGIN = request.session.userLogin;
  ADMIN = request.session.admin;

  mysql.connection.query("SELECT * FROM vehicle", (err, results) => {
    if (err) {
      response.send(err);
    } else {
      response.render("index", { data: results, LOGIN, ID, ADMIN });
    }
  });
});

app.use(
  "/api/auth",
  router.get("/logout", (request, response) => {
    if (request.session) {
      request.session.destroy(() => {
        response.redirect("/");
      });
    } else {
      response.redirect("/");
    }
  })
);

app.get("/add", (req, res) => {
  if (req.session.admin || req.session.login) {
    mysql.connection.query("SELECT * FROM vehicle_type", (err, results) => {
      if (!err) res.render("create", { data: results, LOGIN, ADMIN });
      else console.log(err);
    });
  } else {
    res.send("oops");
  }
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
          dbl: results.length,
          LOGIN,
          ID
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
      res.json({ data: results });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    LOGIN,
    ID
  });
});

app.post("/login", (request, response) => {
  const login = request.body.login;
  const pass = request.body.pass;

  if (!login || !pass) {
    response.json({
      ok: false,
      errMessage: "Всі поля повинні бути заповненні!",
      fields: ["userName", "pass"]
    });
  } else {
    mysql.connection.query(
      `select * from users where user_name = '${login}'`,
      (err, results) => {
        if (!results[0]) {
          response.json({
            ok: false,
            errMessage: "Неправильний логін або пароль!",
            fields: ["login", "pass"]
          });
        } else {
          bcrypt.compare(pass, results[0].pass_hash, function(
            err,
            resultsHash
          ) {
            if (resultsHash) {
              setSessions(request, results);
              response.json({
                ok: true,
                ge: "OK"
              });
            } else {
              response.json({
                ok: false,
                errMessage: "Неправильний логін або пароль!",
                fields: ["login", "pass"]
              });
            }
          });
        }
      }
    );
  }
});

app.get("/signin", (req, res) => {
  res.render("signin", {
    LOGIN,
    ID
  });
});

app.post("/signin", (request, response) => {
  const userName = request.body.login;
  const pass = request.body.pass;
  const passConfirm = request.body.passConfirm;

  if (!userName || !pass || !passConfirm) {
    response.json({
      ok: false,
      errMessage: "Всі поля повинні бути заповненні!",
      fields: ["userName", "pass", "confirmPass"]
    });
  } else if (!/^[a-zA-Z0-9]+$/.test(userName)) {
    response.json({
      ok: false,
      errMessage: "Тільки латинські букви та цифри!",
      fields: ["userName"]
    });
  } else if (userName.length < 3 || userName.length > 16) {
    response.json({
      ok: false,
      errMessage: "Довжина логіну від 3 до 16 символів!",
      fields: ["userName"]
    });
  } else if (pass !== passConfirm) {
    response.json({
      ok: false,
      errMessage: "Паролі не співпадають",
      fields: ["pass", "confirmPass"]
    });
  } else {
    mysql.connection.query(
      `select * from users where user_name = '${userName}'`,
      (err, results) => {
        if (err) {
          response.send(err);
        } else {
          if (!results[0]) {
            bcrypt.hash(pass, null, null, function(err, hash) {
              mysql.connection.query(
                `INSERT INTO users (user_name, pass_hash, admin) VALUES ('${userName}', '${hash}', '0')`,
                (err, res) => {
                  mysql.connection.query(
                    `select * from users where user_name = '${userName}'`,
                    (err2, res2) => {
                      setSessions(request, res2);
                      response.json({
                        ok: true,
                        errMessage: "Реєстрацію завершено!"
                      });
                    }
                  );
                }
              );
            });
          } else {
            response.json({
              ok: false,
              errMessage: "Такий користувач вже існує!",
              fields: ["userName"]
            });
          }
        }
      }
    );
  }
});

function setSessions(req, value) {
  req.session.userId = value[0].id;
  req.session.userLogin = value[0].user_name;
  req.session.admin = value[0].admin;
}

app.use(function(req, res, next) {
  res.status(404);
  res.render("404", { data: "Вибачте, такої сторінки не існує!", LOGIN });
});

app.listen(config.PORT, () => {
  console.log(`Listening port ${config.PORT}`);
});
