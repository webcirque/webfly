"use strict";

// Initialize
var btns = {}, panes = {}, tabs = {}, vartext = {}, groups = [];

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
var webfly;

// Refresh all elements on resize
var uiRefresher = function () {
	updButtons();
	eleResize();
	updVartext();
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
	if (innerWidth > 560) {
		panes.drawer.style.width = "";
		panes.activity.style.width = (innerWidth - panes.drawer.clientWidth).toString() + "px";
	} else {
		panes.drawer.style.width = (innerWidth - 40).toString() + "px";
		panes.activity.style.width = innerWidth.toString() + "px";
	};
};
// Update Vartexts
var updVartext = function () {
	var lastUid = localStorage.getItem("WebFly:userId");
	if (+lastUid == 0) {
		lastUid = genRandom(appConfig.user.randomizer.length, appConfig.user.randomizer.map);
	};
	vartext.uidDisp.innerText = lastUid;
	localStorage.setItem("WebFly:userId", lastUid);
};
// Switch tabs
var switchTo = function (that) {
	var idx = Array.from(panes.groupList.children).indexOf(that), kidx = idx;
	if (kidx > 0) {
		kidx -= 1;
	};
	Array.from(panes.content.children).forEach(function (e, i) {
		(i == kidx) ? e.className = "disp-tab" : e.className = "disp-tab inactive-disp";
	});
	Array.from(panes.groupList.children).forEach(function (e, i) {
		if (i == idx) {
			e.className = "active";
			vartext.titleDisp.innerText = e.innerText;
		} else {
			e.className = "";
		};
	});
};
var addGroup = function (id, name) {
	groups.push({id: id, name: name});
	var elem = document.createElement("li");
	elem.innerText = name;
	elem.addEventListener("click", function () {
		switchTo(this);
	});
	var tabd = document.createElement("div");
	tabd.className = "disp-tab inactive-disp";
	var ifra = document.createElement("iframe");
	ifra.className = "intab";
	ifra.src = "chat.htm?id=" + id.toString();
	tabd.appendChild(ifra);
	panes.content.appendChild(tabd);
	panes.groupList.appendChild(elem);
};

// Window
var drawerDisp, chatDisp;
document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		// Get elements
		// Buttons
		btns.listDrawer = document.querySelector("#btn-drawer");
		// Panes
		panes.drawer = document.querySelector(".disp-drawer");
		panes.activity = document.querySelector(".disp-activity");
		panes.groupList = document.querySelector("#disp-grouplist");
		panes.content = document.querySelector(".disp-content");
		// Variable GUI elements
		vartext.uidDisp = document.querySelector("#var-userid");
		vartext.titleDisp = document.querySelector("#var-title");
		// Add event listeners
		btns.listDrawer.addEventListener("mouseup", function () {
			if (panes.drawer.className == "disp-drawer expanding style-flex-c") {
				panes.drawer.className = "disp-drawer inactive-disp";
			} else {
				panes.drawer.className = "disp-drawer expanding style-flex-c";
			};
			eleResize();
		});
		// Get the groups
		Array.from(panes.groupList.children).forEach(function (e) {
			e.addEventListener("click", function () {
				switchTo(this);
			});
		});
		// International
		// Config
		getConfig().then(function () {
			getIcons().then(function () {
				wimgr.updateIconsAll();
				uiRefresher();
				addEventListener("resize", function () {
					eleResize();
					updVartext();
				});
			});
			// Load all groups
			appConfig.group.list.forEach(function (e) {
				addGroup(e.id, e.name);
			});
			// Click on default groupchat
			panes.groupList.children[appConfig.group.default + 2].click();
		});
	};
});
