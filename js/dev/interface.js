"use strict";

// Initialize
var btns = {}, panes = {}, tabs = {};

// Read config
var getConfig = async function () {
	var resp = await fetch("../conf/config.json");
	self.appConfig = await resp.json();
};
var getIcons = async function () {
	var resp = await fetch("../conf/iconidx.json");
	var iconConfig = await resp.json();
	self.wimgr = new IconMgr("../img/", iconConfig);
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
// Refresh all elements on resize
var uiRefresher = function () {
	updButtons();
	eleResize();
};
// Force button sizes
var updButtons = function () {
	Array.from(document.querySelectorAll("div[id^=btn]")).forEach((e) => {
		var factor1 = e.children[0];
		var factor2 = getComputedStyle(factor1);
		e.style.width = (parseInt(factor1.style.width) + parseInt(factor2.marginLeft) + parseInt(factor2.marginRight)).toString() + "px";
		e.style.height = (parseInt(factor1.style.height) + parseInt(factor2.marginTop) + parseInt(factor2.marginBottom)).toString() + "px";
	});
};
// Resize elements
var eleResize = function () {
	panes.activity.style.width = (innerWidth - panes.drawer.clientWidth).toString() + "px";
};

// Window
var drawerDisp, chatDisp;
document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		getIcons().then(function () {
			wimgr.updateIconsAll();
			uiRefresher();
			addEventListener("resize", function () {
				eleResize();
			});
		});
		// Get elements
		// Buttons
		btns.listDrawer = document.querySelector("#btn-drawer");
		// Panes
		panes.drawer = document.querySelector(".disp-drawer");
		panes.activity = document.querySelector(".disp-activity");
		// Add event listeners
		btns.listDrawer.addEventListener("mouseup", function () {
			if (panes.drawer.className == "disp-drawer expanding style-flex-c") {
				panes.drawer.className = "disp-drawer inactive-disp";
			} else {
				panes.drawer.className = "disp-drawer expanding style-flex-c";
			};
			eleResize();
		});
	};
});
