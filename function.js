/**
 * 获取变量的类型
 * @param {*} 变量
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
}