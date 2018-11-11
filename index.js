const express = require("express");
const session = require("express-session");
const Sequelize = require("./sequelize");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const config = require("./config");
const mysql = require("./db");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const router = express.Router();

const routersUser = require("./routers/router-user");
const vehicleSpec = require("./routers/router-vehicle").router;

const app = express();

const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "128500",
  database: "vehicle_db"
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
  let dataUser = getSessionData(request);
  promiseMySqlQuery("call select_all_car()")
    .then(results => {
      response.render("index", { data: results[0], dataUser });
    })
    .catch(err => {
      response.send(err);
    });
});

app.get('/search/:keyword', (request, response) => {
  let dataUser = getSessionData(request);
  mysql.connection.query(`call vehicle_db.search('%${request.params.keyword}%');` , (err, results) => {
    response.render("index", { data: results[0], dataUser });
  });
});

app.post("/api/vehicle/search", (request, response) => {
  mysql.connection.query(`call vehicle_db.search('%${request.body.data}%');` , (err, results) => {
    response.json(results[0]);
  });
})

app.use("/api/user/", routersUser.router);
app.use("/api/vehicle/", vehicleSpec);

app.userData = {};

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

app.get("/add", (request, response) => {
  let dataUser = getSessionData(request);
  if (request.session.role) {
    mysql.connection.query("SELECT * FROM vehicle", (err, results) => {
      if (!err) response.render("create", { data: results, dataUser });
      else console.log(err);
    });
  } else {
    response.json("oops");
  }
});

app.post("/add", (request, response) => {
  response.redirect("/");
//   response.send(request.body);
  mysql.connection.query(
    `INSERT INTO vehicle (model, year, power, type_of_gearbox_id, mark_id, type_of_car_id, type_of_engine_id, type_of_fuel_id, color_id, country_id, image) VALUES
	('${request.body.model}',
	'${request.body.year}',
	'${request.body.power}',
	'${request.body.typeTransmission}',
	'${request.body.mark}',
	'${request.body.bodyCar}',
	'${request.body.typeEngine}',
	'${request.body.typeFuel}',
	'${request.body.color}',
	'${request.body.country}',
	'${request.body.image}');`,
    (err, result) => {
		console.log(err);
		console.log(result);
	}
  );
});

app.get("/info/:id", (request, response) => {
  let dataUser = getSessionData(request);
  promiseMySqlQuery(`call q_select_car(${request.params.id})`)
    .then(results => {
      if (results[0][0]) {
        response.render("infocar", { data: results[0][0], dataUser });
      } else {
        response.render("404", { data: "asasdasd", dataUser });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/api/db", (request, response) => {
  promiseMySqlQuery("call select_all_car()")
    .then(results => {
      response.send(results[0]);
    })
    .catch(err => {
      response.send(err);
    });
});

app.get("/login", (request, response) => {
  let dataUser = getSessionData(request);
  if (!request.session.userLogin) {
    response.render("login", { dataUser });
  } else {
    response.redirect("/");
  }
});

app.get("/admin-panel/users", (request, response) => {
  let dataUser = getSessionData(request);
  if (request.session.role || request.session.login) {
    promiseMySqlQuery("SELECT * FROM users")
      .then(results => {
        response.render("admin-panel", {
          dataUser,
          results
        });
      })
      .catch(err => {
        console.log("Error", err);
      });
  } else {
    response.send("nope nope nope");
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
          bcrypt.compare(pass, results[0].hash_pass, function(
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

app.get("/signin", (request, response) => {
  let dataUser = getSessionData(request);

  if (!request.session.userLogin) {
    response.render("signin", { dataUser });
  } else {
    response.redirect("/");
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
    mysql.connection.query(
      `select * from users where user_name = '${userName}'`,
      (err, results) => {
        if (err) {
          response.send(err);
        } else {
          if (!results[0]) {
            bcrypt.hash(pass, null, null, function(err, hash) {
              mysql.connection.query(
                `INSERT INTO users (user_name, hash_pass, role, create_date, image) VALUES ('${userName}', '${hash}', '0', '${date}', 'https://avatars2.githubusercontent.com/u/35522827?s=460&v=4')`,
                (err, res) => {
                  if (err) {
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

app.get("/api/data/user", (request, response) => {
  promiseMySqlQuery(`SELECT * FROM users WHERE id = ${request.session.userId}`)
    .then(results => {
      response.json({ data: results });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/api/data/user/:id", (request, response) => {
  promiseMySqlQuery(`SELECT * FROM users WHERE id = '${request.params.id}'`)
    .then(results => {
      response.json({ data: results });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/api/session", (request, response) => {
  response.json({
    id: request.session.userId,
    userName: request.session.userLogin,
    role: request.session.role
  });
});

app.use(function(request, response, next) {
  let dataUser = getSessionData(request);
  response.status(404);
  response.render("404", {
    data: "Вибачте, такої сторінки не існує!",
    dataUser
  });
});

app.listen(config.PORT, () => {
  console.log(`Listening port ${config.PORT}`);
});

function setSessions(request, value) {
  request.session.userId = value[0].id;
  request.session.userLogin = value[0].user_name;
  request.session.role = value[0].role;
  if (value[0].image === null) {
    request.session.image =
      "https://avatars2.githubusercontent.com/u/35522827?s=460&v=4";
    console.log(request.session.image);
  } else {
    request.session.image = value[0].image;
  }
}

function getSessionData(request) {
  return (data = {
    ID: request.session.userId,
    LOGIN: request.session.userLogin,
    ROLE: request.session.role,
    IMAGE: request.session.image
  });
}

function promiseMySqlQuery(query) {
  return new Promise(function(resolve, reject) {
    mysql.connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}
