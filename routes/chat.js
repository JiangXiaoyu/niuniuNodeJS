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


        //客户登录;
        socket.on('login', function (data) {
            console.log("客户登录验证");
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);
            var testData = {
                state: 0,//成功为0，失败为1
                msg: "登录成功",
                data: {
                    id: 1,
                    name: "吴红",
                    head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,

                }
            };
            socket.name = 1;
            //获取用户登录信息
            socket.emit('login', testData);


            var onlineData = {
                state: 0,//0表示上线，1表示下线
                msg: "登录成功",
                data: {
                    id: 1,
                    name: "吴红",
                    head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,
                }
            };

            //广播以有信息
            io.sockets.emit('online', onlineData);

            if (obj.type.eq("mobile")) {
                sql.register(obj, function (res) {
                    var item = res[0];
                    console.log("注册返回记录：" + JSON.stringify(item));
                    //if (item) {
                    //    socket.emit('login', {state: 0, msg: "登录成功", data: item});
                    //    io.sockets.emit('online', {id: item.id, name: item.name});
                    //} else {
                    //    socket.emit('login', {state: 1, msg: "登录失败"});
                    //}

                })
            }


        });


        //客户注册;
        socket.on('register', function (data) {
            console.log("客户注册");
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);

            sql.register(obj, function (res) {
                var item = res[0];
                console.log("注册返回记录：" + JSON.stringify(item));
                //if (item) {
                //    socket.emit('login', {state: 0, msg: "登录成功", data: item});
                //    io.sockets.emit('online', {id: item.id, name: item.name});
                //} else {
                //    socket.emit('login', {state: 1, msg: "登录失败"});
                //}

            })

        });

        //加入房间
        socket.on('join', function (data) {
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);
            var testData = {
                state: 0,//成功为0，失败为1
                msg: "加入房间成功",
                data: {
                    id: 1,//房间ID

                }
            };
            socket.join(testData.data.id);
            io.in(testData.data.id).emit('join', data);
        });
        //离开房间
        socket.on('leave', function (data) {
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);
            var testData = {
                state: 0,//成功为0，失败为1
                msg: "加入房间成功",
                data: {
                    id: 1,//房间ID

                }
            };
            socket.leave(testData.data.id);
            io.in(testData.data.id).emit('leave', data);
        });


        //客户连接断开
        socket.on('disconnect', function () {

            var onlineData = {
                state: 1,//0表示上线，1表示下线
                msg: "用户下线",
                data: {
                    id: socket.name
                }
            };

            //广播以有信息
            io.sockets.emit('online', onlineData);
            console.log("客户连接断开");
        });

    });


};

module.exports = router;