const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const config = require("./config");
const mysql = require("./db");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const router = express.Router();

const routersUser = require("./routers/router-user")

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





app.get("/", (request, response) => {
  let ID = request.session.userId;
  let LOGIN = request.session.userLogin;
  let ADMIN = request.session.admin;
  
  promiseMySqlQuery(`SELECT * FROM vehicle`)
    .then(results => {
      response.render("index", { data: results, LOGIN, ID, ADMIN });
    })
    .catch(err => {
      response.send(err);
    })
});


app.use('/api/user/', routersUser.router);




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

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;
  
  if (req.session.admin) {
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

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;

  promiseMySqlQuery(`call query_car(${req.params.id})`)
    .then(results => {
      if (!results[0][0]) {
        res.render("404", { data: "Вибачте, такої сторінки не існує!" });
      } else {

        res.render("infocar", {
          data: results[0][0],
          dbl: results.length,
          LOGIN,
          ADMIN,
          ID
        });
      }
    })
    .catch(err => {
      console.log('Error', err);
    });

});

app.get("/api/db", (req, res) => {
  mysql.connection.query(mysql.selectCar(), (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.json({ data: results });
    }
  });
});

app.get("/login", (req, res) => {

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;

  if(!req.session.userLogin){
    res.render("login", {
      LOGIN,
      ID
    });
  } else {
    res.redirect('/');
  }
});

app.get("/admin-panel/users", (req, res) => {

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;
  
  if(req.session.admin || req.session.login){
    promiseMySqlQuery(`SELECT * FROM users`)
      .then(results => {
        res.render("admin-panel", {
          LOGIN,
          ADMIN,
          ID,
          results
        });
      })
      .catch(err => {
        console.log('Error', err)
      })
  } else {
    res.send('nope nope nope');
  }

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
    mysql.connection.query(`select * from users where user_name = '${login}'`, (err, results) => {
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

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;

  if(!req.session.userLogin){
    res.render("signin", {
      LOGIN,
      ID
    });
  } else {
    res.redirect('/');
  }
});

app.post("/signin", (request, response) => {
  const userName = request.body.login;
  const pass = request.body.pass;
  const passConfirm = request.body.passConfirm;
  const date = Date.now();

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
    mysql.connection.query(`select * from users where user_name = '${userName}'`,(err, results) => {

        if (err) {
          response.send(err);
        } else {
          
          if (!results[0]) {
            bcrypt.hash(pass, null, null, function(err, hash) {
              mysql.connection.query(`INSERT INTO users (user_name, pass_hash, admin, create_time) VALUES ('${userName}', '${hash}', '0', '${date}')`,
                (err, res) => {
                  if(err) {
                    console.log(err);
                    response.json({
                      ok: false,
                      errMessage: err.toString()
                    });
                  }

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

app.get('/api/data/user', (request, response) => {

  promiseMySqlQuery(`SELECT * FROM users WHERE id = ${request.session.userId}`)
    .then(results => {
      response.json({data: results})
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/api/data/user/:id', (request, response) => {

  promiseMySqlQuery(`SELECT * FROM users WHERE id = '${request.params.id}'`)
    .then(results => {
      response.json({data: results})
    })
    .catch(err => {
      console.log(err);
    });
    
}); 

app.use(function(req, res, next) {

  let ID = req.session.userId;
  let LOGIN = req.session.userLogin;
  let ADMIN = req.session.admin;

  res.status(404);
  res.render("404", { data: "Вибачте, такої сторінки не існує!", LOGIN, ADMIN });
});

app.listen(config.PORT, () => {
  console.log(`Listening port ${config.PORT}`);
});

function setSessions(req, value) {
  req.session.userId = value[0].id;
  req.session.userLogin = value[0].user_name;
  req.session.admin = value[0].admin;
}

function promiseMySqlQuery(query){
  return new Promise(function(resolve, reject) {
    mysql.connection.query(query, (err, results) => {
      if(err) { reject(err) }
      else { resolve(results) }
    });
  })
}





