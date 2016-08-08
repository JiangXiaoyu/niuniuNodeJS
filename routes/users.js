var express = require('express');
var sql = require('../tools/mysql');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {

    sql("SELECT * from game_system_user", function (qerr, vals, fields) {

        res.send(vals);
    });

});

module.exports = router;
