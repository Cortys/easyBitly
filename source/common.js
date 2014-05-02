function refreshToken(correct, wrong) {
	sGet(["user","pw"], function(data) {
		var user = data.user;
		var pw = data.pw;
		$.ajax({
			url: "https://api-ssl.bitly.com/oauth/access_token",
			type: "POST",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Basic "+(window.btoa(user+":"+pw)));
			}
		}).done(function(data) {
			sSet({ token:data }, function() {
				(data?correct:wrong)();
			});
		}).fail(function() {
			wrong();
		});
	});
}

function tabClosing(tab) {
	chrome.storage.local.get(["optionsTab"], function(data) {
		if(data.optionsTab == tab.id)
			return;
		if(data.optionsTab !== undefined)
			chrome.tabs.remove(data.optionsTab);
		chrome.storage.local.set({ optionsTab:tab.id });
	});
}

function sGet(keys, call) {
	var sA = chrome.storage.sync;
	sA.get(["sync"], function(data) {
		sA = chrome.storage[data.sync?"sync":"local"];
		sA.get(keys, call);
	});
}
function sSet(opt, call) {
	var sA = chrome.storage.sync;
	sA.get(["sync"], function(data) {
		sA = chrome.storage[data.sync?"sync":"local"];
		sA.set(opt, call);
	});
}

function changeIcon(color, call) {
	chrome.browserAction.setIcon({
		path: {
			'19':"icon"+color+".png",
			'38':"icon"+color+"@2x.png"
		}
	}, call);
}