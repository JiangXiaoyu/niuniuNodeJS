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
            console.log("倒计时：" + timing);
            timing--;
        }, 1000);
        //通用接收
        socket.on("message", function (data) {
            console.log("服务端接收参数：" + data);
            var obj = JSON.parse(data);
            switch (obj.type) {
                case "login":
                    //通过数据库查询
                    var userinfo = {
                        id: 1,
                        name: "吴红",
                        head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                        integral: 3000,
                    };
                    socket.name = userinfo.id;

                    //检查在线列表，如果不在里面就加入
                    if (!onlineUsers.hasOwnProperty(userinfo.id)) {
                        onlineUsers[userinfo.id] = userinfo.name;
                        //在线人数+1
                        onlineCount++;
                    }

                    //组合返回客户端
                    var userobj = {
                        type: "login",
                        msg: "登录成功",
                        scene: "home",
                        data: userinfo
                    };
                    //获取用户登录信息
                    socket.emit(obj.type, userobj);
                    break;
                case "register":
                    //根据用户传入信息进行注册
                    var userinfo = sql.register(obj.data, function (res) {
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
                        data: userinfo
                    };
                    //通知客户端
                    socket.emit(obj.type, userobj);
                    break;
                case "join":
                    //从数据库查找当前可用房间
                    var roominfo = {
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
                        data: roominfo
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
                    var roominfo = {
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
                        data: roominfo
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
            var userinfo = {
                id: 1,
                playerName: "吴红",
                playerPhoto: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            socket.name = userinfo.id;

            //检查在线列表，如果不在里面就加入
            if (!onlineUsers.hasOwnProperty(userinfo.id)) {
                onlineUsers[userinfo.id] = userinfo.name;
                //在线人数+1
                onlineCount++;
            }

            //组合返回客户端
            var userobj = {
                msg: "登录成功",
                scene: "home",
                data: userinfo
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
            console.log(userinfo.name + "上线");

        });


        //客户注册;
        socket.on('register', function (data) {
            //根据用户传入信息进行注册
            var userinfo = sql.register(obj.data, function (res) {
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
                data: userinfo
            };
            //通知客户端
            socket.emit("register", userobj);

        });

        //加入房间
        socket.on('join', function (data) {
            //当前用户信息
            var userinfo = {
                id: 1,
                name: "吴红庄家",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
                type: 0
            }
            //从数据库查找当前可用房间
            var roominfo = {
                id: 1,//房间ID
                quantity: 3,//当前房间人数
                max: 26, //最大房间人数
                min: 3, //最小房间人数
                state: 0//当前房间状态
            };
            //玩家信息
            var players = [{
                id: 1,
                name: "吴红庄家",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
                type: 0
            }, {
                id: 1,
                name: "吴红1",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
                type: 1
            }, {
                id: 1,
                name: "吴红2",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
                type: 1
            }, {
                id: 1,
                name: "吴红本人",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
                type: -1
            },];

            //组合返回客户端
            var obj = {
                msg: "加入房间成功",
                scene: "home",
                players: players,
                roominfo: roominfo,
            };

            //通知客户端
            socket.emit("join", obj);
            //加入房间
            socket.join(roominfo.id);

            var broadcast = {
                type: "join",
                data: userinfo
            };
            //向当前房间除我的客户端广播用户
            socket.broadcast.to(roominfo.id).emit('broadcast', broadcast);
            console.log(userinfo.name + "加入房间");
        });

        //抢庄
        socket.on('grab', function (data) {
            //通过数据库查询当前局的信息
            var gameInfo = {
                id: 1,//局号
                integral: 3000,//当前积分
                roominfo: {
                    id: 1,//房间ID
                    quantity: 3,//当前房间人数
                    max: 26, //最大房间人数
                    min: 3, //最小房间人数
                    state: 0//当前房间状态
                },//房间信息
                grabInfo: {
                    id: 1,
                    playerName: "吴红",
                    playerPhoto: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,
                }//抢庄者信息
            };

            //通知客户端抢庄成功
            socket.emit("filling", gameInfo);

            var broadcast = {
                type: "grab",
                data: gameInfo
            };
            //向所有客户端广播有用户抢庄
            socket.broadcast.to(gameInfo.roomId).emit('broadcast', broadcast);
            console.log(userinfo.name + "加入房间");
        });


        //下注
        socket.on('filling', function (data) {
            //通过数据库查询当前局的信息
            var gameInfo = {
                id: 1,//局号
                integral: 3000,//当前积分
                roominfo: {
                    id: 1,//房间ID
                    quantity: 3,//当前房间人数
                    max: 26, //最大房间人数
                    min: 3, //最小房间人数
                    state: 0//当前房间状态
                },//房间信息
                bankerInfo: {
                    id: 1,
                    playerName: "吴红",
                    playerPhoto: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,
                }//庄家信息
            };

            //通知客户端抢庄成功
            socket.emit("filling", gameInfo);

            var broadcast = {
                type: "filling",
                data: gameInfo
            };
            //向所有客户端广播有用户抢庄
            socket.broadcast.to(gameInfo.roomId).emit('broadcast', broadcast);
        });

        //获取游戏信息
        socket.on('game', function (data) {
            //通过数据库查询当前局的信息
            var gameInfo = {
                id: 1,//局号
                integral: 3000,//当前积分
                roominfo: {
                    id: 1,//房间ID
                    quantity: 3,//当前房间人数
                    max: 26, //最大房间人数
                    min: 3, //最小房间人数
                    state: 0//当前房间状态
                },//房间信息
                bankerInfo: {
                    id: 1,
                    playerName: "吴红",
                    playerPhoto: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,
                },//庄家信息
                players: [{
                    id: 1,
                    playerName: "吴红",
                    playerPhoto: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                    integral: 3000,
                    state: 0,//0进行中，1旁观
                }],//玩家信息
            };

            //通知客户端抢庄成功
            socket.emit("game", gameInfo);


        });

        //离开房间
        socket.on('leave', function (data) {
            //通过数据库查询
            var userinfo = {
                id: 1,
                name: "吴红",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            //从数据库查找当前可用房间
            var roominfo = {
                id: 1,//房间ID
                quantity: 3,//当前房间人数
                max: 26, //最大房间人数
                min: 3, //最小房间人数
                state: 0//当前房间状态
            };

            //通知客户端
            socket.emit("leave", roominfo);

            var broadcast = {
                type: "leave",
                data: userinfo
            };
            //向所有客户端广播用户退出
            socket.broadcast.to(roominfo.id).emit('broadcast', broadcast);
            console.log(userinfo.name + "离开房间");

        });
        //退出登录
        socket.on('logout', function (data) {
            //通过数据库查询
            var userinfo = {
                id: 1,
                name: "吴红",
                head: "http://v1.qzone.cc/avatar/201406/18/20/03/53a1801f756ac162.JPG",
                integral: 3000,
            };
            //从数据库查找当前可用房间
            var roominfo = {
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
                data: roominfo
            };
            //通知客户端
            socket.emit("logout", userinfo);

            var broadcast = {
                type: "offline",
                data: userinfo
            };
            //向所有客户端广播用户退出
            socket.broadcast.to(roominfo.id).emit('broadcast', broadcast);
            console.log(userinfo.name + "退出登录");

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