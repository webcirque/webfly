"use strict";

var historyPane, txtar = {}, groupId;

// Basic
var setUid = function (uid) {
	localStorage.setItem("WebFly:userId", uid);
	webfly.userId = uid;
};
var getUid = function () {
	var lastUid = localStorage.getItem("WebFly:userId");
	if (+lastUid == 0) {
		lastUid = genRandom(appConfig.user.randomizer.length, appConfig.user.randomizer.map);
	};
	return lastUid;
};
var startThis = function (gid = groupId) {
	var lastUid = localStorage.getItem("WebFly:userId") || genRandom(appConfig.user.randomizer.length, appConfig.user.randomizer.map);
	historyPane.innerHTML = "";
	dealWizMsg("Connecting to remote server...", "System Message", 1)
	webfly = new ICBSvc(gid, lastUid, appConfig);
	webfly.receiveChat = function (data) {
		dealWizMsg(data.msg, data.sender, 3, data.time);
	};
	webfly.receiveHistory = function (data) {
		dealWizMsg(data.msg, data.sender, 2, data.time);
	};
	webfly.receiveConnect = function (data) {
		if (data.reconnect) {
			dealWizMsg("Reconnected. Some chat messages might be lost.", "System Message", 1);
		} else {
			dealWizMsg("Connected to remote. Now start chatting!", "System Message", 1);
		};
	};
	webfly.receiveDisconnect = function (data) {
		if (data.reconnect) {
			if (data.fail) {
				dealWizMsg("Reconnection failed. Please try to restart conversation.", "System Message", 1);
			} else {
				dealWizMsg("Connection lost. Trying to reconnect...", "System Message", 1);
			};
		} else {
			dealWizMsg("Conversation ended.", "System Message", 1);
		};
	};
	setUid(lastUid);
	webfly.start();
	addEventListener("beforeunload", function () {
		webfly.close();
	});
};
var dealWizMsg = function (msg, user, sys, time) {
	var result = (historyPane.scrollHeight - historyPane.scrollTop - historyPane.clientHeight);
	pushHistory(msg, user, sys, time);
	if (result < 100) {
		scrollToNewest();
	};
};
var stopThis = function () {
	webfly.close();
	webfly = null;
};
var getConfig = async function () {
	var resp = await fetch("../conf/config.json");
	self.appConfig = await resp.json();
};
var getIcons = async function () {
	var resp = await fetch("../conf/iconidx.json");
	var iconConfig = await resp.json();
	self.wimgr = new IconMgr("../img/", iconConfig);
};
var webfly;

// Get groupId
groupId = location.search.parseMap().get("id");

var pushHistory = function (text, from, system = false, time = Date.now()) {
	var timeText = (new Date(time)).toLocaleString();
	var entry = document.createElement("div");
	entry.className = "history-entry";
	if (system == 1) {
		entry.className += " systeminfo";
	} else if (system == 2) {
		entry.className += " chatbefore";
	} else if (system == 3) {
		entry.className += " remotechat";
	};
	var sender = document.createElement("div");
	sender.className = "sender";
	var senderN = document.createElement("span");
	senderN.className = "sender-name";
	senderN.innerText = from;
	sender.appendChild(senderN);
	var senderT = document.createElement("span");
	senderT.className = "sender-time";
	senderT.innerText = timeText;
	sender.appendChild(senderT);
	entry.appendChild(sender);
	var txtContent = document.createElement("div");
	txtContent.className = "msgcontent";
	txtContent.innerText = text;
	entry.appendChild(txtContent);
	historyPane.appendChild(entry);
};
var scrollToNewest = async function () {
	historyPane.scrollTop = historyPane.scrollHeight;
};
var sendMsg = function () {
	if (txtar.edit.value.length > 0 && self.webfly) {
		if (webfly.send(txtar.edit.value)) {
			pushHistory(txtar.edit.value, getUid());
			txtar.edit.value = "";
			scrollToNewest();
		} else {
			dealWizMsg("No connection yet. Please retry after some time.", "System Message", 1);
		};
		if (!webfly.verifiedUid) {
			dealWizMsg("User ID is not yet verified.\nIf this happens even after connected, you may stop the current chat, change a UID, then restart the conversation.\nOtherwise you cannot receive any message from the remote.", "System Message", 1);
		};
	};
};

//startThis(groupId);

document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		// Get elements
		historyPane = document.querySelector("#chat-history");
		txtar.edit = document.querySelector("textarea");
		txtar.send = document.querySelector("#btn-send");
		txtar.toggle = document.querySelector("#btn-toggle");
		// Load assets
		getIcons().then(function () {
			wimgr.updateIconsAll();
		});
		getConfig().then(function () {
		});
		// Actions
		// Send text messages
		txtar.send.addEventListener("mouseup", sendMsg);
		txtar.edit.addEventListener("keyup", function (ev) {
			switch (ev.keyCode) {
				case 13: {
					if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
						sendMsg();
					};
					break;
				};
			};
		})
		// Start and stop chat
		txtar.toggle.addEventListener("mouseup", function () {
			if (self.webfly) {
				stopThis();
				this.children[0].style.display = "";
				this.children[1].style.display = "none";
			} else {
				startThis(groupId);
				this.children[1].style.display = "";
				this.children[0].style.display = "none";
			};
		});
	};
});
