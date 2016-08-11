var express = require('express');
var router = express.Router();
var socket_io = require('socket.io');
var sql = require("../services/niuniuService");
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.prepareSocketIO = function (server) {
    //在线用户
    var onlineUsers = {};
    //当前在线人数
    var onlineCount = 0;
    var rooms = [{id: 1, quantity: 3, max: 26, min: 3, time: 10, state: 0}];//状态：0等待用户加入，1抢庄，2投注，3开奖，4成绩报告
    var io = socket_io.listen(server);
    io.sockets.on('connection', function (socket) {

        setInterval(function () {
            rooms.forEach(function (item) {
                item.time--;
                if (item.time == 0) {
                    if (item.state == 3) {
                        item.state = 0;
                    } else {
                        item.state++;
                    }
                    io.in(item.id).emit("scene", item.state);
                    item.time = 10;
                    console.log("场景状态：" + item.state);
                }
            });


        }, 1000);


        //客户登录;
        socket.on('login', function (data) {
            console.log("传入参数：" + data);

            //通过数据库查询
            var obj = {
                state: 0,//成功为0，失败为1
                msg: "登录成功",
                data: {
                    id: 1,
                    name: "吴红",
                    head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,

                }
            };


            socket.name = obj.data.id;

            //检查在线列表，如果不在里面就加入
            if (!onlineUsers.hasOwnProperty(obj.data.id)) {
                onlineUsers[obj.data.id] = obj.data.name;
                //在线人数+1
                onlineCount++;
            }


            //获取用户登录信息
            socket.emit('login', obj);

            //广播以有信息
            io.sockets.emit('online', obj);


            var broadcast = {
                type: "online",
                data: {
                    id: socket.name,
                    name: onlineUsers[socket.name]
                }
            };
            //向所有客户端广播用户
            io.emit('broadcast', broadcast);

            //if (obj.type.eq("mobile")) {
            //    sql.register(obj, function (res) {
            //        var item = res[0];
            //        console.log("注册返回记录：" + JSON.stringify(item));
            //        //if (item) {
            //        //    socket.emit('login', {state: 0, msg: "登录成功", data: item});
            //        //    io.sockets.emit('online', {id: item.id, name: item.name});
            //        //} else {
            //        //    socket.emit('login', {state: 1, msg: "登录失败"});
            //        //}
            //
            //    })
            //}


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
            //根据用户查找加入的房间
            var obj = {
                state: 0,//成功为0，失败为1
                msg: "加入房间成功",
                data: {
                    id: 1,//房间ID
                    quantity: 3,//当前房间人数
                    max: 26, //最大房间人数
                    min: 3, //最小房间人数
                    state: 0//当前房间状态

                }
            };
            socket.join(obj.data.id);

            var broadcast = {
                type: "intoroom",
                data: {
                    id: socket.name,
                    name: onlineUsers[socket.name]
                }
            };
            //向所有客户端广播用户
            io.in(obj.data.id).emit('broadcast', broadcast);

        });
        //离开房间
        socket.on('leave', function (data) {
            console.log("传入参数：" + data);
            var obj = JSON.parse(data);
            var testData = {
                state: 0,//成功为0，失败为1
                data: {
                    id: 1,//房间ID

                }
            };

            socket.leave(testData.data.id);

            var broadcast = {
                type: "leaveroom",
                data: {
                    id: socket.name,
                    name: onlineUsers[socket.name]
                }
            };
            //向所有客户端广播用户退出
            io.in(obj.data.id).emit('broadcast', broadcast);

        });

        //客户连接断开
        socket.on('disconnect', function () {


            //将退出的用户从在线列表中删除
            if (onlineUsers.hasOwnProperty(socket.name)) {
                //退出用户的信息
                var obj = {
                    state: 1,//0表示上线，1表示下线
                    msg: "用户下线",
                    data: {
                        id: socket.name,
                        name: onlineUsers[socket.name]
                    }
                };
                //删除
                delete onlineUsers[socket.name];
                //在线人数-1
                onlineCount--;


                var broadcast = {
                    type: "offline",
                    data: {
                        id: socket.name,
                        name: onlineUsers[socket.name]
                    }
                };
                //向所有客户端广播用户退出
                io.emit('broadcast', broadcast);
                console.log(obj.data.name + '退出了聊天室');
            }

        });

    });


};

module.exports = router;