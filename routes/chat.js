var express = require('express');
var router = express.Router();
var socket_io = require('socket.io');
var sql = require("../services/niuniuService");
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.prepareSocketIO = function (server) {
    var io = socket_io.listen(server);
    io.sockets.on('connection', function (socket) {

        socket.on('join', function (user) {
            socket.user = user;
            socket.emit('state', 'SERVER', true);
            socket.broadcast.emit('state', 'SERVER', user + '上线了');
        });
        socket.on('sendMSG', function (msg) {
            socket.emit('chat', socket.user, msg);
            socket.broadcast.emit('chat', socket.user, msg);
        });

        //客户登录
        socket.on('login', function (data) {
            console.log("客户登录验证");
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);
            sql.login(obj, function (res) {
                console.log("登录验证数据库记录：" + JSON.stringify(res));
                if (res.count > 0) {
                    socket.emit('login', {state: 0, msg: "登录成功", res: body});
                    socket.broadcast.emit('online', 'SERVER', res.id + '上线了');
                } else {
                    socket.emit('login', {state: 1, msg: "登录失败"});
                }

            })


        });

        //客户连接断开
        socket.on('disconnect', function () {
            console.log("客户连接断开");
        });

    });


};

module.exports = router;