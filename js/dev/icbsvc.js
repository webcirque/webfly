"use strict";

var genRandom = function (length, defMap = "0123456789ABCDEF") {
	var result = "";
	var tmpFunc = function () {
		result += defMap[Math.floor(Math.random() * defMap.length)];
	}
	tmpFunc.repeat(length);
	return result;
};
var ICBMsg = function (user, msg, id, iniTime, modTime) {
	this.user = user;
	this.msg = msg;
	this.id = id;
	this.iniTime = iniTime;
	this.modTime = modTime;
};
var ICBSvc = function (groupId, userId, config, receiver, options = {}) {
	this.path = options.path || "/";
	this.host = options.host || "cafechat.app";
	this.history = [];
	var upThis = this;
	if (Compard.able(groupId) < 1) {
		throw Error("Invalid groupId");
	} else {
		this.groupId = groupId;
	};
	if (!config) {
		throw Error("No config present");
	} else {
		this.config = config;
	};
	this.userId = userId || genRandom(12, config.user.randomizer);
	if (config.info.realPath) {
		this.path = location.pathname;
	} else {
		this.path = config.info.fakePath;
	};
	if (config.info.realHost) {
		this.host = location.host;
	} else {
		this.host = config.info.fakeHost;
	};
	this.receiver = receiver || function (data) {
		console.log(data);
	};
	switch (config.server.protocol) {
		case "safiullin": {
			this.socket = new WebSocket(config.server.remote);
			break;
		};
		default : {
			throw ("Unknown protocol");
		};
	};
	var msgHandler = function (event) {
		if (event.data.indexOf("{") == 0) {
			try {
				var msgJson = JSON.parse(event.data);
				switch (msgJson.service) {
					case "lastmes": {
						msgJson.lastMess.forEach(function (e) {
							if (e.message.indexOf(upThis.userId + " ") != 0) {
								upThis.history.push(new ICBMsg(
									e.uid, e.message, e._id, new Date(e.createdAt), new Date(e.updatedAt)
								));
							};
						});
						event.target.send(JSON.stringify({
							"message": (upThis.userId + " joined the chat via WebFly.\nPrimary language: " + navigator.language),
							"host": upThis.host,
							"pathname": upThis.path,
							"g": upThis.groupId.toString(),
							"uid": upThis.userId,
							"isRec": true
						}));
						break;
					};
					case "setUid": {
						//
						break;
					};
					default : {
						console.warn("Unknown service: %o", msgJson);
					};
				};
			} catch (err) {
				var tsp = new Date();
				upThis.receiver({sender: "Unknown Remote", msg: event.data});
				upThis.history.push(new ICBMsg("Unknown Remote", event.data, genRandom(24), tsp, tsp));
			};
		} else {
			var tsp = new Date();
			upThis.receiver({sender: "Unknown Remote", msg: event.data});
			upThis.history.push(new ICBMsg("Unknown Remote", event.data, genRandom(24), tsp, tsp));
		};
	};
	if (this.socket) {
		this.start = function () {
			this.closed = false;
			this.socket.addEventListener("open", (ev) => {
				ev.target.send(JSON.stringify({
					"service": "lastmes",
					"g": upThis.groupId.toString(),
					"uid": upThis.userId
				}));
				ev.target.send(JSON.stringify({
					"message": "hi",
					"login": 1,
					"host": upThis.host,
					"pathname": upThis.path,
					"g": upThis.groupId.toString(),
					"uid": upThis.userId
				}));
			});
			this.socket.addEventListener("message", msgHandler);
			this.socket.addEventListener("close", function () {
				if (!upThis.closed) {
					upThis.reconnect();
				};
			});
		};
	};
	this.send = function (msg, rec = true) {
		var tsp = new Date();
		this.socket.send(JSON.stringify({
			"message": msg,
			"host": this.host,
			"pathname": this.path,
			"g": this.groupId.toString(),
			"uid": this.userId,
			"isRec": rec
		}));
		if (rec) {
			this.history.push(new ICBMsg(this.userId, msg, genRandom(24), tsp, tsp));
		};
	};
	this.reconnect = function () {
		console.log("Keep-alive requested. Reconnecting...");
		upThis.socket = new WebSocket(config.server.remote);
		upThis.socket.addEventListener("open", function () {
			console.log("Reconnected");
		});
		upThis.socket.addEventListener("error", function (ev) {
			console.log("Reconnection failed. Details: %o", ev);
		});
		upThis.socket.addEventListener("message", msgHandler);
		this.socket.addEventListener("close", function () {
			if (!upThis.closed) {
				upThis.reconnect();
			};
		});
	};
	this.close = function () {
		this.send(this.userId + " left the chat.", false);
		this.closed = true;
		this.socket.close();
	};
};
