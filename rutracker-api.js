var http = require('http'),
	querystring = require('querystring'),
	cheerio = require('cheerio'),
	windows1251 = require('windows-1251'),
	EventEmitter = require('events');

function RutrackerApi(data) {
	var api = new EventEmitter();

	for (prop in api)
		this[prop] = api[prop];

	this.host = 'rutracker.org';
	this.login_host = 'login.rutracker.org';
	this.login_path = '/forum/login.php';
	this.search_path = '/forum/tracker.php';
	this.cookie = null;
	this.parseData = true;

	if (typeof data == 'object' && data.username && data.password) {
		this.username = data.username;
		this.password = data.password;
		this.login();
	}

	return this;
};

RutrackerApi.prototype.login = function(username, password) {
	var postData = querystring.stringify({
		login_username: username || this.username,
    	login_password: password || this.password, 
    	login: 'Вход'
	});

	var	options = {
		hostname: this.login_host,
		port: 80,
		path: this.login_path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};

	var that = this;
	var	req = http.request(options, function(res) {
		if (res.statusCode == "302") {
			that.cookie = res.headers['set-cookie'][0];
			that.emit('login', true);
		}
	});

	req.write(postData);
	req.end();
};


RutrackerApi.prototype.search = function(_query, _callback) {
	if (typeof this.cookie != "string") {
		throw Error("Unauthorized: Use 'login' method first");
	}
	else if (typeof _query == "undefined") {
		throw TypeError("Expected at least one argument");
	}

	var callback = _callback || function() {},
		query = encodeURIComponent(_query),
		path = this.search_path + "?nm=" + query;

	var options = {
		hostname: this.host,
		port: 80,
		path: path,
		method: 'POST',
		headers: {
			'Cookie': this.cookie
		}
	};

	var that = this;
	var	req = http.request(options, function(res) {
		if (res.statusCode == "200") {
			var data = ""; 
			res.setEncoding('binary');
			res.on("data", function(x) {
				data = data + windows1251.decode(x, {mode: 'html'});
			});
			res.on("end", function() {
				if (that.parseData === true) {
					that.parseSearch(data, callback);
				} else {
					callback(data);
				}
			});
		}
		else {
			throw Error("HTTP code is " + res.statusCode);
		}
	});

	req.end();
}

RutrackerApi.prototype.parseSearch = function(rawHtml, callback) {
	var $ = cheerio.load(rawHtml, {decodeEntities: false}),
		tracks = $("#tor-tbl tbody").find('tr'),
		results = [],
		length = tracks.length;

	for (var i = 0; i < length; i++) {
		// Ah-m... Couldn't find any better method
		var document = tracks.find('td'),
			state = document.next(),
			category = state.next(),
			title = category.next()
			author = title.next(),
			size = author.next(),
			seeds = size.next(),
			leechs = seeds.next();

		results.push({
			'state': state.attr('title'),
			'category': category.find(".f-name a").html(),
			'title': title.find("div a ").html(),
			'author': author.find("div a ").html(),
			'size': size.find("a").html().replace("&nbsp;", "").replace(" &#8595;", ""),
			'seeds': seeds.find("b").html(),
			'leechs': leechs.find("b").html(),
			'url': "http://" + this.host + "/forum/" + title.find("div a").attr("href")
		})

		tracks = tracks.next();
	}

	if (callback) {
		callback(results)
	} else {
		return results;
	}
};

module.exports = RutrackerApi;