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
    var rooms = [
        {id: 1, quantity: 4, max: 26, min: 3, time: 10, state: 0}, {
            id: 2,
            quantity: 2,
            max: 26,
            min: 3,
            time: 10,
            state: 0
        }];//状态：0等待用户加入，1抢庄，2投注，3开奖，4成绩报告
    var io = socket_io.listen(server);
    io.sockets.on('connection', function (socket) {
        var timing1 = {banker: 10, betting: 10, player: 10, score: 20};//时间控制
        var timing = 10;// [10, 20, 30, 10];//时间控制
        var newTiming = [5, 5, 5, 5];
        setInterval(function () {
            if (timing == 0) {
                rooms.forEach(function (item) {
                    if (item.quantity < 4) {
                        item.state = 0;
                        io.in(item.id).emit("message", "当前房间人数为：" + item.quantity + ",未达到开始标准！");
                        console.log("当前房间人数为：" + item.quantity + ",未达到开始标准！");
                        return;
                    }

                    if (item.state == 4) {
                        item.state = 0;
                    } else {
                        item.state = item.state + 1;
                    }
                    io.in(item.id).emit("scene", item.state);
                    console.log(item.id + "房间状态：" + item.state);

                });
                timing = 10;
            }
            timing--;
        }, 1000);
        //通用接收
        socket.on("message", function (data) {
            console.log("服务端接收参数：" + data);
            var obj = JSON.parse(data);
            switch (obj.type) {
                case "login":
                    //通过数据库查询
                    var userInfo = {
                        id: 1,
                        name: "吴红",
                        head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                        integral: 3000,
                    };
                    socket.name = userInfo.id;

                    //检查在线列表，如果不在里面就加入
                    if (!onlineUsers.hasOwnProperty(userInfo.id)) {
                        onlineUsers[userInfo.id] = userInfo.name;
                        //在线人数+1
                        onlineCount++;
                    }

                    //组合返回客户端
                    var userobj = {
                        type: "login",
                        msg: "登录成功",
                        scene: "home",
                        data: userInfo
                    };
                    //获取用户登录信息
                    socket.emit(obj.type, userobj);
                    break;
                case "register":
                    //根据用户传入信息进行注册
                    var userInfo = sql.register(obj.data, function (res) {
                        var item = res[0];
                        console.log("注册返回记录：" + JSON.stringify(item));
                        //if (item) {
                        //    socket.emit('login', {state: 0, msg: "登录成功", data: item});
                        //    io.sockets.emit('online', {id: item.id, name: item.name});
                        //} else {
                        //    socket.emit('login', {state: 1, msg: "登录失败"});
                        //}

                    })
                    //组合返回客户端
                    var userobj = {
                        type: "login",
                        msg: "登录成功",
                        scene: "home",
                        data: userInfo
                    };
                    //通知客户端
                    socket.emit(obj.type, userobj);
                    break;
                case "join":
                    //从数据库查找当前可用房间
                    var roomInfo = {
                        id: 1,//房间ID
                        quantity: 3,//当前房间人数
                        max: 26, //最大房间人数
                        min: 3, //最小房间人数
                        state: 0//当前房间状态
                    };

                    //组合返回房间信息
                    var roomobj = {
                        type: "join",
                        msg: "加入房间成功",
                        scene: "banker",
                        data: roomInfo
                    };
                    //通知客户端
                    socket.emit(obj.type, roomobj);

                    var broadcast = {
                        type: "intoroom",
                        data: {
                            id: socket.name,
                            name: onlineUsers[socket.name]
                        }
                    };
                    //向所有客户端广播用户
                    io.in(roomobj.data.id).emit('broadcast', broadcast);
                    break;
                case "leave":
                    //从数据库查找当前可用房间
                    var roomInfo = {
                        id: 1,//房间ID
                        quantity: 3,//当前房间人数
                        max: 26, //最大房间人数
                        min: 3, //最小房间人数
                        state: 0//当前房间状态
                    };

                    //组合返回房间信息
                    var roomobj = {
                        type: "leave",
                        msg: "退出房间成功",
                        scene: "home",
                        data: roomInfo
                    };
                    //通知客户端
                    socket.emit(obj.type, roomobj);

                    var broadcast = {
                        type: "leaveroom",
                        data: {
                            id: socket.name,
                            name: onlineUsers[socket.name]
                        }
                    };
                    //向所有客户端广播用户退出
                    io.in(obj.data.id).emit('broadcast', broadcast);
                    break;
                case "":
                    break;
                case "":
                    break;
            }


        });

        //客户登录;
        socket.on('login', function (data) {

            //通过数据库查询
            var userInfo = {
                id: 1,
                name: "吴红",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            socket.name = userInfo.id;

            //检查在线列表，如果不在里面就加入
            if (!onlineUsers.hasOwnProperty(userInfo.id)) {
                onlineUsers[userInfo.id] = userInfo.name;
                //在线人数+1
                onlineCount++;
            }

            //组合返回客户端
            var userobj = {
                msg: "登录成功",
                scene: "home",
                data: userInfo
            };
            //获取用户登录信息
            socket.emit("login", userobj);

            var broadcast = {
                type: "online",
                data: {
                    id: socket.name,
                    name: onlineUsers[socket.name]
                }
            };
            //向所有客户端广播用户
            io.emit('broadcast', broadcast);
            console.log(userInfo.name + "上线");

        });


        //客户注册;
        socket.on('register', function (data) {
            //根据用户传入信息进行注册
            var userInfo = sql.register(obj.data, function (res) {
                var item = res[0];
                console.log("注册返回记录：" + JSON.stringify(item));
                //if (item) {
                //    socket.emit('login', {state: 0, msg: "登录成功", data: item});
                //    io.sockets.emit('online', {id: item.id, name: item.name});
                //} else {
                //    socket.emit('login', {state: 1, msg: "登录失败"});
                //}

            })
            //组合返回客户端
            var userobj = {
                msg: "登录成功",
                scene: "home",
                data: userInfo
            };
            //通知客户端
            socket.emit("register", userobj);

        });

        //加入房间
        socket.on('join', function (data) {
            //通过数据库查询
            var userInfo = {
                id: 1,
                name: "吴红",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            //从数据库查找当前可用房间
            var roomInfo = {
                id: 1,//房间ID
                quantity: 3,//当前房间人数
                max: 26, //最大房间人数
                min: 3, //最小房间人数
                state: 0//当前房间状态
            };

            //组合返回房间信息
            var roomobj = {
                type: "join",
                msg: "加入房间成功",
                scene: "banker",
                data: roomInfo
            };
            //通知客户端
            socket.emit("join", roomobj);
            //加入房间
            socket.join(roomInfo.id);
            var broadcast = {
                type: "intoroom",
                data: userInfo
            };
            //向所有客户端广播用户
            io.in(roomInfo.id).emit('broadcast', broadcast);
            console.log(userInfo.name + "加入房间");
        });
        //离开房间
        socket.on('leave', function (data) {
            //通过数据库查询
            var userInfo = {
                id: 1,
                name: "吴红",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            //从数据库查找当前可用房间
            var roomInfo = {
                id: 1,//房间ID
                quantity: 3,//当前房间人数
                max: 26, //最大房间人数
                min: 3, //最小房间人数
                state: 0//当前房间状态
            };

            //组合返回房间信息
            var roomobj = {
                type: "leave",
                msg: "退出房间成功",
                scene: "home",
                data: roomInfo
            };
            //通知客户端
            socket.emit("leave", roomobj);

            var broadcast = {
                type: "leaveroom",
                data: userInfo
            };
            //向所有客户端广播用户退出
            io.in(roomInfo.id).emit('broadcast', broadcast);
            console.log(userInfo.name + "离开房间");

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