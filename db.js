const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "128500",
    database: "mydb"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL");
});

var selectCar = function(){
    return `SELECT v.id, v.mark, v.model, v.country, v.price_day, v.img_url, vt.vehicle_type, s.type_engine, s.power, s.max_speed, b.body_type
    FROM mydb.vehicle v
    Join mydb.vehicle_type vt on v.vehicle_type_idvehicle_type = vt.idvehicle_type
    Join mydb.specifications s on v.specifications_id_specifications = s.id_specifications
    join mydb.body_type b on v.body_type_idbody_type = b.idbody_type;`
}

module.exports.connection = connection;
module.exports.selectCar = selectCar;
