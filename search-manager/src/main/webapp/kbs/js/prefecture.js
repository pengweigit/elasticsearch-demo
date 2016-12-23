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
	$('#diseaseName').autocomplete({
		source : function(request, response) {
			$X('/kbs/prefectureService', 'selectDiseaseList').callx({
				value : request.term,
				onResult : function(data) {
					$(".ui-autocomplete").css("max-height","260px");
					$(".ui-autocomplete").css("overflow-y","auto");
					$(".ui-autocomplete").css("overflow-x","hidden");
					var dsease = [];
					console.log("data---------->"+data);
					var json = eval("(" + data + ")");
					console.log(json);
					$(json).each(function(i, n) {
						var d = {
							value : n.diseaseid,
							label : n.diseasename
						};
						dsease.push(d);
					});
					response(dsease);
				},
				minLength: 10,
				onError : function(xhr,status,error) {
					var json = eval("(" + xhr + ")");
					window.alert("异常码：" + json.code + "，异常消息：：" + json.message);
				}
			});
		},
		focus : function(event, ui) {
			//$("#diseaseNames").val($("#diseaseNames").val() + "," +ui.item.label);
			//$("#diseaseIds").val($("#diseaseIds").val() + "," +ui.item.value);
			return false;
		},
		select : function(event, ui) {
			for (var obj in diseaseMap) {
				if (ui.item.label == obj) {
					$("span[class='ui-helper-hidden-accessible']").text("");
					$("input#diseaseName.form-control.ui-autocomplete-input").text("");
					alert('重复选择了疾病！');
					$("#diseaseName").val("");
					return false;
				}
			}
			$("#diseaseName").val("");
			if ($.trim($(".mf_item").val()) == "") {
				$("#diseaseNames").val(ui.item.label);
				$("#diseaseIds").val(ui.item.value);
				//console.log("diseaseNames为空时 - label="+ui.item.label+" value=" + ui.item.value);
			} else {
				$("#diseaseNames").val($("#diseaseNames").val() +ui.item.label);
				$("#diseaseIds").val($("#diseaseIds").val() + "," +ui.item.value);
				//console.log("diseaseNames有值时  - label="+ui.item.label+" value=" + ui.item.value);
				//console.log($("#diseaseIds").val);
		    }
			
			diseaseMap[ui.item.label]=ui.item.value;
			$("#diseaseNames").removeAttr("disabled"); //防止用户直接在那里输入
			$("#diseaseNames").focus();
			$("#diseaseName").focus();
			$("#diseaseNames").attr("disabled", "disabled");//防止用户直接在那里输入
			
			//写入疾病ID
			//$('.mf_list input[value="'+ui.item.label+'"]').attr("data-diseaseId",ui.item.value);
			
			return false;
		}
	});
/*	$('#prefectureName').click(function(){
		alert($(".mf_item").text() + "__" + $("#diseaseIds").val());
	});*/
	/*$('#goodGroup').on('hide.bs.modal', function (o, t) {
		if($('#groupDataTable input[type=checkbox]').size() > 0 && $('#groupDataTable input[type=checkbox]:checked').size() == 0) {
			alert('请选择一个主商品');
			return false;
		}
		return true;
	});*/

	/*$('#add-modal-form').on('hide.bs.modal', function () {
		var str = '';
		if($('#diseaseName').val() == '') {
			str += '疾病名不能为空。';
		}
		if($('#groupSellName').val() == '') {
			str += '组合名不能为空。';
		}
		if($('#sellLanguage').val() == '') {
			str += '一句话销售不能为空。';
		}
		if($('#groupGoodsInfo').val() == '') {
			str += '商品组合不能为空。';
		}
		if(str.length > 0) {
			alert(str);
			return false;
		}
		return true;
	});*/
});

