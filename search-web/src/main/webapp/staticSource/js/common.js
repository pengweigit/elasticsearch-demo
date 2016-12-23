window.alert = function (message, title, callback) {
    if (title == null) {
        title = '提示';
    } else if (typeof(title) == 'function') {
        callback = title;
        title = '提示';
    }
    swal({title:""+message},callback);
    
};

window.myconfirm = function (message, callback, title) {
    if (!title) title = '提示';
    bootbox.dialog({
        message: message,
        title: title,
        buttons: {
            Cancel: {
                label: "取消",
                className: "btn-default btn-sm",
                callback: function () {
                }
            },
            OK: {
                label: "确定",
                className: "btn-primary btn-sm",
                callback: function () {
                    if (typeof(callback) == 'function') callback();
                }
            }
        }
    });
};

(function ($) {
    /**
     * 封装 DataTable 初始化
     * @param options
     * @returns {*}
     */
    $.fn.advancedDataTable = function (options) {
        var $this = this;

        options = $.extend({}, {
            sAjaxSource: "",
            aoColumns: [],
            sDom: "rt<ip>",
            fnServerParams: function (aoData) {
            },
            fnDrawCallback: function (oSettings) {
            },
            fnHeaderCallback: function (nHead, aData, iStart, iEnd, aiDisplay) {
            },
            fnInitComplete: function (oSettings, json) {
            },
            oLanguage: {"sUrl": "jquery.dataTables.lang.zh-CN.txt"}
        }, options);

        var datatable = $this.dataTable({
            "bSort": false, //去掉排序。
            "bStateSave": false, //客户端记录状态，讲状态数据写入cookies
            "bServerSide": true, //异步请求
            "bPaginate": true, //显示分页
            "bProcessing": false, //取消等待提示
            "bLengthChange": true, //不显示“每页显示多少条”的下拉框
            "bRetrieve": true, //允许重新生成表格
            "bAutoWidth": false, //自适应宽度
            "sAjaxSource": options.sAjaxSource,
            "sServerMethod": "GET",
            "bFilter": true,  //过滤功能
            "bInfo": true, //页脚信息
            "iDisplayStart": 0,
            "iDisplayLength": 10,
            "aoColumns": options.aoColumns,
            "sDom": options.sDom,
            "fnServerParams": function (aoData) {
                options.fnServerParams(aoData);
            },
            "fnDrawCallback": function (oSettings) {
                if ($this.find('tr > th:first-child input:checkbox')[0]) {
                    $this.find('tr > th:first-child input:checkbox')[0].checked = false;
                    $this.find('tr > td:first-child input:checkbox').each(function () {
                        this.checked = false;
                    });
                }
                options.fnDrawCallback(oSettings);
                $this.find("a[data-rel=tooltip]").tooltip();
                var ipage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength);
                var TotalPages = Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength);
                var str = '<li><input size="10" style="width: 50px;height:28px;float: left;margin-right: 1px;" type="text" value="'+(ipage+1)+'" type="number"></li><li class="paginate_button"><a class="myPage btn btn-primary btn-xs" type="button" ipage="' + (ipage + 1) + '" totalPage="' + TotalPages + '" >跳转</a></li> ';
                $this.next().find('.dataTables_paginate ul').append(str);
                $this.next().find(".myPage").click(function () {
                    var target = this;
                    var oSettings = $this.fnSettings();
                    var $input = $(target).parent().prev().find("input");
                    var value=$input.val();
                    if (value == "") {
                        return;
                    }
                    var maxpage = $(target).attr("totalPage");
                    if (isNaN(value)) {
                        value = 0;
                        $input.val(1);
                    } else if (parseInt(value) > parseInt(maxpage)) {
                        value = maxpage - 1;
                        $input.val(maxpage);
                    } else if(value==0){

                    }else{
                        value--;
                    }
                    oSettings._iDisplayStart = (value) * oSettings._iDisplayLength;
                    oSettings.oApi._fnDraw(oSettings);
                });

            },
            "fnHeaderCallback": function (nHead, aData, iStart, iEnd, aiDisplay) {
                options.fnHeaderCallback(nHead, aData, iStart, iEnd, aiDisplay);
            },
            "fnInitComplete": function (oSettings, json) {
                options.fnInitComplete(oSettings, json);

            },
            "oLanguage": options.oLanguage
        });



        $this.on('click', 'tr > th:first-child input:checkbox', function () {
            var checked = this.checked;
            $this.find('tr > td:first-child input:checkbox').each(function () {
                this.checked = checked;
            });
        }).on('click', 'tr > td:first-child input:checkbox', function () {
            var totalCount = $this.find('tr > td:first-child input:checkbox').length;
            var selectCount = $this.find('tr > td:first-child input:checkbox:checked').length;
            $this.find('tr > th:first-child input:checkbox')[0].checked = (totalCount == selectCount);
        });

        datatable.getSelectedData = function () {
            var selectedData = [];
            $this.find('tr > td:first-child input:checkbox:checked').each(function () {
                selectedData.push(datatable.fnGetData($(this).closest('tr')));
            });
            return selectedData;
        };

        return datatable;
    };

    /**
     * ztree的通讯录插件
     * 使用方法：
     $("#treediv").myztree({
	   		basePath: '$contextpath', 
			onClick: function(id, usercode, username) { } // 回调函数
		})
     */
    $.fn.myztree = function (options) {
        var $this = this;
        var selectedDataId = null; // 选中机构节点的id

        options = $.extend({}, {
            basePath: "",
            onClick: function (id, usercode, username) {
            }
        }, options);

        $this.html(
            '<input class="form-control input-sm inline width-70">' +
            '<span class="blue" style="cursor:pointer">查询</span>' +
            '<ul id="ztree_' + $this.attr('id') + '" class="ztree"></ul>' +
            '<ul class="nav no-margin"></ul>');

        var getData = function () {
            $this.children('.nav').html('');
            if ($this.children("input").val() == '' && $this.ztree.getSelectedNodes().length == 0) return;

            var param = {};
            if ($this.children("input").val() != '') param.sSearch = $this.children("input").val();
            if ($this.ztree.getSelectedNodes().length > 0) param.id = $this.ztree.getSelectedNodes()[0].id;

            jQuery.ajax({
                type: "get",
                async: false,
                url: options.basePath + '/sys/operator/getOperators.html',
                data: param,
                dataType: "json",
                success: function (data) {
                    for (var i in data) {
                        $this.children('.nav').append('<li class="navli" dataid="' + data[i].id
                        + '" datausercode="' + data[i].usercode
                        + '" datausername="' + data[i].username + '">' + data[i].username + '</li>');
                    }
                }
            });
        };

        $this.children("input").change(getData);
        $this.children("span").click(getData);

        $this.children('.nav').on("click", "li", function () {
            options.onClick($(this).attr("dataid"), $(this).attr("datausercode"), $(this).attr("datausername"));
        });

        $this.ztree = $.fn.zTree.init($this.children('.ztree'), {
            async: {url: options.basePath + '/sys/organization/list.html', enable: true, type: 'get'},
            view: {selectedMulti: false, showIcon: false},
            data: {
                simpleData: {enable: true, idKey: "id", pIdKey: "parentid"},
                key: {name: "orgname"}
            },
            callback: {
                onClick: function (event, treeId, treeNode, clickFlag) {
                    if (treeNode.id == selectedDataId) {
                        selectedDataId = null;
                        $this.ztree.cancelSelectedNode();
                    } else {
                        selectedDataId = treeNode.id;
                    }
                    getData();
                },
                onAsyncSuccess: function (event, treeId, treeNode, msg) {
                    $this.ztree.expandNode($this.ztree.getNodeByTId(treeId + "_1"));
                }
            }
        }, null);

        return $this;
    };

})(jQuery);

