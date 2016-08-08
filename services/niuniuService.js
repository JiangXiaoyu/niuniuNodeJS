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
 * 主页
 */
var home = function home() {
    console.log("home");

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
exports.home = home;
exports.banker = banker;
exports.betting = betting;
exports.player = player;
exports.transfer = transfer;
exports.expose = expose;
