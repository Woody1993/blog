/**
 * Version: 1.0.0
 * Author: Woody
 * Description: 方法目录：
 * 				os - 系统类型
 * 				browser - 浏览器类型
 * 				typeof - 获取变量的类型
 * 				randomNum - 获取随机整数
 *				cookie - 操作cookie
 *					├ set - 设置cookie
 *					├ get - 获取cookie
 *					└ remove - 移除cookie
 * 				urlParam - 操作url参数
 *					├ get - 获取url参数
 *					└ set - 添加url参数
 *				date - 日期操作
 *					├ getPart - 获取日期指定属性
 *					└ fmt - 日期格式化
 *				each - 遍历方法
 *				debounce - 函数防抖
 *				throttle - 函数节流
 */

define(function() {
	var tools = {
		// 系统类型
		os: (function() {
			var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '',
				appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';
		
			if (/mac/i.test(appVersion)) return 'macOS';
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
	
		/**
		 * 获取变量的类型
		 * @param {*} v      变量
		 * @returns {string} 变量类型（number|NaN|boolean|array|object|function|undefined）
		 */
		typeof: function(v) {
			switch(typeof v) {
			case 'number':
				if (v !== v) return 'NaN';
				return typeof v;
			case 'object':
				if (v.constructor === Array) return 'array';
				return typeof v;
			default:
				return typeof v;
			}
		},
	
		/**
		 * 获取随机整数
		 * @param {*} min
		 * @param {*} max
		 * @returns
		 */
		randomNum: function(min, max) {
			var rang = max - min;
			var rand = Math.random();
			return (min + Math.round(rand * rang));
		},
	
		cookie: {
			/**
			 * 设置Cookie
			 * @param {String} n cookie的名称
			 * @param {String} v cookie的值（只允许字符串）
			 * @param {Number} s cookie的保存时长（单位：秒），默认为会话
			 * @param {String} p cookie的所属路由
			 */
			set: function(n, v, s, p) {
				var t = '';
				if (s) {
					var d = new Date();
					d.setTime(d.getTime() + s*1000);
					t = ';expires=' + d;
				};
				document.cookie = n + '=' + v + t + ';path=' + (p || '/');
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
				this.set(n, '', -1);
			}
		},
	
		urlParam: (function() {
			var search = window.location.href.match(/^[^?]*\??(.*)/)[1];
			return {
				/**
				 * 获取url指定参数或所有参数对象
				 * @param  {String} n 参数名，不传则返回所有参数
				 * @return {*}
				 */
				get: function(n) {
					if (search) {
						if (n) {
							var reg = new RegExp('(^|&)' + n + '=([^&]*)(&|$)');
							var r = search.match(reg);
							if (r) {
								try {
									return JSON.parse(decodeURIComponent(r[2]));
								} catch(e) {
									return decodeURIComponent(r[2]);
								};
							}
							return undefined;
						} else {
							var json = {};
							tools.each(search.split('&'), function(item) {
								var t = item.match(/^([^=]+)=(.*)$/);
								try {
									json[t[1]] = JSON.parse(decodeURIComponent(t[2]));
								} catch(e) {
									json[t[1]] = decodeURIComponent(t[2]);
								};
							});
							return json;
						}
					}
					return n ? undefined : {};
				},

				/**
				 * 添加url参数，并获取添加参数后的url
				 * @param {Object} data 需要添加的参数
				 * @param {Boolean} clear 是否清除原有参数
				 * @return {String} 添加参数后的url
				 */
				set: function(data, clear) {
					var json = clear || !search ? {} : JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
					tools.each(data, function(item, i) {
						json[i] = typeof item == 'object' ? JSON.stringify(item) : item;
					});
					return window.location.origin 
						+ window.location.pathname 
						+ (function() {
							try {
								var t = [];
								tools.each(json, function(item, i) {
									t.push(encodeURIComponent(i) + '=' + encodeURIComponent(item));
								});
								return '?' + t.join('&');
							} catch (e) {
								return '';
							}
						})();
				}
			}
		})(),
	
		date: (function() {
			return {
				getPart: function(n) {
					var date = new Date();
					switch(n) {
					case 'y':
						return date.getFullYear();
					case 'M':
						return date.getMonth() + 1;
					case 'd':
						return date.getDate();
					case 'w':
						return date.getDay() || 7;
					case 'h':
						return date.getHours();
					case 'm':
						return date.getMinutes();
					case 's':
						return date.getSeconds();
					case 'ms':
						return date.getMilliseconds();
					default:
						console.warn('无效的属性');
						return '';
					}
				},
	
				fmt: function(date, fmt) {
					date = date || new Date();
					fmt = fmt || 'yyyy-MM-dd hh:mm:ss';

					var o = {
						'q+': Math.floor((date.getMonth() + 3) / 3), //季度
						'M+': date.getMonth() + 1, //月份
						'd+': date.getDate(), //日
						'h+': date.getHours(), //小时
						'm+': date.getMinutes(), //分
						's+': date.getSeconds(), //秒
						'S': parseInt(date.getMilliseconds() / 100) //毫秒
					};
					if (/(y+)/.test(fmt)) {
						fmt = fmt.replace(
							RegExp.$1,
							(date.getFullYear() + '').substr(4 - RegExp.$1.length)
						);
					}
					for (var k in o) {
						if (new RegExp('(' + k + ')').test(fmt)) {
							fmt = fmt.replace(
								RegExp.$1,
								(RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))
							);
						}
					}
					return fmt;
				}
			}
		})(),
	
		/**
		 * 遍历变量
		 * @param {String}   obj 变量
		 * @param {Function} fun 循环体函数，接受两个参数：单项的值及单项的键值
		 */
		each: function(obj, fun) {
			for (var i in obj) {
				if (fun(obj[i], i) === false) {
					break;
				}
			}
		},
	
		/**
		 * 函数防抖
		 * @param  {Function} fun       要执行的方法
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
		 * @param  {Function} fun      执行的方法
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

	return tools;
});