/*function removeHiddenId(){
	String.prototype.endWith=function(s){
		  if(s==null||s==""||this.length==0||s.length>this.length)
		     return false;
		  if(this.substring(this.length-s.length)==s)
		     return true;
		  else
		     return false;
		  return true;
		 }
	
	var diseaseId=$(this).next().attr("data-diseaseId");
	var diseaseIds= $('#diseaseIds').val();
	
	if(diseaseIds){
		var diseaseArr=diseaseIds.split(',');
		if(diseaseArr){
			var diseaseIdString="";
			$.each(diseaseArr,function(index,item){
				if(item!=diseaseId){
					diseaseIdString+=item;
					diseaseIdString+=',';
				}
			});
			if(diseaseIdString.endWith(','))diseaseIdString.subString(0,diseaseIdString.length-1);
			$('#diseaseIds').val(diseaseIdString);
		}
		
	}	
	
}*/

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
					"data" : function(
							source) {
						return '<label class="position-relative"><input type="checkbox" class="ace" name="id" value="' + source.id + '"/><span class="lbl"></span></label>';
					},
					"sClass" : "center"
				},
				{
					"data" : "prefectureName"
				},
				{
					"data" : "prefectureDescript"
				},{
					"data" : function(s) {
						if(s.diseaseNames == null) {
							return "";
						} else {
							return s.diseaseNames;
						}
					}
				},{
					"data" : function(s) {
						if(s.goodsCodes == null) {
							return "";
						} else {
							return s.goodsCodes;
						}
					}
				},
				{
					"data" : function(s) {
						var r = "";
						if(s.onlineStatus == 1) {
							r += "<span s='" + s.onlineStatus + "'>已上线</span>";
						} else if(s.onlineStatus == 0){
							r += "<span s='"  + s.onlineStatus + "'>已下线</span>"; 
						}
						return r;
					}
				},
				{
					"data" : function(source, type, val) {
						var str = '<div class="action-buttons">';
						if(source.onlineStatus == 1) {
							str	+= '<span class="btn btn-xs btn-primary" onclick="updateOnlineStaus(0, \'' + 
								source.id
							+ '\', this)"><i class="ace-icon fa fa-arrow-down bigger-130"></i> 下线</span>&nbsp;&nbsp;';
						} else if(source.onlineStatus == 0) {
							str += '<span class="btn btn-xs btn-primary" onclick="updateOnlineStaus(1, \'' +
								source.id
							+ '\', this)"><i class="ace-icon fa fa-arrow-up bigger-130"></i> 上线</span>&nbsp;&nbsp;';
							str += '<span class="btn btn-xs btn-primary" onclick="editPrefecture(\'' + source.id + '\')"><i class="ace-icon fa fa-edit bigger-130"></i> 编辑</span>&nbsp;&nbsp;';
						}
/*						str += '<span class="btn btn-xs btn-primary" onclick="showDetail(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 详情</span>&nbsp;&nbsp;';*/
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
			$X('/kbs/prefectureService', 'findForPaging').callx({
					pageNo : requestStart,
					pageSize : requestLength,
					prefecture : o,
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

var initSearchForm = function() {
	$('#searchStartDate').datetimepicker({
		/*format : {
			toDisplay : function(date, format, language) {
				var d = new Date(date);
				return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
			}, 
			toValue : function(date, format, language) {
				var d = new Date(date);
				return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
			}
		}*/
		dateFormat : 'yy-mm-dd',
		autoclose: true,
        todayBtn: true
	});
	$('#searchEndDate').datetimepicker({
		dateFormat : 'yy-mm-dd',
		autoclose: true,
        todayBtn: true
	});
}

var searchPrefecture = function() {
	if(datatable != null) {
		datatable.destroy();
	}
	
	var searchData = {
			diseaseNames : $('#searchDiseaseName').val(),
			prefectureName : $('#searchPrefectureName').val(),
			goodsCodes : $('#searchGoodsCode').val(),
			onlineStatus : $('#searchOnlineStatus').val()
	};
	initDatatable(searchData);
}

/**
 * 更新上线状态
 */
var updateOnlineStaus = function(status, id, btn) {
	var ids = new Array(); //主键ID数组
	var names = new Array(); //名称数组
	if(id) { //如果是单个更新
		ids[0] = id;
		names = $(btn).parent().parent().parent().children()[1].innerHTML;
	} else { //批量更新
		$('#datatable input[name=id]:checked').each(function (i, n) {
			ids[i] = n.value;
			names[i] = $(n).parent().parent().parent().children()[1].innerHTML;
		});
	}
	var cc = "上线";
	if(status == 0) {
		cc = "下线";
	}
	if(ids.length > 0) {
		YFDialog.confirm("确定要" + cc + "：" + names.toString() + "?", function() {
			$X('/kbs/prefectureService', 'updatePrefectureOnlineStaus').callx({
				ids : ids,
				onlineStatus : status,
				onResult : function(data) {
					reloadData();
					window.alert(names + "操作成功！");
				},
				onError : function(xhr,status,error) {
					var json = eval("(" + xhr + ")");
					window.alert("异常码：" + json.code + "，异常消息：" + json.message);
				}
			});
		}, 
		function() {
			
	});
	} else {
		alert('请选择要' + cc + '的记录!');
	}
}

/**
 * 重新加载表格数据
 */
var reloadData = function() {
	datatable.ajax.reload();
	console.log('刷新');
}

/**
 * 商品列表加载
 */
var loadZtGoods = function(o) {
	if(goodsDataTable == null) {
		goodsDataTable = $('#goodsDataTable').DataTable({
			"bAutoWidth" : true,//自动宽度
			"bInfo" : true,//页脚信息
			"bSort" : false,//排序
			"bLengthChange" : true, //改变每页显示数据数量
			"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
			"processing" : true,//正在处理显示开关
			"serverSide" : true,//服务器端处理
			"searching" : false,//搜索功能
			"columns" : [
					{
						"data" : function(
								source) {
							return '<label class="position-relative"><input type="checkbox" class="ace" name="id" value="' + source.goodsCode + '"/><span class="lbl"></span></label>';
						},
						"sClass" : "center"
					},
					{
						"data" : "goodsName"
					},{
						"data" : "goodsCode"
					},
					{
						"data" : "mainBarcode"
					},
					{
						"data" : "commonName"
					},
					{
						"data" : "measureUnit"
					}],
			"oLanguage" : {
				"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"
			},
			sAjaxDataProp : "data",//指定当从服务端获取数据时，数据项使用的名称
			"ajax" : function(request, drawCallback, settings) {
				var requestStart = request.start;
				var requestLength = request.length;
				$X('/kbs/ztGoddsService', 'findForPaging').callx({
						pageNo : requestStart,
						pageSize : requestLength,
						goods : o,
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
			}
		});
	} else {
		goodsDataTable.ajax.reload();
	}
	$('#goodGroup').on('shown.bs.modal', function () {
		$('.modal-backdrop').each(function(i, n) {
			$(n).remove();
		});
	});
	$('#goodGroup').modal({'backdrop': 'static'});
	
	
	/////////////////////////////////////////
	//需要新增的行数组
	var addRow = new Array();

	var editGoodsCodes = $('#goodsCodes').val().split(",");
	var editGoodsNames = $('#goodsNames').val().split(",");
	if ($.trim(editGoodsCodes) != "") {
		//初始化表格对象
		if(groupDataTable == null) {
			groupDataTable = $('#groupDataTable').DataTable({
				"bAutoWidth" : true,//自动宽度
				"paging" : false, //禁止表格分页
				"bInfo" : false,//页脚信息
				"bSort" : false,//排序
				"bLengthChange" : false, //改变每页显示数据数量
				"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
				"processing" : false,//正在处理显示开关
				"serverSide" : false,//服务器端处理
				"searching" : false,//搜索功能
				"info" : false,
				"columns" : [{
								"data" : function(source) {
									return '<input type="hidden" name="goodsCode" value="' + source.goodsCode + '">';
								},
								"visible": false
							},{
								"data" : "goodsName"
							},{
							"data" : function(source, type, val) {
								var str = '<div class="action-buttons">';
									str	+= '<span class="btn btn-xs btn-primary" onclick="removeGroupTabelRow(' + source.goodsCode + ');"><i class="ace-icon fa fa-search bigger-130"></i> 移除</span>&nbsp;&nbsp;';
									str += '</div>';
								return str;
							}
						}],
				"language" : {
					"infoEmpty": "请在添加商品",
					"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"					
				}
			});
		} else {
			groupDataTable.clear();
		}		
		$.each(editGoodsCodes, function(key, value) {
			var d = {
					goodsCode : value,
					goodsName : editGoodsNames[key]
				};
			addRow.push(d);
		});
		//循环新增表格的行
		for (var j = 0; j < addRow.length; j++) {
			var rowData = {
					goodsCode : addRow[j].goodsCode,
					goodsName : addRow[j].goodsName
			};
			groupDataTable.row.add(rowData).draw();
		}
	} else {
		if (groupDataTable != null) {//删除之前页面上选择过的商品列表
			var groupRows = groupDataTable.row();
			var len = groupRows[0].length;
			for (var ii = len- 1; ii >= 0; ii--) {
				groupDataTable.row(ii).remove().draw();
			 }
			groupDataTable.draw();
		}
	}
}

/**
 * 商品搜索按钮事件
 */
var goodSearchBtn = function() {
	var goodType = $('#goodsType').val();
	var goodsName = $('#goodsName').val();
	var param = {searchType : goodType, goodsName : goodsName};
	if(goodsDataTable != null) {
		goodsDataTable.destroy();
		goodsDataTable = null;
	}
	loadZtGoods(param);
}

/**
 * 从左边商品列表移动到右边的组合列表 按钮事件处理
 */
var moveGoods2Groups = function() {
	var checkedRows = $('#goodsDataTable input[name=id]:checked');
	if(checkedRows.size() > 0) {
		//初始化表格对象
		if(groupDataTable == null) {
			groupDataTable = $('#groupDataTable').DataTable({
				"bAutoWidth" : true,//自动宽度
				"paging" : false, //禁止表格分页
				"bInfo" : false,//页脚信息
				"bSort" : false,//排序
				"bLengthChange" : false, //改变每页显示数据数量
				"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
				"processing" : false,//正在处理显示开关
				"serverSide" : false,//服务器端处理
				"searching" : false,//搜索功能
				"info" : false,
				"columns" : [{
								"data" : function(source) {
									return '<input type="hidden" name="goodsCode" value="' + source.goodsCode + '">';
								},
								"visible": false
							},{
								"data" : "goodsName"
							},{
							"data" : function(source, type, val) {
								var str = '<div class="action-buttons">';
									str	+= '<span class="btn btn-xs btn-primary" onclick="removeGroupTabelRow(' + source.goodsCode + ');"><i class="ace-icon fa fa-search bigger-130"></i> 移除</span>&nbsp;&nbsp;';
									str += '</div>';
								return str;
							}
						}],
				"language" : {
					"infoEmpty": "请在添加商品",
					"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"					
				}
			});
		}
		//需要新增的行数组
		var addRow = new Array();
		//已经新增的列
		var groupRows = groupDataTable.row();
		//列的编号
		var len = groupRows[0].length;
		checkedRows.each(function(i, n) {
			//先判断是否已经增加
			var isAdd = false;
			for (var i = 0; i < len; i++) {
				var gc = groupDataTable.row(i).data().goodsCode;
				if(gc == n.value) { //如果存在相同的code，则认为已经新增
					isAdd = true;
				}
			}
			if(!isAdd) { //如果没有新增，则新增到行的数组里
				var goodsName = $(n).parent().parent().parent().children()[1].innerHTML;
				var d = {
					goodsCode : n.value,
					goodsName : goodsName
				};
				addRow.push(d);
			}
		});
		//循环新增表格的行
		for (var j = 0; j < addRow.length; j++) {
			var rowData = {
					goodsCode : addRow[j].goodsCode,
					goodsName : addRow[j].goodsName
			};
			groupDataTable.row.add(rowData).draw();
		}
	}
}

/**
 * 删除商品组合中的信息
 */
var removeGroupTabelRow = function(goodsCode) {
	var groupRows = groupDataTable.row();
	//列的编号
	var len = groupRows[0].length;
	for (var i = 0; i < len; i++) {
		var gc = groupDataTable.row(i).data().goodsCode;
		if(gc == goodsCode) { //如果存在相同的code，则认为是需要删除的行
			groupDataTable.row(i).remove().draw(false);
		}
	}
} 

/**
 * 删除更新商品组合中的信息
 */
var updateRemoveGroupTabelRow = function(goodsCode) {
	var groupRows = updateGoodsDataTable.row();
	//列的编号
	var len = groupRows[0].length;
	for (var i = 0; i < len; i++) {
		var gc = updateGoodsDataTable.row(i).data().goodsCode;
		if(gc == goodsCode) { //如果存在相同的code，则认为是需要删除的行
			deleteIds.push(updateGoodsDataTable.row(i).data().id);
			updateGoodsDataTable.row(i).remove().draw(false);
		}
	}
} 

/**
 * 主商品的checkbox互斥
 */
var checkMasterGoods = function(checkbox) {
	var flag = $(checkbox).attr('flag');
	$('#groupDataTable input[type=checkbox]').each(function(i, n) {
		if($(n).attr('flag') != flag) {
			n.checked = false;
		}
	});
}

/**
 * 更新界面主商品的checkbox互斥
 */
var updateCheckMasterGoods = function(checkbox) {
	var flag = $(checkbox).attr('flag');
	$('#updateGroupDataTable input[type=checkbox]').each(function(i, n) {
		if($(n).attr('flag') != flag) {
			n.checked = false;
		}
	});
}

var bindOkGroupOkButtion = function() {
	$('#goodGroup').on('hide.bs.modal', function (o, t) {
/*		if($('#groupDataTable input[type=checkbox]').size() > 0 && $('#groupDataTable input[type=checkbox]:checked').size() == 0) {
			alert('请选择一个主商品');
			return false;
		}
		var isSubmit = true;
		$('#groupDataTable input[name="count"]').each(function(i, n) {
			if(n.value < 1) {
				isSubmit = false;
			}
		});
		if(!isSubmit) {
			alert("商品数量不能少于1");
			return false;
		}*/
//		console.log(groupDataTable.row());
		if (!groupDataTable || groupDataTable == null || groupDataTable.row().length < 1) { 
			alert("请选择商品！");
			return false;
		}
		groupOkButtion();
		return true;
	});
}

/**
 * 确定按钮处理
 */
var groupOkButtion = function() {
	//先拿到表格里所有的数据
	var groupGoodsNames = "";
	var groupGoodsCodes = "";
	var groupRows = groupDataTable.row();
	//列的编号
	var len = groupRows[0].length;
	var groupDataArray = new Array();
	if(len > 0) {
		for (var i = 0; i < len; i++) {
			var gn = groupDataTable.row(i).data().goodsName;
			groupGoodsNames += gn + ",";
			var gc = groupDataTable.row(i).data().goodsCode;
			groupGoodsCodes += gc + ",";
			var node = groupDataTable.row(i).node();
			var isMasterGoods = 2;
/*			if($(node).find('input[name=isMasterGoods]:checked').size() > 0) {
				isMasterGoods = 1;
			}
			var count = $(node).find('input[name=count]').val();
			if(count <= 0) {
				alert(groupDataTable.row(i).data().goodsName + "所需数量必须大于0");
				return false;
			}*/
			var groupRowData = {
				goodsCode : groupDataTable.row(i).data().goodsCode,
				goodsName : groupDataTable.row(i).data().goodsName,
/*				commonName : groupDataTable.row(i).data().commonName,
				count : count,
				isMasterGoods : isMasterGoods,*/
				orderNumber : i+1,
				mainBarcode : groupDataTable.row(i).data().mainBarcode
			};
			groupDataArray.push(groupRowData);
		}

		$('#groupGoodsInfo').val($.toJSON(groupDataArray));
		$('#selectGroupGoods').text(groupGoodsNames.substring(0, 40));
		$('#goodsCodes').val(groupGoodsCodes.substring(0, groupGoodsCodes.length-1));
		$('#goodsNames').val(groupGoodsNames.substring(0, groupGoodsNames.length-1));
	} else {
		$('#groupGoodsInfo').val('');
		$('#selectGroupGoods').text('选择商品组合');
	}
}

var canelGroupButtion = function() {
	$('#goodGroup').off('hide.bs.modal');
}

var canelAddModalForm = function() {
	$('#add-modal-form').off('hide.bs.modal');
}

var addPrefecture = function(){
	$("#mf_diseaseNames_list").text("");
	$('#mf_diseaseNames_list').val("");
	$('#prefectureName').val("");
	$('#prefectureDescript').val("");
	$('#goodsCodes').val("");
	$('#id').val("");
	$('#add-modal-form').modal({'backdrop': 'static'});
	 document.getElementById('add').style.display = "";
	 document.getElementById('edit').style.display = "none";
//新增时
	$("div[class='mf_container'] ol").on("click","li a",  function(e){//为动态生成的元素绑定事件
//		alert($(this).parents("li").children("input").val());
//		console.log($(this).parents("li").children("input").val());
		delete diseaseMap[$(this).parents("li").children("input").val()];
	});
	$("#diseaseName").attr("style", "width:30%;float:right;");//调整部局
	$("#diseaseNames").attr("disabled", "disabled");//防止用户直接在那里输入
	diseaseMap={};//清空缓存
}

var bindInsertSellGroup = function() {
	var abc='' ;
	$("#mf_diseaseNames_list input[name='diseaseNames_values[]'").each(function(i,j){
		var a = $(j).val();
			if(a!=null){
				abc += a;
			}
		});

	$('#add-modal-form').on('hide.bs.modal', function () {
		var str = '';
		if(abc == '') {
			str += '疾病名不能为空。';
		}
		if($('#prefectureName').val() == '') {
			str += '专区名称不能为空。';
		}
		if($('#prefectureDescript').val() == '') {
			str += '专区说明不能为空。';
		}
		if($('#goodsCodes').val() == '') {
			str += '请选择商品。';
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
	String.prototype.endWith=function(s){
  if(s==null||s==""||this.length==0||s.length>this.length)
     return false;
  if(this.substring(this.length-s.length)==s)
     return true;
  else
     return false;
  return true;
 }

 String.prototype.startWith=function(s){
  if(s==null||s==""||this.length==0||s.length>this.length)
   return false;
  if(this.substr(0,s.length)==s)
     return true;
  else
     return false;
  return true;
 }

	var id = $('#id').val();
	var abc='' ;
	var diseaseIds='';
	$("#mf_diseaseNames_list input[name='diseaseNames_values[]'").each(function(index,item){
		var name = $(item).val();
		if(name){
			abc += name+',';
			
			diseaseIds+=diseaseMap[name]+',';
		}
	});
	if(diseaseIds&&diseaseIds.endWith(','))diseaseIds=diseaseIds.substring(0,diseaseIds.length-1);
	if(abc&&abc.endWith(','))abc=abc.substring(0,abc.length-1);
	
	
	
	$X('/kbs/prefectureService', 'create').callx({
		prefecture : {
			id : id,
			diseaseNames : abc,
			diseaseIds : diseaseIds,
			prefectureName : $('#prefectureName').val(),
			prefectureDescript : $('#prefectureDescript').val(),
			goodsCodes : $('#goodsCodes').val(),
			goodsNames : $('#goodsNames').val(),
			diseaseId : $('#diseaseId').val()
		},
/*		goodsGroups : eval("(" + $('#groupGoodsInfo').val() + ")"),*/
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
}

var cleanAddForm = function() {
	$('#diseaseName').val('');
	$('#groupSellName').val('');
	$('#sellLanguage').val('');
	$('#diseaseId').val('');
	$('#groupGoodsInfo').val('');
	$('#selectGroupGoods').text('选择商品组合');
	if(groupDataTable != null) {
		groupDataTable.clear().draw();
	}
}

var cleanSearchFrom = function() {
	$('#searchPrefectureName').val('');
	$('#searchDiseaseName').val('');
	$('#searchOnlineStatus option[value=""]').attr("selected", true);
	$('#searchGoodsCode').val('');
	
    $("#searchOnlineStatus").each(function(){  
        $(this).selectpicker('val',$(this).find('option:first').val());    //重置bootstrap-select显示  
        $(this).find("option").attr("selected", false);                    //重置原生select的值  
        $(this).find("option:first").attr("selected", true);  
    });  
}

var deletePrefecture = function() {
	var ids = new Array(); //主键ID数组
	var names = new Array(); //名称数组
	var isOnlineStat = false;
	var alertOnlineStr = "";
	 //批量删除
	$('#datatable input[name=id]:checked').each(function (i, n) {
		ids[i] = n.value;
		names[i] = $(n).parent().parent().parent().children()[1].innerHTML;
		if($($(n).parent().parent().parent().children()[5].innerHTML).attr("s") == '1') {
			alertOnlineStr += names[i] + ",";
			isOnlineStat = true;
		}
	});
	if(ids.length == 0) {
		alert("请选择要删除的专区");
		return ;
	}
	if(isOnlineStat) {
		alert(alertOnlineStr + "请先下线后再删除")
		return ;
	}
	YFDialog.confirm("确定要删除" + names.toString() + "?", function() {
			$X('/kbs/prefectureService', 'deletePrefecture').callx({
				ids : ids,
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
	/*if(confirm("确定要删除" + names.toString() + "?")) {
		$X('/kbs/sellGroupService', 'deleteSellGroup').callx({
			ids : ids,
			onResult : function(data) {
				reloadData();
				alert("删除成功！")
			},
			onError : function(xhr,status,error) {
				var json = eval("(" + xhr + ")");
				window.alert("异常码：" + json.code + "，异常消息：" + json.message);
			}
		});
	}*/
}

var editPrefecture = function(id){
	$("#mf_diseaseNames_list").text("");
	$('#prefectureName').val("");
	$('#prefectureDescript').val("");
	$('#goodsCodes').val("");
	$('#goodsNames').val("");
	$('#id').val("");
	$('#diseaseIds').val("");
	$X('/kbs/prefectureService', 'selectById').callx({
		id : id,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			
			var arr = [];
			arr = (json.diseaseNames).split(",")
//			for（var i=0;i<arr.length;i++){
			if(arr&&arr.length>0)
			$.each(arr,function(index,item){
				if(index==0){
			        html='<li class="mf_item" role="option" aria-selected="false">'+item+'<a href="#" class="mf_remove" title="Remove">X</a><input type="hidden" class="mf_value" name="diseaseNames_values[]" value='+item+'></li>';
			        $("#mf_diseaseNames_list").append(html);
				}else{
			        html='<li class="mf_item" role="option" aria-selected="false">'+item+'<a href="#" class="mf_remove" title="Remove">X</a><input type="hidden" class="mf_value" name="diseaseNames_values[]" value='+item+'></li>';
			        $("#mf_diseaseNames_list").append(html);	
				}
			});
			
			if(json.diseaseIds&&json.diseaseNames){
				var diseaseIdArr=json.diseaseIds.split(',');			
				var diseaseNameArr=json.diseaseNames.split(',');
				$.each(diseaseIdArr,function(index,item){
					diseaseMap[diseaseNameArr[index]]=diseaseIdArr[index];
				});			
			}
				
			$('#prefectureName').val(json.prefectureName);
			$('#prefectureDescript').val(json.prefectureDescript);
			$('#goodsCodes').val(json.goodsCodes);
			$('#goodsNames').val(json.goodsNames);
			$('#diseaseIds').val(json.diseaseIds);
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
//修改时
	$("div[class='mf_container'] ol").on("click","li a",  function(e){//为动态生成的元素绑定事件
//		alert($(this).parents("li").children("input").val());
//		console.log($(this).parents("li").children("input").val());
		delete diseaseMap[$(this).parents("li").children("input").val()];
	});
	$("#diseaseName").attr("style", "width:30%;float:right;");//调整部局
	$("#diseaseNames").attr("disabled", "disabled");//防止用户直接在那里输入
}


var updateSellGroup = function(sellGroupId) {
	deleteIds = new Array()
	if(updateGoodsDataTable != null){
		updateGoodsDataTable.destroy();
	} 
	updateGoodsDataTable = $('#updateGroupDataTable').DataTable({
			"bAutoWidth" : true,//自动宽度
			"bInfo" : false,//页脚信息
			"bSort" : false,//排序
			"paging" : false,
			"bLengthChange" : false, //改变每页显示数据数量
			"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
			"processing" : true,//正在处理显示开关
			"serverSide" : false,//服务器端处理
			"searching" : false,//搜索功能
			"columns" : [{
						"data" : "id",
						"visible": false
					},{
						"data" : "commonName",
						"visible": false
					},
					{
						"data" : "goodsName"
					},{
						"data" : "goodsCode"
					},
					{
						"data" : "mainBarcode"
					},
					{
						"data" : function(source) {
							return '<input name="count" style="width:40px;" value="' + source.count + '">';
						}
					},{
						"data" : function(source) {
							if(source.isMasterGoods == 1) {
								return '<label class="position-relative"><input type="checkbox" onclick="updateCheckMasterGoods(this);" flag="' + source.goodsCode + '" class="ace" name="isMasterGoods" value="' + source.goodsCode + '" checked="checked"/><span class="lbl"></span></label>';
							} else {
								return '<label class="position-relative"><input type="checkbox" onclick="updateCheckMasterGoods(this);" flag="' + source.goodsCode + '" class="ace" name="isMasterGoods" value="' + source.goodsCode + '"/><span class="lbl"></span></label>';
							}
						}
					},
					{
						"data" : function(source, type, val) {
							var str = '<div class="action-buttons">';
								str	+= '<span class="btn btn-xs btn-primary" onclick="updateRemoveGroupTabelRow(' + source.goodsCode + ');"><i class="ace-icon fa fa-search bigger-130"></i> 删除</span>&nbsp;&nbsp;';
								str += '</div>';
							return str;
						}
					}],
			"oLanguage" : {
				"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"
			},
			sAjaxDataProp : "data",//指定当从服务端获取数据时，数据项使用的名称
			"ajax" : function(request, drawCallback, settings) {
				$X('/kbs/sellGroupService', 'selectGoosGroupBySellGroupId').callx({
						groupSellId : sellGroupId,
						onResult : function(data) {
							var json = eval("(" + data + ")");
							var obj = {
								"data" : json
							}
							// 重绘回调
							drawCallback(obj);
						},
						onError : function(xhr,status,error) {
							var json = eval("(" + xhr + ")");
							window.alert("异常码：" + json.code + "，异常消息：" + json.message);
						}
				});
			}
		});
	/*else {
		//重新加载一次数据
		$X('/kbs/sellGroupService', 'selectGoosGroupBySellGroupId').callx({
			groupSellId : sellGroupId,
			onResult : function(data) {
				var json = eval("(" + data + ")");
				var obj = {
					"data" : json
				}
				// 重绘回调
				drawCallback(obj);
			},
			onError : function(xhr,status,error) {
				var errCode = xhr.responseText
						.split(":")[xhr.responseText
						.split(":").length - 1];
				console.log(errCode);
				window.alert(errCode);
			}
	});
	}*/
	
	$X('/kbs/sellGroupService', 'selectById').callx({
		id : sellGroupId,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			console.log(json);
			$('#updateDiseaseName').val(json.diseaseName);
			$('#updateGroupSellName').val(json.groupSellName);
			$('#updateSellLanguage').val(json.sellLanguage);
			$('#updateSellGroupId').val(json.id);
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
	$('#update-modal-form').on('shown.bs.modal', function () {
		$('.modal-backdrop').each(function(i, n) {
			$(n).remove();
		});
	});
	$('#update-modal-form').modal({'backdrop': 'static'});
}

/*
 * 更新选择商品页面
 */
var selectUpdatGoods = function(o) {
	$('#updateGoodsList').modal({'backdrop': 'static'});
	if(updateSelectGoodDataTable == null) {
		updateSelectGoodDataTable = $('#updateGoodsDataTable').DataTable({
			"bAutoWidth" : true,//自动宽度
			"bInfo" : true,//页脚信息
			"bSort" : false,//排序
			"bLengthChange" : true, //改变每页显示数据数量
			"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
			"processing" : true,//正在处理显示开关
			"serverSide" : true,//服务器端处理
			"searching" : false,//搜索功能
			"columns" : [
					{
						"data" : function(
								source) {
							return '<label class="position-relative"><input type="checkbox" class="ace" name="id" value="' + source.goodsCode + '"/><span class="lbl"></span></label>';
						},
						"sClass" : "center"
					},
					{
						"data" : "goodsName"
					},{
						"data" : "goodsCode"
					},
					{
						"data" : "mainBarcode"
					},
					{
						"data" : "commonName"
					},
					{
						"data" : "measureUnit"
					}],
			"oLanguage" : {
				"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"
			},
			sAjaxDataProp : "data",//指定当从服务端获取数据时，数据项使用的名称
			"ajax" : function(request, drawCallback, settings) {
				var requestStart = request.start;
				var requestLength = request.length;
				$X('/kbs/ztGoddsService', 'findForPaging').callx({
						pageNo : requestStart,
						pageSize : requestLength,
						goods : o,
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
			}
		});
	}
}

/**
 * 商品更新查询按钮处理
 */
var updateGoodsListSearch = function() {
	var goodType = $('#updateGoodsType').val();
	var goodsName = $('#updateGoodsName').val();
	var param = {searchType : goodType, goodsName : goodsName};
	if(updateSelectGoodDataTable != null) {
		updateSelectGoodDataTable.destroy();
		updateSelectGoodDataTable = null;
	}
	selectUpdatGoods(param);
}

/**
 * 更新操作的新增
 */
var addUpdateGoods = function() {
	var checkedRows = $('#updateGoodsDataTable input[name=id]:checked');
	//需要新增的行数组
	var addRow = new Array();
	//已经新增的列
	var groupRows = updateGoodsDataTable.row();
	//列的编号
	var len = groupRows[0].length;
	checkedRows.each(function(i, n) {
		//先判断是否已经增加
		var isAdd = false;
		for (var i = 0; i < len; i++) {
			var gc = updateGoodsDataTable.row(i).data().goodsCode;
			if(gc == n.value) { //如果存在相同的code，则认为已经新增
				isAdd = true;
			}
		}
		if(!isAdd) { //如果没有新增，则新增到行的数组里
			var goodsName = $(n).parent().parent().parent().children()[1].innerHTML;
			var d = {
				goodsCode : n.value,
				goodsName : goodsName,
			};
			addRow.push(d);
		}
	});
	//循环新增表格的行
	for (var j = 0; j < addRow.length; j++) {
		var rowData = {
				id : '',
				goodsName : addRow[j].goodsName,
				goodsCode : addRow[j].goodsCode,
				count : 1
		};
		updateGoodsDataTable.row.add(rowData).draw();
	}
}

var canelUpdateSellGroup = function() {
	$('#update-modal-form').off('hide.bs.modal');
}

var bindUpdateSellGroupButton = function() {
	$('#update-modal-form').on('hide.bs.modal', function(e) {
		if($('#updateGroupDataTable input[type=checkbox]').size() > 0 && $('#updateGroupDataTable input[type=checkbox]:checked').size() == 0) {
			alert('请选择一个主商品');
			return false;
		}
		var isSubmit = true;
		$('#updateGroupDataTable input[name="count"]').each(function(i, n) {
			if(n.value < 1) {
				isSubmit = false;
			}
		});
		if(!isSubmit) {
			alert("商品数量不能少于1");
			return false;
		}
		updateSellGroupButton();
		return true;
	});
}

/**
 * 更新的确定按钮处理
 */
var updateSellGroupButton = function() {
	var groupRows = updateGoodsDataTable.row();
	//列的编号
	var len = groupRows[0].length;
	var groupDataArray = new Array();
	if(len > 0) {
		for (var i = 0; i < len; i++) {
			var gn = updateGoodsDataTable.row(i).data().goodsName;
			var node = updateGoodsDataTable.row(i).node();
			var isMasterGoods = 2;
			if($(node).find('input[name=isMasterGoods]:checked').size() > 0) {
				isMasterGoods = 1;
			}
			var count = $(node).find('input[name=count]').val();
			if(count <= 0) {
				alert(updateGoodsDataTable.row(i).data().goodsName + "所需数量必须大于0");
				return false;
			}
			var groupRowData = {
				goodsCode : updateGoodsDataTable.row(i).data().goodsCode,
				goodsName : updateGoodsDataTable.row(i).data().goodsName,
				id : updateGoodsDataTable.row(i).data().id,
				count : count,
				isMasterGoods : isMasterGoods,
				orderNumber : i+1,
				mainBarcode : updateGoodsDataTable.row(i).data().mainBarcode
			};
			groupDataArray.push(groupRowData);
		}
	}
	$X('/kbs/sellGroupService', 'updateSellGroup').callx({
		sellGroup : {
			id : $('#updateSellGroupId').val(),
			diseaseName : $('#updateDiseaseName').val(),
			groupSellName : $('#updateGroupSellName').val(),
			sellLanguage : $('#updateSellLanguage').val()
		},
		goodsGroups : $.toJSON(groupDataArray),
		deleteIds : deleteIds,
		onResult : function(data) {
			reloadData();
			alert("修改成功！")
			canelUpdateSellGroup();
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

var urlHandler = function() {
	var links = document.getElementsByTagName("link");
	for (var i = 0; i < links.length; i++) {
		var l = links[i].href;
		var repStr = "http://";
		if(l.indexOf("https://") != -1) {
			repStr = "https://";
		}
		var surl = l.replace(repStr, '');
		var url = surl.substring(surl.indexOf('/')).substring(1);
		url = url.substring(url.indexOf('/'));
		url = getRootPath() + url;
		links[i].href = url;
	}
	var scripts = document.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		if(scripts[i].src != '') {
			var l = scripts[i].src;
			var repStr = "http://";
			if(l.indexOf("https://") != -1) {
				repStr = "https://";
			}
			var surl = l.replace(repStr, '');
			var url = surl.substring(surl.indexOf('/')).substring(1);
			url = url.substring(url.indexOf('/'));
			url = getRootPath() + url;
			scripts[i].src = url;
		}
	}
}

var showDetail = function(id) {

	if(detailGroupDataTable != null){
		detailGroupDataTable.destroy();
	} 
	detailGroupDataTable = $('#detailGroupDataTable').DataTable({
			"bAutoWidth" : true,//自动宽度
			"bInfo" : false,//页脚信息
			"bSort" : false,//排序
			"paging" : false,
			"bLengthChange" : false, //改变每页显示数据数量
			"aLengthMenu" : [ 10, 5, 50, 100 ],//每页显示行
			"processing" : true,//正在处理显示开关
			"serverSide" : false,//服务器端处理
			"searching" : false,//搜索功能
			"columns" : [
					{
						"data" : "goodsName",
					},{
						"data" : "goodsCode",
					},
					{
						"data" : "mainBarcode"
					},
					{
						"data" : function(source) {
							return source.count;
						}
					},{
						"data" : function(source) {
							if(source.isMasterGoods == 1) {
								return '<label class="position-relative"><input type="checkbox" onclick="updateCheckMasterGoods(this);" flag="' + source.goodsCode + '" class="ace" name="isMasterGoods" value="' + source.goodsCode + '" checked="checked"/><span class="lbl"></span></label>';
							} else {
								return '<label class="position-relative"><input type="checkbox" onclick="updateCheckMasterGoods(this);" flag="' + source.goodsCode + '" class="ace" name="isMasterGoods" value="' + source.goodsCode + '"/><span class="lbl"></span></label>';
							}
						}
					}],
			"oLanguage" : {
				"sUrl" : "../../staticSource/js/plugins/dataTables/jquery.dataTables.lang.zh-CN.txt"
			},
			sAjaxDataProp : "data",//指定当从服务端获取数据时，数据项使用的名称
			"ajax" : function(request, drawCallback, settings) {
				$X('/kbs/prefectureService', 'selectById').callx({
					    id:id,
						onResult : function(data) {
							var json = eval("(" + data + ")");
							var obj = {
								"data" : json
							}
							// 重绘回调
							drawCallback(obj);
						},
						onError : function(xhr,status,error) {
							var json = eval("(" + xhr + ")");
							window.alert("异常码：" + json.code + "，异常消息：" + json.message);
						}
				});
			}
		});
	
	$X('/kbs/sellGroupService', 'selectById').callx({
		id : id,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			console.log(json);
			$('#detailDiseaseName').val(json.diseaseName);
			$('#detailGroupSellName').val(json.groupSellName);
			$('#detailSellLanguage').val(json.sellLanguage);
			$('#detailStatus').val(json.onlineStatus == '1' ? '已上线' : '已下线');
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
	$('#detail-modal-form').modal({'backdrop': 'static'});
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


//------------------------------------------------------------------------------------------------Excel文件上传导入---------------------------------------------------------------------------


//打开文件上传form
function openFileForm() {
	$('#file_form').modal('toggle');
	$('#accessID').val('');
	$('#policy').val('');
	$('#expire').val('');
	$('#key').val('');
	$('#signature').val('');
}

//获取文件名
function getFileName() {
	var arr = $('#file').val().split('\\');
	var timestamp = Date.parse(new Date());
	var fileName = timestamp+arr[arr.length - 1];//这就是要取得的文件名称

	if (fileName == '' || fileName == 'undefind') {
		window.alert("请选择需要上传的文件！");
		return;
	}else if (fileName.split(".")[1] != "xls"){
		window.alert("请上传.xls格式的Excel文件（2003版）！");
		return;
	}
	else {
		findFileKey(fileName);
	}

}


//获取文件上传前置数据
function findFileKey(fileName) {
	$X().conf({url: '/openx', type: 'app'});
	$X('/kbs/uploadFileService', 'findFileUploadKey').callx({
		fileName: fileName,
		onResult: function (data) {
			// window.alert("操作成功！");
			//console.log(data);
			$('#ossform').attr("action", data.host)
			$('#accessID').val(data.accessID);
			$('#policy').val(data.policy);
			$('#signature').val(data.signature);
			$('#key').val(data.key);
			$('#expire').val(data.expire);
			$('#excel_url').val(data.host + "/" + data.key);
		},
		onError: function (error) {
			var obj = JSON.parse(error);
			window.alert(obj.message);
		}
	});
}

//提交上传
function updateinfo() {
	var form = $("form[name=ossform]");
	var url = $('#ossform').attr("action");
	var uploadUrl = url + "/" + $('#key').val();

	var arr = $('#file').val().split('\\');
	var fileName = arr[arr.length - 1];//这就是要取得的文件名称

	if (fileName == '' || fileName == 'undefind') {
		window.alert("请选择需要上传的文件！");
		return;
	}

	var options = {
		url: url,
		type: 'post',
		success: function (data) {
			$('#fileUrl').val(url + "/" + $('#keyName').val());
		}
	};
	form.ajaxSubmit(options);

	$X().conf({url: '/openx', type: 'app'});
	$X('/kbs/sellGroupService', 'parsingExcelInfo').callx({
		uploadUrl: uploadUrl,
		fileName: fileName,
		onResult: function (data) {
			console.log(data);
			var json = eval("(" + data + ")");
			var param = {};//-------------add by david.tao--------
			initDatatable(param);
			$('#file_form').modal('hide');
			datatable.ajax.reload();
			var message = json.errmsg;
			if (message.length >= 17) {
				alert("<font size='2.5'>" + message + "</font>");
			} else {
				alert(message);
			}
//			if (json.errcode == 0) {
//				alert(json.errmsg);
//			} else {
//				alert(json.errmsg);
//			}
		},
		onError: function (error) {
			var obj = JSON.parse(error);
			window.alert(obj.message);
		}
	},60*1000);
}

var downloadExcel=function(){
	location.href = "http://yf-example.oss-cn-shenzhen.aliyuncs.com/kbs/KBS商品组合导入模板.xls";
}