"use strict";

// Basic
var setUid = function (uid) {
	localStorage.setItem("WebFly:userId", uid);
	webfly.userId = uid;
};
var startThis = function (gid = appConfig.group.list[appConfig.group.default].id) {
	var lastUid = localStorage.getItem("WebFly:userId") || genRandom(appConfig.user.randomizer.length, appConfig.user.randomizer.map);
	webfly = new ICBSvc(gid, lastUid, appConfig);
	setUid(lastUid);
	updVartext();
	webfly.start();
	addEventListener("beforeunload", function () {
		webfly.close();
	});
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
getConfig();

document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		getIcons().then(function () {
			wimgr.updateIconsAll();
		});
		
	};
});
