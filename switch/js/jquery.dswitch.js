 $.fn.createSwitch = createSwitch = function(opt) {
	opt = jQuery.extend({
		id: $(this).attr('id') || '',    //开关id
		state: 'off',           //初始状态。on:开；off:关
		onText: '开',          //开启状态显示文本
		offText: '关',         //关闭状态显示文本
		onStyle: {
			ico: '',             //开关上文字
			color: '#fff',      //开启状态文本颜色
			bgColor: '#13b806' //开启状态背景颜色
		},
		offStyle: {
			ico: '',             //开关上文字
			color: '#fff',      //关闭状态文本颜色
			bgColor: '#979797' //关闭状态背景颜色
		},
		width: 50,              //开关宽度
		offset: 1,
		callback: function() {} //点击开关事件，返回false可阻止开关切换状态
	}, opt || {});

	var onStyle = jQuery.extend({
		ico: '', 
		color: '#fff',
		bgColor: '#13b806'
	}, opt.onStyle);
	var offStyle = jQuery.extend({
		ico: '', 
		color: '#fff',
		bgColor: '#13b806'
	}, opt.offStyle);

	var $switch = $([
		'<div id="'+opt.id+'" class="u-switch z-'+opt.state+'">',
			'<div>',
				'<span class="on" style="color:'+onStyle.color+';background-color:'+onStyle.bgColor+';">'+opt.onText+'</span>',
				'<span class="off" style="color:'+offStyle.color+';background-color:'+offStyle.bgColor+';">'+opt.offText+'</span>',
			'</div>',
			'<ins><i class="on-txt">'+opt.onStyle.ico+'</i><i class="off-txt">'+opt.offStyle.ico+'</i></ins>',
		'</div>'
	].join(''));

	$switch.width(opt.width).data('tab', opt.offset);

	if (opt.state == 'on') {
		$switch.find('ins').css('left', (opt.width-(22+parseInt($switch.data('tab'))))+'px');
	} else {
		$switch.find('ins').css('left', $switch.data('tab')+'px');
	}

	$switch.click(function(e) {
		if (opt.callback($(this), $switch.hasClass('z-on') ? 'on' : 'off') != false) {
			$switch.switch();
		}
		e.stopPropagation();
	});

	if ($(this)[0].tagName) {
		$(this).before($switch).remove();
	}

	return $switch;
};

$.fn.switch = function(state) {
	if (!$(this).hasClass('u-switch')) return;
	var self = $(this);
	var w = self.width();
	if (state == 'on' || (!state && self.hasClass('z-off'))) {
		self.removeClass('z-off').addClass('z-on').find('ins').css('left', (w-(22+parseInt(self.data('tab'))))+'px');
	} else if (state == 'off' || (!state && self.hasClass('z-on'))) { 
		self.removeClass('z-on').addClass('z-off').find('ins').css('left', self.data('tab')+'px');
	}
	return $(this);
}