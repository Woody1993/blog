;(function(w, d) {
	var o = {
		modules: {},
		status: {},
		timeout: 10,
		event: {}
	};

	var baseUrl = function() {
		var e = d.currentScript ? d.currentScript.src : function() {
			for (var e, o = d.scripts, n = o.length - 1, r = n; r > 0; r--)
				if ("interactive" === o[r].readyState) {
					e = o[r].src;
					break
				}
			return e || o[n].src
		}();
		return e.substring(0, e.lastIndexOf("/") + 1)
	}();

	var paths = {
		jquery: "script/jquery",
		css: "css!style/reset"
	};

	var absPath = function(u) {
		return /^https?:\/{1,}/.test(u) || /^ftp:\/*/.test(u);
	};

	var createPath = function(u, type) {
		return (absPath(u) ? "" : baseUrl) + u + (type ? (type == 'js' ? (/\.js$/.test(u) ? "" : ".js") : (/\.css$/.test(u) ? "" : ".css")) : '');
	}

	w.d = {
		require: function(modules, callback) {
			if (!modules.length) return;
			var head = d.getElementsByTagName("head")[0];
			var module = paths[modules[0]];

			if (module.indexOf("css!") == 0) {
				module = module.slice(4);
				var el = d.createElement("link");
				el.rel = "stylesheet", el.href = createPath(module, 'css');
			} else {
				var el = d.createElement("script");
				el.async = true, el.charset = "utf-8", el.src = createPath(module, 'js');
			}

			head.appendChild(el);
			!el.attachEvent || el.attachEvent.toString && el.attachEvent.toString().indexOf("[native code") < 0 || a ? el.addEventListener("load", function(e) {
				console.log(el);
				callback && callback(e);
			}, !1) : e.attachEvent("onreadyftatechange", function(e) {
				console.log(el);
				callback && callback(e);
			});

			this.require(modules.slice(1), callback);
		},

		define: function(o, f) {

		}
	};

	console.log({
		baseUrl: baseUrl
	})
})(window, document);