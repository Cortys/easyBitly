$(function() {
	sGet(["user", "pw"], function(data) {
		$("#user").val(data.user);
		$("#pw").val(data.pw);
	});
	chrome.storage.sync.get(["sync"], function(data) {
		if(data.sync)
			$("#sync").attr("checked", 1);
	});

	if(location.search) {
		alert("Your bitly user-data is invalid!");
		setTimeout(function() {
			changeIcon("");
		}, 300);
		$("#user").focus();
	}
	else
		chrome.tabs.getCurrent(tabClosing);

	$("input").keyup(function(e) {
		if (e.keyCode == 13)
			$("#save").trigger("click");
	});

	var saving = false;

	function setSaving(value) {
		saving = value;
		if(value) {
			$("#save").addClass("saving").val("Saving...");
		}
		else {
			$("#save").removeClass("saving").val("Save");
		}
	}

	$("#save").click(function() {
		if (saving)
			return;
		setSaving(true);
		chrome.storage.sync.set({
			sync: ($("#sync").is(":checked"))
		}, function() {
			sSet({
				user: $("#user").val(),
				pw: $("#pw").val()
			}, function() {
				refreshToken(function() {
					alert("Your data is valid and was saved.");
					location.search = "";
					setSaving(false);
				}, function() {
					alert("Your data is incorrect and was deleted.");
					sSet({
						user: "",
						pw: "",
						token: ""
					}, function() {
						$("#pw").val("");
						setSaving(false);
					});
				});
			});
		});
	});
});
