var datatable;
var checkboxHelper;
var goodsDataTable = null;
var groupDataTable = null;
var updateGoodsDataTable = null;
var currentSellGroupEditId = null;
var updateSelectGoodDataTable = null;
var deleteIds = null;
var detailGroupDataTable = null;
var diseaseMap={};

$(document).ready(
function() {
	$X().conf({
		url : '/openx',
		type : 'app'
	});
	openx.head('auth_token', UrlParameter().token);
	
	//$(".mf_remove").on("click",'',removeHiddenId);
	
//checkboxHelper = $.fn.check({checkall_name: "checkAll", checkbox_name: "check"});
	var param = {};
	initDatatable(param);
	initPage();
	//initSearchForm();
	//urlHandler();
	var projects = [{
	                  value: "jquery",
	                  label: "jQuery",
	                  desc: "the write less, do more, JavaScript library",
	                  icon: "jquery_32x32.png"
	                },
	                {
	                  value: "jquery-ui",
	                  label: "jQuery UI",
	                  desc: "the official user interface library for jQuery",
	                  icon: "jqueryui_32x32.png"
	                },
	                {
	                  value: "sizzlejs",
	                  label: "Sizzle JS",
	                  desc: "a pure-JavaScript CSS selector engine",
	                  icon: "sizzlejs_32x32.png"
	                }];
});

var initDatatable = function(o) {
	datatable = $('#datatable').DataTable({
		"destroy": true,//-------------------------------add by david.tao--------------------https://datatables.net/manual/tech-notes/3
		"bAutoWidth" : true,//自动宽度
		"bInfo" : true,//页脚信息
		"bSort" : false,//排序
		"bLengthChange" : true, //改变每页显示数据数量
		"aLengthMenu" : [ 10,
				25, 50, 100 ],//每页显示行
		"processing" : true,//正在处理显示开关
		"serverSide" : true,//服务器端处理
		"searching" : false,//搜索功能
		"columns" : [
				{
					"data": null,"targets": 0
				},
				{
					"data" : "infoLabel"
				},
				{
					"data" : "labelSort"
				},{
					"data" : "creater"
				},{
					"data" : function(source){//"createTime"
						return new Date(source.createTime).format("yyyy-MM-dd hh:mm:ss");
					}
				},
				{
					"data" : function(source, type, val) {
						var str = '<div class="action-buttons">';
							str += '<span class="btn btn-xs btn-primary" onclick="editLabel(\'' + source.id + '\')"><i class="ace-icon fa fa-edit bigger-130"></i> 编辑</span>&nbsp;&nbsp;';
  		     				str += '<span class="btn btn-xs btn-primary" onclick="deleteLabel(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 删除</span>&nbsp;&nbsp;';
						str += '</div>';
						return str;
					}
				} ],
		"oLanguage" : {
			"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"
		},
		sAjaxDataProp : "data",//指定当从服务端获取数据时，数据项使用的名称
		"ajax" : function(request, drawCallback, settings) {
			var requestStart = request.start;
			var requestLength = request.length;
			$X('/kbs/infoService', 'findInfoLabelForPaging').callx({
					pageNo : requestStart,
					pageSize : requestLength,
					infoLabelModel : o,
					onResult : function(data) {
						var json = eval("(" + data + ")");
						var obj = {
							"data" : json.result, // The data to display on this page
							"iTotalRecords" : json.totalCount, // Number of records in the data set, not accounting for filtering
							"iTotalDisplayRecords" : json.totalCount
						}
						// 重绘回调
						drawCallback(obj);
					},
					onError : function(xhr,status,error) {
						var json = eval("(" + xhr + ")");
						window.alert("异常码：" + json.code + "，异常消息：" + json.message);
					}
			});
		},
		"fnDrawCallback": function(){
			var api = this.api();
			var startIndex= api.context[0]._iDisplayStart;//获取到本页开始的条数
			api.column(0).nodes().each(function(cell, i) {
				cell.innerHTML = startIndex + i + 1;
			}); 
			}
	});
}

