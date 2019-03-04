;(function(w, d) {
	var o = {
		modules: {},
		load: {},
		wait: {},
		app: {}
	};

	function getCurrentScript() {
		//取得正在解析的script节点
		if(d.currentScript) { //firefox 4+
			return d.currentScript;
		}
		// 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
		var stack;
		try {
			a.b.c(); //强制报错,以便捕获e.stack
		} catch(e) {//safari的错误对象只有line,sourceId,sourceURL
			stack = e.stack;
			if(!stack && window.opera){
				//opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
				stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
			}
		}
		if(stack) {
			console.log(stack)
			/**e.stack最后一行在所有支持的浏览器大致如下:
			*chrome23:
			* at http://113.93.50.63/data.js:4:1
			*firefox17:
			*@http://113.93.50.63/query.js:4
			*opera12:
			*@http://113.93.50.63/data.js:4
			*IE10:
			*  at Global code (http://113.93.50.63/data.js:4:1)
			*/
			stack = stack.split( /[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
			stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
			return stack.replace(/(:\d+)?:\d+$/i, "");//去掉行号与或许存在的出错字符起始位置
		}
		var nodes = head.getElementsByTagName("script"); //只在head标签中寻找
		for(var i = 0, node; node = nodes[i++];) {
			if(node.readyState === "interactive") {
				return node;
			}
		}
	}

	var crtDom = function() {
		return d.currentScript ? d.currentScript : function() {
			for (var e, o = d.scripts, n = o.length - 1, r = n; r > 0; r--)
				if ("interactive" === o[r].readyState) {
					e = o[r];
					break
				}
			return e || o[n]
		}();
	};

	var baseUrl = function() {
		return src = crtDom().src, src.substring(0, src.lastIndexOf("/") + 1);
	}();

	console.log(baseUrl);

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

	var a = "undefined" != typeof opera && "[object Opera]" === opera.toString();

	w.d = {
		require: function(modules, callback, exports) {
			var that = this,
				modules = typeof modules === 'string' ? [modules] : modules,
				module = modules[0],
				path = paths[module] || module,
				exports = exports || [],
				head = d.getElementsByTagName("head")[0];

			function onFileLoad(e) {
				var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
				
				if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
					el.removeAttribute("module");
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
				el.attachEvent.toString && el.attachEvent.toString().indexOf("[native code") < 0 || a ? el.addEventListener("load", function(e) {
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
		},

		define: function(deps, factory) {
			var that = this,
				module = getCurrentScript().getAttribute("module");
			typeof deps === 'function' && (
				factory = deps,
				deps = []
			);
			o.wait[module] = true;

			this.require(deps, function() {
				o.app[module] = factory.apply(that, arguments);
			});

			return this;
		}
	};
})(window, document);