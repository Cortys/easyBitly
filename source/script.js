var currentURL = "";

chrome.browserAction.onClicked.addListener(function(tab) {
	currentURL = tab.url;
	tryShorten();
});

function copy(str, mimetype) {
	document.oncopy = function(event) {
		event.clipboardData.setData(mimetype, str);
		event.preventDefault();
	};
	document.execCommand("Copy", false, null);
}

function tryShorten(pURL) {
	if(!navigator.onLine) {
		alert("You seem to be offline.");
		return;
	}
	if(!pURL)
		pURL = currentURL;
	changeIcon("Y");
	sGet(["token"], function(data) {
		if(!data.token) {
			changeIcon("R");
			showDialog();
			return;
		}
		$.get("https://api-ssl.bitly.com/v3/shorten", { "access_token":data.token, longUrl:encodeURI(pURL) }, function(data) {
			if(data["status_txt"] == "OK") {
				copy(data.data.url, "text/plain");
				changeIcon("G");
				setTimeout(function() {
					changeIcon("");
					setTimeout(function() {
						changeIcon("G");
						setTimeout(function() {
							changeIcon("");
						}, 200);
					}, 100);
				}, 200);
			}
			else {
				changeIcon("R", function() {
					if(data["status_txt"] == "INVALID_URI")
						alert("This URL cannot be shortened!");
					else
						alert("Your request failed! Please try again.");
				});
				setTimeout(function() {
					changeIcon("");
				}, 300);
			}
		}, "json").fail(function() {
			refreshToken(tryShorten, showDialog);
		});
	});
}


function showDialog() {
	chrome.tabs.create({ url:"options.html?fail" }, tabClosing);
}

// CONTEXT MENU:
chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
		type:"normal",
		id:"bitTs",
		title:"that shit",
		contexts:["page","link","image","audio","video"]
	});
	chrome.contextMenus.onClicked.addListener(function(info) {
		if(info.menuItemId == "bitTs") {
			var url;
			if(info.linkUrl)
				url = info.linkUrl;
			else if(info.mediaType)
				url = info.srcUrl;
			else
				url = info.frameUrl?info.frameUrl:info.pageUrl;
			console.log(info);
			tryShorten(url);
		}
	});
});