"use strict";

// Read config
var getConfig = async function () {
	var resp = await fetch("../conf/config.json");
	self.appConfig = await resp.json();
};
var setUid = function (uid) {
	localStorage.setItem("WebFly:userId", uid);
	webfly.userId = uid;
};
var webfly;
getConfig().then(function () {
});

// Basic
var startThis = function (gid = appConfig.group.list[appConfig.group.default].id) {
	var lastUid = localStorage.getItem("WebFly:userId") || genRandom(appConfig.user.randomizer.length, appConfig.user.randomizer.map);
	webfly = new ICBSvc(gid, lastUid, appConfig);
	setUid(lastUid);
	webfly.start();
	addEventListener("beforeunload", function () {
		webfly.close();
	});
};

// Window
var drawerDisp, chatDisp;
document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {

	};
});
