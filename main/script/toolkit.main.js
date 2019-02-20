require([
	'jquery',
	'css!../style/reset.css'
], function($) {
});

/**
 * 获取浏览器类型和版本
 * @returns {string}
 */
function getExplore() {
	var sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;

	(s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1]:
		(s = ua.match(/msie ([\d\.]+)/)) ? sys.ie = s[1] :
		(s = ua.match(/edge\/([\d\.]+)/)) ? sys.edge = s[1] :
		(s = ua.match(/firefox\/([\d\.]+)/)) ? sys.firefox = s[1] :
		(s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? sys.opera = s[1] :
		(s = ua.match(/chrome\/([\d\.]+)/)) ? sys.chrome = s[1] :
		(s = ua.match(/version\/([\d\.]+).*safari/)) ? sys.safari = s[1] : 0;

	if (sys.ie) return ('IE: ' + sys.ie);
	if (sys.edge) return ('EDGE: ' + sys.edge);
	if (sys.firefox) return ('Firefox: ' + sys.firefox);
	if (sys.chrome) return ('Chrome: ' + sys.chrome);
	if (sys.opera) return ('Opera: ' + sys.opera);
	if (sys.safari) return ('Safari: ' + sys.safari);

	return 'Unkonwn';
};

/**
 * 获取操作系统类型
 * @return {string}
 */
function getOS() {
	var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
	var vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
	var appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';

	if (/mac/i.test(appVersion)) return 'MacOSX';
	if (/win/i.test(appVersion)) return 'windows';
	if (/linux/i.test(appVersion)) return 'linux';
	if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) 'ios';
	if (/android/i.test(userAgent)) return 'android';
	if (/win/i.test(appVersion) && /phone/i.test(userAgent)) return 'windowsPhone';

	return 'Unkonwn';
};

/**
 * 获取变量的类型
 * @param {*} v      变量
 * @returns {string} 变量类型（number|NaN|boolean|array|object|function|undefined）
 */
function is(v) {
	switch(typeof v) {
	case 'number':
		if (v !== v) return 'NaN';
		return typeof v;
		break;
	case 'object':
		if (v.constructor === Array) return 'array';
		return typeof v;
		break;
	default:
		return typeof v;
	}
};

/**
 * 获取url指定参数
 * @param {string} n 参数名
 * @returns {string} 参数值
 */
function getUrlParam(n) {
	var reg = new RegExp("(^|&)" + n + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return decodeURI(r[2]);
	}
	return null;
};

/**
 * 将url参数解析成对象
 * @param {string} u 需要解析的url地址，默认为当前地址
 * @returns {object} 解析后的对象
 */
function parseUrlParam(u) {
	u = u || window.location.href;
	var i = u.lastIndexOf('?');
	if (i == -1) return {};
	var s = u.substring(++i);
	if (!s) return {}
	return JSON.parse('{"' + decodeURIComponent(s).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
};

/**
 * 设置cookie
 * @param {string} n cookie名称
 * @param {string} v cookie值
 * @param {string} s cookie有效时长（s）
 */
function setCookie(n, v, s) {
	var t = new Date();
	t.setTime(t.getTime() + s*1000);
	document.cookie = n + '=' + v + ';expires=' + t;
};

/**
 * 获取cookie
 * @param {string} n cookie名称
 * @returns {string} cookie值
 */
function getCookie(n) {
	var a = document.cookie.replace(/\s/g, "").split(';');
	for (var i = 0; i < a.length; i++) {
		var t = a[i].split('=');
		if (t[0] == n) {
			return decodeURIComponent(t[1]);
		}
	}
	return '';
};

/**
 * 移除cookie
 * @param {string} n cookie名称
 */
function removeCookie(n) {
	setCookie(n, '', -1);
};

/**
 * 获取随机整数
 * @param {*} min
 * @param {*} max
 * @returns
 */
function randomNum(min, max) {
	var rang = max - min;
	var rand = Math.random();
	return (min + Math.round(rand * rang));
}

/**
 * 函数防抖（一般用于防止重复提交）
 * @param  {Function} func      要执行的方法
 * @param  {Number}   wait      等待时间
 * @param  {Booleans} immediate 是否立即执行
 * @return {Function}           设置防抖后方法
 */
function debounce(func, wait, immediate) {
	var timeout, args, context, timestamp, result;

	var later = function() {
		var last = new Date().getTime() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			}
		}
	};

	return function() {
		context = this;
		args = arguments;
		timestamp = new Date().getTime();
		var callNow = immediate && !timeout;
		if (!timeout) timeout = setTimeout(later, wait);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
};

/**
 * 函数节流（一般用于需要频繁调用某一方法时）
 * @param  {Function} func    执行的方法
 * @param  {Number}   wait    等待时间
 * @param  {Object}   options {leading: true|false, trailing: true|false}
 *                            leading 是否立即执行一次
 *                            trailing 是否执行最后一次延时调用
 * @return {Function}         设置节流后的方法
 */
function throttle(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};
	var later = function() {
		previous = options.leading === false ? 0 : new Date().getTime();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function() {
		var now = new Date().getTime();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};