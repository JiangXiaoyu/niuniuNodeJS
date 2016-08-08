var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');


// 使用连接池，提升性能
var pool = mysql.createPool($conf.mysql);

var user = pool.getConnection(function (err, connection) {
    connection.query("select * from    table1", function (err, rows) {
            if (err) {
                throw err;
            } else {
                console.log(rows);
            }
        }
    );
    connection.release();
});

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

module.exports = {
    add: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            // 获取前台页面传过来的参数
            var param = req.query || req.params;

            // 建立连接，向表中插入值
            // 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
            connection.query($sql.insert, [param.name, param.age], function (err, result) {
                if (result) {
                    result = {
                        code: 200,
                        msg: '增加成功'
                    };
                }

                // 以json形式，把操作结果返回给前台页面
                jsonWrite(res, result);

                // 释放连接
                connection.release();
            });
        });
    }
};