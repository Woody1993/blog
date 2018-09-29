$.fn.serialize = function(opt) {
	opt = $.extend({
		overlay: false  // 相同的name值是否覆盖，否则以字符串数组的形式叠加
	}, opt || {});

	if ($(this)[0].tagName == 'TABLE') {
		var arr = [];
		$(this).find('tbody tr').each(function() {
			arr.push($(this).serialize(opt));
			$(this).find('input[name], select[name], textarea[name]').addClass('j-serialized');
		});

		return arr;
	} else {
		var obj = {};
		var arr = [];
		$(this).find('table[name]').each(function() {
			var name = $(this).attr('name');
			obj[name] = $(this).serialize(opt);
		});

		$(this).find('input[name], select[name], textarea[name]').each(function() {
			if ($(this).hasClass('j-serialized')) return;

			var name = $(this).prop('name').replace(/\[\d\]$/g, '');
			if ($(this).prop('type') == 'checkbox') {
				if ($(this).prop('checked')) {
					obj[name] = obj[name] || [];
					obj[name].push($(this).val());
					if (arr.indexOf(name) == -1) arr.push(name);
				}
			} else if ($(this).prop('type') == 'radio') {
				if ($(this).prop('checked')) {
					obj[name] = $(this).val();
				}
			} else {
				if (opt.overlay || !obj[name]) {
					obj[name] = $(this).val();
				} else {
					if (!obj[name].push) obj[name] = [obj[name]];
					obj[name].push($(this).val());
					if (arr.indexOf(name) == -1) arr.push(name);
				}
			}
		});

		for (var i in arr) {
			//obj[arr[i]] = JSON.stringify(obj[arr[i]]);
		}

		$(this).find('.j-serialized').removeClass('j-serialized');

		return obj;
	}
};

$.fn.voluation = function(data) {
		console.log(data);
	for (var i in data) {
		var $o = $('[name="'+i+'"]');
		if ($o.length == 0) continue;
		if ($o[0].tagName == 'TABLE') {

		} else {
			if ($o.prop('type') == 'checkbox') {

			} else if ($o.prop('type') == 'radio') {
				
			} else {
				$o.val(data[i]);
			}
		}
		console.log($o, i, data[i]);
	}
}

function HTMLEncode(html) {
	var temp = document.createElement('div');
	(temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
	var output = temp.innerHTML;
	temp = null;
	return output;
}
function HTMLDecode(text) { 
	var temp = document.createElement('div'); 
	temp.innerHTML = text; 
	var output = temp.innerText || temp.textContent; 
	temp = null; 
	return output; 
}