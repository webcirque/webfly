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
var processMsg = function (text, upThis) {
	var history = arguments[2] || false;
	var parseSender = arguments[3] || false;
	var tsp = new Date(), sender = arguments[4] || "Unknown Remote", msg = text;
	var id = arguments[5] || genRandom(24);
	var createdAt = arguments[6] || tsp;
	var modAt = arguments[7] || tsp;
	var splitIndex = text.indexOf(":");
	if (text.indexOf("@") == 0 && splitIndex < 25 && parseSender) {
		var legal = true;
		Array.from(text.slice(1, splitIndex)).forEach(function (e) {
			if (" -".indexOf(e.toLowerCase()) != -1) {
				legal = false;
			};
		});
		if (legal) {
			sender = text.slice(1, splitIndex);
			msg = text.slice(splitIndex + 1);
		};
	};
	if (!history) {
		upThis.receiveChat({sender: sender, msg: msg, time: tsp});
	} else {
		upThis.receiveHistory({sender: sender, msg: msg, time: tsp});
	};
	upThis.history.push(new ICBMsg(sender, msg, id, createdAt, modAt));
};
var ICBSvc = function (groupId, userId, config, receiver, options = {}) {
	this.path = options.path || "/";
	this.host = options.host || "cafechat.app";
	this.history = [];
	var connectTime = 0, failTime = 0;
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
	this.verifiedUid = false;
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
	this.receiveChat = receiver || function (data) {
		console.log(data);
	};
	this.receiveHistory = function (data) {
		console.log(data);
	};
	this.receiveConnect = function (data) {};
	this.receiveDisconnect = function (data) {};
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
						msgJson.lastMess.reverse();
						msgJson.lastMess.forEach(function (e) {
							if (e.message) {
								if (e.message.indexOf(upThis.userId + " ") != 0) {
									var cat = new Date(e.createdAt);
									processMsg(e.message, upThis, true, true, e.uid, e._id, cat, new Date(e.updatedAt));
								};
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
						upThis.receiveConnect({reconnect: connectTime});
						break;
					};
					case "setUid": {
						if (msgJson.message == upThis.userId) {
							upThis.verifiedUid = true;
							console.log("User ID verified");
						};
						break;
					};
					default : {
						console.warn("Unknown service: %o", msgJson);
					};
				};
			} catch (err) {
				processMsg(event.data, upThis, false, true);
			};
		} else {
			processMsg(event.data, upThis, false, true);
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
		var tsp = new Date(), success = false;
		if (this.socket.readyState == 1) {
			success = true;
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
		return success;
	};
	this.reconnect = function () {
		connectTime ++;
		console.log("Keep-alive requested. Reconnecting...");
		upThis.receiveDisconnect({reconnect: connectTime, fail: false});
		upThis.socket = new WebSocket(config.server.remote);
		upThis.socket.addEventListener("open", function (ev) {
			upThis.receiveConnect({reconnect: connectTime});
			upThis.send(upThis.userId + " reconnected due to disconnection.");
			console.log("Reconnected");
		});
		upThis.socket.addEventListener("error", function (ev) {
			upThis.receiveDisconnect({reconnect: connectTime, fail: true});
			console.log("Reconnection failed. Details: %o", ev);
		});
		upThis.socket.addEventListener("message", msgHandler);
		this.socket.addEventListener("close", function () {
			if (!upThis.closed) {
				upThis.reconnect();
			} else {
				upThis.receiveDisconnect({reconnect: 0});
			};
		});
	};
	this.close = function () {
		this.send(this.userId + " left the chat.", false);
		upThis.receiveDisconnect({reconnect: connectTime, fail: false});
		this.closed = true;
		this.socket.close();
	};
};
