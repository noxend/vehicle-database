const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const mysql = require('./db');
const path = require('path');
const router = express.Router();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

console.log(__dirname);


app.get('/', (req, res) => {
    mysql.query('SELECT * FROM vehicle', (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.render('index', { data: results });
        }
    });
});

app.get('/add', (req, res) => {
    mysql.query('SELECT * FROM type', (err, results) => {
        if (!err) 
            res.render('create', { data: results });
        else
            console.log(err);
    });
});
app.post('/add', (req, res) => {
    res.send(req.body);
    // res.redirect('/');
});


app.get('/info/:id', (req, res) => {
    mysql.query('SELECT * FROM vehicle', (err, results) => {
        if (err) { res.send(err); } else {
            if(req.params.id > results.length){
                res.render('404');
            } else {
                var result = results.find((result) => {
                    return result.id === Number(req.params.id);
                });
                // console.log(result);
                res.render('infocar', { data: result, dbl: results.length});
            }
        }
    });
});



app.get('/mysql', (req, res) => {
    mysql.query('SELECT * FROM vehicle', (err, results) => {
        if (err) { res.send(err); } else {
            res.json({
                data: results
            });
        }
    });
});

app.use(function (req, res, next) {
    res.status(404);
    res.render("404");
});

app.listen(config.PORT, () => {
    console.log(`Listening port ${config.PORT}`);
});