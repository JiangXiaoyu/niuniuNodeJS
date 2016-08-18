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

    try {
        var str = "call sp_playerlogin ('" + obj.type + "','" + obj.dlm + "','" + obj.dlip + "'," + obj.zhlx + "," + obj.sjid + ",'" + obj.pic + "');";
        console.log("SQL组合：" + str);
        sql(str, function (qerr, vals, fields) {
            callback(vals);
        });
        console.log("login");
    } catch (err) {
        console.log("异常：" + err.message);
    }
}


/**
 * 创建房间
 */
var newroom = function newroom(obj, callback) {

    try {
        var str = "call sp_createdesk ('" + obj.id + "','" + obj.pwd + "');";
        console.log("SQL组合：" + str);
        sql(str, function (qerr, vals, fields) {
            callback(vals);
        });
        console.log("newroom");
    } catch (err) {
        console.log("异常：" + err.message);
    }
}

/**
 * 加入房间
 */
var join = function join() {
    try {
        var str = "call sp_createdesk ('" + obj.uid + "','" + obj.desktype + "','" + obj.desknum + "','" + obj.deskpwd + "');";
        console.log("SQL组合：" + str);
        sql(str, function (qerr, vals, fields) {
            callback(vals);
        });
        console.log("join");
    } catch (err) {
        console.log("异常：" + err.message);
    }
}


/**
 * 主页
 */
var home = function home() {
    console.log("home");

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
exports.newroom = newroom;

exports.home = home;
exports.banker = banker;
exports.betting = betting;
exports.player = player;
exports.transfer = transfer;
exports.join = join;
exports.leave = leave;
exports.expose = expose;
