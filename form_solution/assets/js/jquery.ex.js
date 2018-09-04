(function(w, $, d) {
	$.fn.chk = function(state) {
		$(this).each(function() {
			if ($(this).hasClass('z-dis')) return;
			if ((state && state == 'chk') || (!state && !$(this).hasClass('z-chk'))) {
				if ($(this).hasClass('u-radio')) {
					var name = $(this).find('input').attr('name');
					if (name) {
						$('.u-radio input[name='+name+']').removeAttr('checked').closest('.u-radio').removeClass('z-chk');
					}
				}
				$(this).addClass('z-chk').find('input').attr('checked', 'checked');
			} else if ((state && state == 'unchk') || (!state && $(this).hasClass('z-chk'))) {
				$(this).removeClass('z-chk').find('input').removeAttr('checked');
			}
		});
	};
})(window, jQuery, document);