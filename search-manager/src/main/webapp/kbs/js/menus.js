var menus = null;
$(document).ready(
function() {
	$X().conf({
		url : '/openx',
		type : 'app'
	});
	
	
	var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    var skin;
    for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split("=");
        if ("skin" == arr[0]) {
            skin = arr[1];
            break;
        }
    }
    if (skin == "default") {
        $("body").removeClass();
    } else if (skin) {
        $("body").addClass(skin);
    }

    var pathname = window.location.pathname;
    var $a = $("#side-menu a[href='" + pathname + "']"); // 路径匹配
    if ($a.length > 0) {
        setStyleForMenu($a.parent("li"));
    }
	
	$X('/login/loginService', 'loadMenus').callx({
        onResult: function (data) {
            if (data) {
            	var json = $.evalJSON(data);
            	menus = initmenus();
            	var root;
                for (var i in menus) {
                    if (menus[i].parentid == 0) { 
                    	root = menus[i]
                    };
                    if (menus[i].functype != "0") { 
                    	getParentMenu(menus[i]);
                    }
                }
                generateMenu(root.children, $("#side-menu"));
                
                var pathname = window.location.pathname;
                var $a =$("#side-menu a[href='" + pathname + "']"); // 路径匹配
                if ($a.length == 0 ) { // 路径不匹配
                }
                if ($a.length > 0) {
                    setStyleForMenu($a.parent("li"));
                }
                //多窗口JS
                addtabs();
            }
        }
    });
});

function generateMenu(arr, $node) {
    for (i in arr) {
        var str = "";
        if (arr[i].children) {
            str = '<li data-id="'+arr[i].id+'"><a href="#"><i class="fa ' + arr[i].funcicon + ' fa-fw"></i> <span class="nav-label"> ' + arr[i].funcname + '</span><span class="fa arrow"></span></a>\
            <ul class="nav nav-second-level collapse">\
            </ul>\
            </li>';
        } else {
            str = '<li><a data-addtab="'+i+'" url="' + arr[i].funcaction + ' "> <i class="fa ' + arr[i].funcicon + ' fa-fw"></i>' + arr[i].funcname + '</a></li>';
        }
        $node.append(str);
        if (arr[i].children) generateMenu(arr[i].children, $node.children(":last").children("ul"));
    }
}

function getParentMenu(menu) {
    var pid = menu.parentid;
    if (pid != 0) {
        if (!menus[pid].children) menus[pid].children = {};
        menus[pid].children[menu.id] = menu;
        getParentMenu(menus[pid]);
    }
}

function setStyleForMenu($li) {
    $li.addClass("active");
    var $pli = $li.parent("ul").parent("li");
    if ($pli.length > 0) {
        setStyleForMenu($pli);
    }
}

function addtabs(){
	$('#tabs').addtabs({monitor:'#side-menu'});
}

var toastr = {
        success: function (msg, fn) {
            swal({
                title: msg,
                type: "success"
            }, fn);
        },
        error: function (msg) {
            swal(msg, "", "error");
        },
        info: function (msg) {
            swal(msg);
        }
    };

    var bootbox = {
        confirm: function (msg, fu) {
            swal({
                title: msg,
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定",
                closeOnConfirm: false
            }, function () {
                fu(1);
            });
        }
    };
    
function initmenus() {
        var menus = {};
        menus[1] = {
            id: 1,
            funcname: '益丰-MiniUi-在线事例',
            funccode: 'yijiankang',
            funcaction: '',
            funcicon: 'fa-adjust',
            functype: '0',
            funcseq: '1',
            sortid: '1', parentid: 0
        };

        menus[2] = {
            id: 2,
            funcname: '知识库',
            funccode: 'jichukongjian',
            funcaction: '',
            funcicon: 'fa-gear',
            functype: '0',
            funcseq: '1-2',
            sortid: '1', parentid: 1
        };
        
        menus[201] = {
            id: 201,
            funcname: '组合商品',
            funccode: 'tanchuang',
            funcaction: 'kbs/html/sellGroup.html?token=eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMTU3Mjdicm93c2VyYnJvd3NlciIsImlhdCI6MTQ2MDEwNTM4Miwic3ViIjoiMTE1NzI3IiwiaXNzIjoiMTE1NzI3IiwiZXhwIjoxNDYwMTA3MTgyfQ.JRC2PzMopFvaeRRb5iewd2JWam5xVToA05MxmFdYCHY',
            funcicon: 'fa-sitemap',
            functype: '1',
            funcseq: '1-2-201',
            sortid: '1', parentid: 2
        };
        return menus;
    }