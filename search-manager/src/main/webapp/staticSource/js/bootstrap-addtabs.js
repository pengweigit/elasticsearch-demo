/**
 * Website: http://git.oschina.net/hbbcs/bootStrap-addTabs
 *
 * Version : 0.6
 *
 * Created by joe on 2016-2-4.
 */

$.fn.addtabs = function (options) {
    obj = $(this);
	$(obj).html();
    Addtabs.options = $.extend({
        content: '', //直接指定所有页面TABS内容
        close: true, //是否可以关闭
        monitor: 'body', //监视的区域
        iframeUse: true, //使用iframe还是ajax
        iframeHeight: window.innerHeight - 90, //固定TAB中IFRAME高度,根据需要自己修改
        method: 'init',
        callback: function () { //关闭后回调函数
        }
    }, options || {});


    $(Addtabs.options.monitor).on('click', '[data-addtab]', function () {
		//alert($(this).attr("data-addtab"));
        Addtabs.add({
            id: $(this).attr('data-addtab'),
            title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
            content: Addtabs.options.content ? Addtabs.options.content : $(this).attr('content'),
            url: $(this).attr('url'),
            ajax: $(this).attr('ajax') ? true : false
        });
		
    });

   ///////tcz//////////////////////
	obj.on('click','.nav-tabs li',function(){
		var that = $(this);
		var isCurrentLi = that.attr("class")== 'active';
		var liId = that.attr("id");
		var menuId = typeof(liId) == 'undefined' ? "" : liId.substr("8");
		if(!isCurrentLi && menuId != ""){
			$("#side-menu li[data-id='"+menuId.substr(0,1)+"']").addClass('active').siblings().removeClass('active');
			$("#side-menu li .nav-second-level").removeClass("in").children().removeClass("active");
			$("#side-menu li .nav-second-level li a[data-addtab='"+menuId+"']").parent().addClass("active").parent().addClass("in");
		}
		// 局部刷新iframe
		var id = $(this).find('a:first').attr('href');
    	var $iframeElem = $(id).find('iframe:first');
    	$($iframeElem).attr('src', $($iframeElem).attr('src')).ready();
	});
	obj.on('click', '.close-tab', function () {
        var id = $(this).prev("a").attr("aria-controls");
		//lgd3ge
		var name =  $(this).parent().find("a").attr('name');
		var name = 'a[data-addtab="'+name+'"]';
		$(name).parent().removeClass("active");
        Addtabs.close(id);
    });



    obj.on('mouseover', '.close-tab', function () {
        $(this).removeClass('glyphicon-remove').addClass('glyphicon-remove-circle');
		
    })
	

    obj.on('mouseout', '.close-tab', function () {
        $(this).removeClass('glyphicon-remove-circle').addClass('glyphicon-remove');
    })

    $(window).resize(function () {
        obj.find('iframe').attr('height', Addtabs.options.iframeHeight);
        Addtabs.drop();
    });

};

window.Addtabs = {
    options:{},
    add: function (opts) {
        var id = 'tab_' + opts.id;
		var optsid = opts.id;
        obj.find('.active').removeClass('active');
        //如果TAB不存在，创建一个新的TAB
        if (!$("#" + id)[0]) {
            //创建新TAB的title

            var title = $('<li>', {
                'role': 'presentation',
                'id': 'tab_' + id
            }).append(
                $('<a>', {
                    'href': '#' + id,
                    'aria-controls': id,
                    'role': 'tab',
                    'data-toggle': 'tab',
					'name':optsid
                }).html(opts.title)
            );

            //是否允许关闭
            if (Addtabs.options.close) {
                title.append(
                    $('<i>',{class:'close-tab glyphicon glyphicon-remove'})
                );
            }
            //创建新TAB的内容
            var content = $('<div>', {
                'class': 'tab-pane',
                'id': id,
                'role': 'tabpanel'
            });

            //是否指定TAB内容
            if (opts.content) {
                content.append(opts.content);
            } else if (Addtabs.options.iframeUse && !opts.ajax) {//没有内容，使用IFRAME打开链接
                content.append(
                    $('<iframe>', {
                        'class': 'iframeClass',
                        'height': Addtabs.options.iframeHeight,
                        'frameborder': "no",
                        'border': "0",
                        'src': opts.url
                    })
                );
            } else {
                $.get(opts.url, function (data) {
                    content.append(data);
                });
            }
            //加入TABS
            obj.children('.nav-tabs').append(title);
            obj.children(".tab-content").append(content);
        } else {
        	// 局部刷新iframe
        	var $iframeElem = $('#'+id).find('iframe:first');
        	$($iframeElem).attr('src', $($iframeElem).attr('src')).ready();
        }

        //激活TAB
        $("#tab_" + id).addClass('active');
        $("#" + id).addClass("active");
	//lgd3ge		
		var name =  $("#tab_" + id).find("a").attr('name');
		var name = 'a[data-addtab="'+name+'"]';
		$(".nav-second-level li").removeClass("active");
		$(name).parent().addClass("active");
        Addtabs.drop();
    },
    close: function (id) {
        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (obj.find("li.active").attr('id') == "tab_" + id) {
            $("#tab_" + id).prev().addClass('active');
            $("#" + id).prev().addClass('active');
        }
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();

        Addtabs.drop();
        Addtabs.options.callback();
    },
    drop: function () {
        element = obj.find('.nav-tabs');
        //创建下拉标签
        var dropdown = $('<li>', {
            'class': 'dropdown pull-right hide tabdrop'
        }).append(
            $('<a>', {
                'class': 'dropdown-toggle',
                'data-toggle': 'dropdown',
                'href': '#'
            }).append(
                $('<i>', {'class': "glyphicon glyphicon-align-justify"})
            ).append(
                $('<b>', {'class': 'caret'})
            )
        ).append(
            $('<ul>', {'class': "dropdown-menu"})
        )

        //检测是否已增加
        if (!$('.tabdrop').html()) {
            dropdown.prependTo(element);
        } else {
            dropdown = element.find('.tabdrop');
        }
        //检测是否有下拉样式
        if (element.parent().is('.tabs-below')) {
            dropdown.addClass('dropup');
        }
        var collection = 0;

        //检查超过一行的标签页
        element.append(dropdown.find('li'))
            .find('>li')
            .not('.tabdrop')
            .each(function () {
                if (this.offsetTop > 1 || element.width() - $(this).position().left - $(this).width() < 53) {
                    dropdown.find('ul').append($(this));
                    collection++;
                }
            });

        //如果有超出的，显示下拉标签
        if (collection > 0) {
            dropdown.removeClass('hide');
            if (dropdown.find('.active').length == 1) {
                dropdown.addClass('active');
            } else {
                dropdown.removeClass('active');
            }
        } else {
            dropdown.addClass('hide');
        }
    }
}