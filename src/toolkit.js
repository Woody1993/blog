;(function(w, d) {
	var o = {
		modules: {},
		load: {},
		wait: {},
		app: {}
	};

	var crtDom = function() {
		if (d.currentScript) {
			return d.currentScript;
		}

		if (d.scripts[0].readyState === undefined) {
			var stack;
			try {
				undefined.undefined;
			} catch(e) {
				stack = !e.stack && window.opera ? (String(e).match(/of linked script \S+/g) || []).join(" ") : e.stack;
				stack && (
					stack = stack.split( /[@ ]/g).pop(),
					stack = stack[0] == "(" ? stack.slice(1,-1) : stack,
					stack = stack.replace(/(:\d+)?:\d+$/i, "")
				);
			}
		}
		
		for (var e, o = d.scripts, n = o.length - 1, r = n; r > 0; r--)
			if ("interactive" === o[r].readyState || stack && o[r].src == stack) {
				e = o[r];
				break
			}
		return e || o[n];
	};

	var baseUrl = function() {
		return src = crtDom().src, src.substring(0, src.lastIndexOf("/") + 1);
	}();

	var paths = {
		reset: "css!style/reset",
		flex: "css!style/flex",
		font: "css!style/font",
		jquery: "script/toolkit.jquery",
		datagrid: "script/toolkit.datagrid",
		datagrid_css: "css!style/toolkit.datagrid",
		pagination: "script/toolkit.pagination",
		pagination_css: "css!style/toolkit.pagination",
		popups: "script/toolkit.popups",
		popups_css: "css!style/toolkit.popups",
		form: "script/toolkit.form",
		form_css: "css!style/toolkit.form",
		tools: "script/toolkit.tools",
		shortcuts: "script/toolkit.shortcuts"
	};

	var absPath = function(u) {
		return /^https?:\/{1,}/.test(u) || /^ftp:\/*/.test(u);
	};

	var createPath = function(u, type) {
		return (absPath(u) ? "" : baseUrl) + u + (type ? (type == 'js' ? (/\.js$/.test(u) ? "" : ".js") : (/\.css$/.test(u) ? "" : ".css")) : '');
	}

	var step = 0;
	document.addEventListener('DOMContentLoaded', function() {
		document.body.style.opacity = '0';
    }, false);
    
	w.require = function(modules, callback, exports) {
		++step;
		typeof modules === 'function' && (
			callback = modules,
			modules = []
		);

		var that = this,
			modules = typeof modules === 'string' ? [modules] : modules,
			module = modules[0],
			path = paths[module] || module,
			exports = exports || [],
			head = d.getElementsByTagName("head")[0];

		function onFileLoad(e) {
			var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
			
			if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
				el.tagName == 'SCRIPT' && head.removeChild(el);
				o.load[module] = true;
				onDefine();
			}
		}

		function onDefine() {
			o.wait[module] ? 
				(function poll() {
					o.app[module] ? (
						exports.push(o.app[module]),
						onCallback()
					) : setTimeout(poll, 4);
				}()) :
				onCallback();
		}

		function onCallback() {
			modules.length > 1 ?
				that.require(modules.slice(1), callback, exports) :
				(typeof callback === 'function' && callback.apply(that, exports));
				
            if (!--step) {
                document.body.style.opacity = '1';
            };
		}

		if (modules.length === 0) {
			return onCallback(), this;
		}

		if (!o.modules[module]) {
			if (path.indexOf("css!") == 0) {
				path = path.slice(4);
				var el = d.createElement("link"),
					url = createPath(path, 'css');
				el.rel = "stylesheet", el.href = url;
			} else {
				var el = d.createElement("script"),
					url = createPath(path, 'js');
				el.async = true, el.charset = "utf-8", el.src = url, el.setAttribute("module", module);
			}

			head.appendChild(el);
			el.addEventListener ||
			!el.attachEvent || 
			el.attachEvent.toString && el.attachEvent.toString().indexOf("[native code") < 0 ? el.addEventListener("load", function(e) {
				onFileLoad(e);
			}, !1) : el.attachEvent("onreadyftatechange", function(e) {
				onFileLoad(e);
			});
		
			o.modules[module] = url;
		} else {
			(function poll() {
				o.load[module] ? (
					onDefine()
				) : setTimeout(poll, 4);
			}());
		}
	};

	w.define = function(deps, factory) {
		var that = this,
			module = crtDom().getAttribute("module");
		typeof deps === 'function' && (
			factory = deps,
			deps = []
		);
		o.wait[module] = true;

		this.require(deps, function() {
			o.app[module] = factory.apply(that, arguments);
		});

		return this;
	};

	require(['reset', 'flex', 'font']);
})(window, document);