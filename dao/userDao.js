var mysql = require('mysql');
var conf = require('../conf/db');
var orm = require("orm");


orm.connect(conf.mysql, function (err, db) {
    if (err) throw err;

    //定义 model
    var User = db.define("Game_User", {
        name: String,
        surname: String,
        age: Number, // FLOAT
        male: Boolean,
        continent: ["Europe", "America", "Asia", "Africa", "Australia", "Antartica"], // ENUM type
        photo: Buffer, // BLOB/BINARY
        data: Object // JSON encoded
    }, {
        methods: {
            fullName: function () {
                return this.name + ' ' + this.surname;
            }
        },
        validations: {
            age: orm.enforce.ranges.number(18, undefined, "under-age")
        }
    });

//同步 model 到数据库
    User.sync(function (err) {
        console.log("create Person table successfully!")
    });
});