var initPage = function() {
	//getRole(_id);
	$('#validation-form').validate({
		errorElement : 'div',
		errorClass : 'help-block',
		focusInvalid : false,
		rules: {
			diseaseName : {
				required : true
			},
			groupSellName: {
				required : true,
				maxlength : 50
			}
		},
		messages: {
			diseaseName: {
				required : "请选择疾病名称"
			},
			groupSellName : {
				required : "请填组合名称",
				maxlength : "组合名称不能多余50个字符"
			}
		},
		highlight: function (e) {
			$(e).closest('.form-group').removeClass('has-info').addClass('has-error');
		},
		success: function (e) {
			$(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
			$(e).remove();
		},
		errorPlacement: function (error, element) {
			element.closest("div.form-group").append(error);
		}
	});
}


/**
 * 重新加载表格数据
 */
var reloadData = function() {
	datatable.ajax.reload();
	console.log('刷新');
}

var canelGroupButtion = function() {
	$('#goodGroup').off('hide.bs.modal');
}

var canelAddModalForm = function() {
	$('#add-modal-form').off('hide.bs.modal');
}

var addLabel = function(){
	$('#id').val("");
	$('#infoLabel').val("");
	$('#labelSort').val("");
	$('#add-modal-form').modal({'backdrop': 'static'});
	 document.getElementById('add').style.display = "";
	 document.getElementById('edit').style.display = "none";
}

var bindInsertSellGroup = function() {
	$('#add-modal-form').on('hide.bs.modal', function () {
		var str = '';
		if($('#infoLabel').val() == '') {
			str += '分类标签不能为空。';
		}
		if(!MyReg.chinese.test($('#infoLabel').val())) {
			str += '分类标签只能为汉字。\n';
		}
		
		if($('#labelSort').val() == '') {
			str += '排序不能为空。';
		}
		if(str.length > 0) {
			alert(str);
			$('#add-modal-form').off('hide.bs.modal');
			return false;
		}
		insertSellGroup(this);
		return true;
	});
}

var insertSellGroup = function(m) {
	var id = $('#id').val();
if (id == "") {
	$X('/kbs/infoService', 'createInfoLabel').callx({
		infoLabelModel : {
			id : id,
			infoLabel : $('#infoLabel').val(),
			labelSort : $('#labelSort').val()
		},
		onResult : function(data) {
			var json = eval("(" + data + ")");
			if(json.errcode==0){			
				reloadData();
				alert("保存成功！")
				cleanAddForm();
				canelAddModalForm();
			}else{
				alert(json.errmsg)
			}
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
} else {
	$X('/kbs/infoService', 'updateInfolabel').callx({
		infoLabelModel : {
			id : id,
			infoLabel : $('#infoLabel').val(),
			labelSort : $('#labelSort').val()
		},
		onResult : function(data) {
			var json = eval("(" + data + ")");
			if(json.errcode==0){			
				reloadData();
				alert("修改成功！")
				cleanAddForm();
				canelAddModalForm();
			}else{
				alert(json.errmsg)
			}
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
}
}

var cleanAddForm = function() {
	$('#id').val('');
	$('#infoLabel').val('');
	$('#labelSort').val('');
}

var deleteLabel = function(id) {
	YFDialog.confirm("确认删除该标签及该标签下所有资讯吗？", function() {
			$X('/kbs/infoService', 'deleteInfoLabel').callx({
				labelId : id,
				onResult : function(data) {
					reloadData();
					alert("删除成功！")
				},
				onError : function(xhr,status,error) {
					var json = eval("(" + xhr + ")");
					window.alert("异常码：" + json.code + "，异常消息：" + json.message);
				}
			});
		}, 
		function() {
			
	});
}

var editLabel = function(id){
	$('#infoLabel').val("");
	$('#labelSort').val("");
	$X('/kbs/infoService', 'selectByLabelId').callx({
		labelId : id,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			
			$('#infoLabel').val(json.infoLabel);
			$('#labelSort').val(json.labelSort);
			$('#id').val(id);
		    document.getElementById('add').style.display = "none";
		    document.getElementById('edit').style.display = "";
			$('#add-modal-form').modal({'backdrop': 'static'});
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
}

var checkDatatableAll = function(tbid, c) {
	if(c.checked) {
		$('#' + tbid + ' input[type=checkbox]').each(function(i, n) {
			n.checked = true;
		});
	} else {
		$('#' + tbid + ' input[type=checkbox]').each(function(i, n) {
			n.checked = false;
		});
	}
} 

var getRootPath = function() {  
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp  
    var curWwwPath = window.document.location.href;  
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp  
    var pathName = window.document.location.pathname;  
    var pos = curWwwPath.indexOf(pathName);  
    //获取主机地址，如： http://localhost:8083  
    var localhostPaht = curWwwPath.substring(0,pos);  
    //获取带"/"的项目名，如：/uimcardprj  
    var projectName = pathName.substring(0,pathName.substr(1).indexOf('/')+1);  
    return(localhostPaht + projectName);  
}
