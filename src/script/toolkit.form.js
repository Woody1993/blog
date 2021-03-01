define([
	'jquery',
	'form_css'
], function($) {
	var main = function(opt) {
		return new main.fn.init(opt);
    };
    
	main.fn = main.prototype = {
        init: function() {

        },

        createCheck: function(opt) {
            opt = $.extend({
                type: 'checkbox',
                name: '',
                checked: false,
                callback: function() {}
            }, opt || {});

            var $o = $([
                '<div class="d-check flex-center ' + (opt.checked ? 'z-chk' : '') + '">',
                    '<input type="' + (opt.type || 'checkbox') + '" checked="' + !!opt.checked + '">',
                    '<div class="flex-center"><i class="df df-check"></i></div>',
                    (opt.name ? '<span class="flex-grow">' + opt.name + '</span>' : ''),
                '</div>'
            ].join('')).click(function(e) {
                e.stopPropagation();

                var state = !!$(this).hasClass('z-chk'), stop = false, next = function() {
                    handle.check(!state);
                };
                opt.callback(!state, function() {
                    stop = true;
                }, next);
                !stop && next();
            });

            var handle = {
                obj: $o,
                check: function(checked) {
                    if (checked) {
                        $o.addClass('z-chk').children('input').attr('checked', true);
                    } else {
                        $o.removeClass('z-chk').children('input').removeAttr('checked');
                    }
                }
            };

            return handle;
        },

        initCheck: function() {
            $('input[type="checkbox"], input[type="radio"]').each(function() {
                var $o = $([
                    '<div class="d-check flex-center"></div>'
                ].join(''));

                $(this).after($o).appendTo($o);
            });
        }
    };

    main.fn.init.prototype = main.fn;
    
    for (let fun in main.fn) {
        main[fun] = main.fn[fun];
    }

    return main;
});