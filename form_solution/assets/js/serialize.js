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
        $(this).find('table[name]').each(function() {
            var name = $(this).attr('name');
            obj[name] = $(this).serialize(opt);
        });

        $(this).find('input[name], select[name], textarea[name]').each(function() {
            if ($(this).hasClass('j-serialized')) return;

            var name = $(this).prop('name').replace(/\[\d\]$/g, '');
            obj[name] = obj[name] || '';
            if ($(this).prop('type') == 'checkbox') {
                if ($(this).prop('checked')) {
                    obj[name] += obj[name] ? ',' + $(this).val() : $(this).val();
                }
            } else if ($(this).prop('type') == 'radio') {
                if ($(this).prop('checked')) {
                    obj[name] = $(this).val();
                }
            } else {
                if (opt.overlay) {
                    obj[name] = $(this).val();
                } else {
                    obj[name] += obj[name] ? ',' + $(this).val() : $(this).val();
                }
            }
        });

        $(this).find('.j-serialized').removeClass('j-serialized');

        return obj;
    }
};