jQuery.extend(jQuery.validator.messages, {
    required: "必选字段",
    remote: "请修正该字段",
    email: "请输入正确格式的电子邮件",
    url: "请输入合法的网址",
    date: "请输入合法的日期",
    dateISO: "请输入合法的日期 (ISO).",
    number: "请输入合法的数字",
    digits: "只能输入整数",
    creditcard: "请输入合法的信用卡号",
    equalTo: "请再次输入相同的值",
    accept: "请输入拥有合法后缀名的字符串",
    maxlength: jQuery.validator.format("请输入一个长度最多是{0}的字符串"),
    minlength: jQuery.validator.format("请输入一个长度最少是{0}的字符串"),
    rangelength: jQuery.validator.format("请输入一个长度介于{0}和{1}之间的字符串"),
    range: jQuery.validator.format("请输入一个介于 {0}和 {1}之间的值"),
    max: jQuery.validator.format("请输入一个最大为{0}的值"),
    min: jQuery.validator.format("请输入一个最小为{0}的值")
});

$(function () {
    $("a[data-rel=tooltip]").tooltip();

    $("form :input").keydown(function (e) {
        if (e.keyCode == 13) {
            var $form = $(this).closest("form");
            if (!$form) return;

            var formid = $form.attr("id");
            if (formid) {
                $("." + formid + "_submit").click();
                return;
            }

            var formname = $form.attr("name");
            if (formname) {
                $("." + formname + "_submit").click();
                return;
            }
        }
    });
});

