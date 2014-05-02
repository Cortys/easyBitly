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

function tryShorten() {
	changeIcon("Y");
	sGet(["token"], function(data) {
		if(!data.token) {
			changeIcon("R");
			showDialog();
			return;
		}
		$.get("https://api-ssl.bitly.com/v3/shorten", { "access_token":data.token, longUrl:encodeURI(currentURL) }, function(data) {
			if(data["status_txt"] == "OK") {
				copy(data.data.url, "text/plain");
				changeIcon("G");
			}
			else {
				changeIcon("R", function() {
					if(data["status_txt"] == "INVALID_URI")
						alert("This URL cannot be shortened!");
					else
						alert("Your request failed! Please try again.");
				});
			}
			setTimeout(function() {
				changeIcon("");
			}, 300);
		}, "json").fail(function() {
			refreshToken(tryShorten, showDialog);
		});
	});
}


function showDialog() {
	chrome.tabs.create({ url:"options.html?fail" }, tabClosing);
}