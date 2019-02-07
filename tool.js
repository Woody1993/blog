/**
 * Javascript Toolkit
 * versions 0.0.1
 * author Woody
 * 
 * os - 系统类型
 * browser - 浏览器类型
 * cookie - 操作cookie
 * 	┣ set - 设置cookie
 * 	┣ get - 获取cookie
 * 	┗ remove - 移除cookie
 * urlParam - 获取url参数
 * 	┣ get - 获取指定url参数
 * 	┗ parse - 将url参数解析成对象
 */

;(function() {
	window.d = {
		v: '0.0.1',

		// 系统类型
		os: (function() {
			var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '',
				vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '',
				appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';
		
			if (/mac/i.test(appVersion)) return 'MacOSX';
			if (/win/i.test(appVersion)) return 'windows';
			if (/linux/i.test(appVersion)) return 'linux';
			if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) 'ios';
			if (/android/i.test(userAgent)) return 'android';
			if (/win/i.test(appVersion) && /phone/i.test(userAgent)) return 'windowsPhone';
		
			return 'Unkonwn';
		})(),

		// 浏览器类型
		browser: (function() {
			var sys = {},
				ua = navigator.userAgent.toLowerCase(),
				s;
		
			(s = ua.match(/rv:([\d.]+)\) like gecko/))
				? sys.ie = s[1]
				: (s = ua.match(/msie ([\d\.]+)/))
					? sys.ie = s[1]
					: (s = ua.match(/edge\/([\d\.]+)/))
						? sys.edge = s[1]
						: (s = ua.match(/firefox\/([\d\.]+)/))
							? sys.firefox = s[1]
							: (s = ua.match(/(?:opera|opr).([\d\.]+)/))
								? sys.opera = s[1]
								: (s = ua.match(/chrome\/([\d\.]+)/))
									? sys.chrome = s[1]
									: (s = ua.match(/version\/([\d\.]+).*safari/))
										? sys.safari = s[1]
										: 0;
		
			if (sys.ie) return ('IE: ' + sys.ie);
			if (sys.edge) return ('EDGE: ' + sys.edge);
			if (sys.firefox) return ('Firefox: ' + sys.firefox);
			if (sys.chrome) return ('Chrome: ' + sys.chrome);
			if (sys.opera) return ('Opera: ' + sys.opera);
			if (sys.safari) return ('Safari: ' + sys.safari);
		
			return 'Unkonwn';
		})(),

		cookie: {
			/**
			 * 设置Cookie
			 * @param {String} n cookie的名称
			 * @param {String} v cookie的值（只允许字符串）
			 * @param {Number} s cookie的保存时长（单位：秒）
			 */
			set: function(n, v, s) {
				var t = new Date();
				t.setTime(t.getTime() + s*1000);
				document.cookie = n + '=' + v + ';expires=' + t;
			},

			/**
			 * 获取Cookie值
			 * @param  {String} n cookie的名称
			 * @return {String}
			 */
			get: function(n) {
				var arr = document.cookie.replace(/\s/g, "").split(';');
				for (var i = 0; i < arr.length; i++) {
					var tempArr = arr[i].split('=');
					if (tempArr[0] == n) {
						return decodeURIComponent(tempArr[1]);
					}
				}
				return '';
			},

			/**
			 * 删除Cookie
			 * @param  {String} n cookie的名称
			 */
			remove: function(n) {
				setCookie(n, '', -1);
			}
		},

		urlParam: (function() {
			function getSearch(u) {
				u = u || window.location.href;
				return u.match(/^[^?]*\??(.*)/)[1];
			}

			return {
				/**
				 * 获取url指定参数
				 * @param  {String} n 参数名
				 * @param  {String} u url地址，默认为当前页面url
				 * @return {String}
				 */
				get: function(n, u) {
					var search = getSearch(u);
					if (search) {
						var reg = new RegExp('(^|&)' + n + '=([^&]*)(&|$)');
						var r = search.match(reg);
						if (r) {
							return decodeURI(r[2]);
						}
					}
					return undefined;
				},
	
				/**
				 * 将url参数解析成对象
				 * @param  {String} u url地址，默认为当前页面url
				 * @return {Object}
				 */
				parse: function(u) {
					var search = getSearch(u);
					if (search) {
						var param = {};
						d.each(search.split('&'), function(i, item) {
							var p = item.match(/^([^=]+)=(.+)$/);
							if (p) {
								param[p[1]] = decodeURI(p[2]);
							}
						});
						return param;
					}
					return {};
				}
			}
		})(),

		date: (function() {
			function D() {
				return new Date();
			}

			return {
				getPart: function(n) {
					var D = new Date();
					switch(n) {
					case 'y':
						return D.getFullYear();
					case 'M':
						return D.getMonth() + 1;
					case 'd':
						return D.getDate();
					case 'w':
						return D.getDay() || 7;
					case 'h':
						return D.getHours();
					case 'm':
						return D.getMinutes();
					case 's':
						return D.getSeconds();
					case 'ms':
						return D.getMilliseconds();
					default:
						console.log('无效的属性');
						return '';
					}
				},

				parseDateStr: function() {
					
				}
			}
		})(),

		/**
		 * 遍历变量
		 * @param {String}   obj 变量
		 * @param {Function} fun 循环体函数，接受两个参数：单项序号及单项的值
		 */
		each: function(obj, fun) {
			for (var i in obj) {
				fun(i, obj[i]);
			}
		},

		/**
		 * 函数防抖
		 * @param  {Function} func      要执行的方法
		 * @param  {Number}   timer     等待时间
		 * @param  {Booleans} immediate 是否立即执行
		 * @return {Function}           设置防抖后方法
		 */
		debounce: function(fun, timer, immediate) {
			var timeout, args, context, timestamp, result;
		
			var later = function() {
				var last = new Date().getTime() - timestamp;
		
				if (last < timer && last >= 0) {
					timeout = setTimeout(later, timer - last);
				} else {
					timeout = null;
					if (immediate === false) {
						result = fun.apply(context, args);
						if (!timeout) context = args = null;
					}
				}
			};
		
			return function() {
				context = this;
				args = arguments;
				timestamp = new Date().getTime();
				var callNow = immediate !== false && !timeout;
				if (!timeout) timeout = setTimeout(later, timer);
				if (callNow) {
					result = fun.apply(context, args);
					context = args = null;
				}
		
				return result;
			};
		},

		/**
		 * 函数节流
		 * @param  {Function} func     执行的方法
		 * @param  {Number}   timer    等待时间
		 * @param  {Booleans} leading  是否立即执行一次
		 * @param  {Booleabs} trailing 是否执行最后一次延时调用
		 * @return {Function}          设置节流后的方法
		 */
		throttle: function(fun, timer, leading, trailing) {
			var context, args, result;
			var timeout = null;
			var previous = 0;
			var later = function() {
				previous = leading === false ? 0 : new Date().getTime();
				timeout = null;
				result = fun.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function() {
				var now = new Date().getTime();
				if (!previous && leading === false) previous = now;
				var remaining = timer - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0 || remaining > timer) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = fun.apply(context, args);
					if (!timeout) context = args = null;
				} else if (!timeout && trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		}
	}
})();