$(document).ready(function () {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var localhostPaht = curWwwPath.substring(0, pos);
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    var bashPath = localhostPaht + projectName;

    //Ajax全局配置
    $.ajaxSetup({
        //type: "POST", //用 POST 代替默认 GET 方法
        //cache: false, //禁止AJAX缓存，开发模式下设置为false
        timeout: 60000, //请求超市时间（1分钟）
        statusCode: {
            404: function () {
                alert('页面不存在');
            },
            500: function () {
                alert('服务器内部错误');
            },
            405: function () {
                alert('没有权限');
            },
            301: function (data, textStatus) { // session超时，或者用户未登录，跳转到登录页面
                alert(data.responseText);
                window.location.href = bashPath + '/index.html';
                /*setTimeout(function () {
                 window.location.href = bashPath + '/index';
                 }, 2000);*/
            }
        }
    });

    //TextArea提示信息
    $('textarea.limited').inputlimiter({
        remText: '剩余 %n 个字允许输入...',
        limitText: '最大允许输入字数 : %n.'
    });
});

/**
 * 获取 当前日期的 str ------ 用来存放 upload file 的相对目录
 * @returns {string}
 */
function getDateStr() {
    var myDate = new Date();
    /*myDate.getYear();        //获取当前年份(2位)
     myDate.getFullYear();    //获取完整的年份(4位,1970-????)
     myDate.getMonth();       //获取当前月份(0-11,0代表1月)
     myDate.getDate();        //获取当前日(1-31)
     myDate.getDay();         //获取当前星期X(0-6,0代表星期天)
     myDate.getTime();        //获取当前时间(从1970.1.1开始的毫秒数)
     myDate.getHours();       //获取当前小时数(0-23)
     myDate.getMinutes();     //获取当前分钟数(0-59)
     myDate.getSeconds();     //获取当前秒数(0-59)
     myDate.getMilliseconds();    //获取当前毫秒数(0-999)
     myDate.toLocaleDateString();     //获取当前日期
     var mytime=myDate.toLocaleTimeString();     //获取当前时间
     myDate.toLocaleString( );        //获取日期与时间*/
    return myDate.getFullYear() + '' + pad((myDate.getMonth() + 1), 2) + myDate.getDate();
}
/**
 * 补0
 * @param num
 * @param n
 * @returns {*}
 */
function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}


/**
 * jquery gritter
 * 使用前 先引入 js
 *
 <script src="$contextpath/js/jquery.gritter.min.js"></script>
 ***/


/**
 * 应用场景： 完成   一个操作提交之后，不允许流在该页面，但又需要提示用户
 * 提示操作成功，并 多少秒内跳转
 */
function myFinishAndTurnFn(title, message, fn) {
    var close_Interval;
    var messageHtml = '<div class="modal-header">' +
        '<h4 class="modal-title green">' + title + '</h4>' +
        '</div> ' +
        '<div class="modal-body"> ' +
        '<div class="bootbox-body"> ' +
        message + ' <span class="red2" id="close_countdown">5</span> 秒后跳转...' +
        '</div>' +
        '</div>';
    bootbox.dialog({
        message: messageHtml,
        buttons: {
            "success": {
                "label": "<i class='ace-icon fa fa-check'></i> 马上跳转",
                "className": "btn-sm btn-success",
                "callback": function () {
                    // console.log('马上跳转');
                    clearInterval(close_Interval);
                    fn();
                }
            }
        }
    });
    $(".bootbox-close-button").remove();   // 移除 弹出框的 关闭按钮，
    close_Interval = setInterval(function () {
        var cur = $("#close_countdown").html();
        var next = parseInt(cur) - 1;

        $("#close_countdown").html(next);
        if (next == 0) {
            //console.log('自动跳转');
            clearInterval(close_Interval);
            fn();
        }
    }, 1000);
}