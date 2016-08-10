var express = require('express');
var orm = require("orm");
var sql = require('../tools/mysql');

var opts = {
    database: "test",
    protocol: "mysql",
    host: "127.0.0.1",
    username: "root",
    password: "root",
    query: {
        pool: true,
    },
}

/**
 * 登录（返回用户所有信息）
 */
var login = function login(obj, callback) {
    var str = "SELECT * from game_system_user where id=" + obj.value;
    console.log("SQL组合：" + str);
    sql(str, function (qerr, vals, fields) {
        callback(vals);
    });
    console.log("login");
}
/**
 * 手机号注册
 */
var register = function register(obj, callback) {
    var str = "call sp_smscode ('18623238852','check','9873');";
    console.log("SQL组合：" + str);
    sql(str, function (qerr, vals, fields) {
        callback(vals);

    });
    console.log("register");
}

/**
 * 主页
 */
var home = function home() {
    console.log("home");

}


/**
 * 加入房间
 */
var join = function join() {
    console.log("join");
}


/**
 * 离开房间
 */
var leave = function leave() {
    console.log("leave");
}

/**
 * 庄家
 */
var banker = function banker() {
    console.log("banker");
}


/**
 * 投注
 */
var betting = function betting() {
    console.log("betting");
}

/**
 * 闲家
 */
var player = function player() {
    console.log("player");
}
/**
 * 转帐
 */
var transfer = function transfer() {
    console.log("transfer");
}

/**
 * 开奖
 */
var expose = function expose() {
    console.log("expose");
}


exports.login = login;
exports.register = register;
exports.home = home;
exports.banker = banker;
exports.betting = betting;
exports.player = player;
exports.transfer = transfer;
exports.join = join;
exports.leave = leave;
exports.expose = expose;
