var menus = null;
$(document).ready(
function() {
	$X().conf({
		url : '/openx',
		type : 'app'
	});
	$("input[name=userName]").focus();
	$('#token').val(UrlParameter().token);
	
	$("input[type=password]").keyup(function(event){
		  if(event.keyCode ==13){
			  login();
		  }
		});
});

function getQueryString(name) {  
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
    var r = window.location.search.substr(1).match(reg);  
    if (r != null) {
    	return unescape(r[2]);
    }
    return null;  
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

function afterLogin(userName) {
	localStorage.setItem("userName", userName);
    window.location.href = "/sys/role/roleIndex1.html";
}

function login() {
    var userName = $("input[name=userName]").val().trim();
    var passWord = $("input[name=passWord]").val().trim();

    if (!userName || !passWord) {
        console.log("userName or passWord is null");
        toastr.error("用户名或密码为空！")
        return;
    }

    $X('/login/loginService', 'doLogin').callx({
    	loginUser: {
    		username : userName,
    		password : passWord
    	},
        onResult: function (data) {
        	var json = $.evalJSON(data);
            if (json.code == 0) { //如果登录成功
            	window.location.href = "/index.html?token=" + json.token;
            } else {
            	$("input[name=userName]").focus();
            	toastr.error(json.message);
            }
        },
        onError : function(error) {
        	var json = eval("(" + error + ")");
			window.alert("异常码：" + json.code + "，异常消息：：" + json.message);
        }
    });
}

function logOut() {
	$X('/login/loginService', 'logOut').callx({
        onResult: function (data) {
            if (data == 1) {
            	window.location.href = "/login.html"
            } else {
            	toastr.error(d.message);
            }
        },
        onError : function(error) {
        	// do something
        }
    });
}

function register() {
    var userName = $("input[name=register_userName]").val();
    var passWord = $("input[name=register_passWord]").val();
    var sex = $("input[name=register_sex]").val();
    var email = $("input[name=register_email]").val();
    var age = $("input[name=register_age]").val();

    if (!userName || !passWord || !sex || !email || !age) {
        return;
    }

    var user = {
        "userName": userName,
        "passWord": passWord,
        "sex": sex,
        "email": email,
        "age": age
    };

    $X('/example/UserService', 'create').callx({
        user: user,
        onResult: function (data) {
            if (data) {
            	toastr.success("注册成功!", afterLogin(data.userName));
            } else {
            	toastr.error("注册失败!");
            }
        }
    });
}