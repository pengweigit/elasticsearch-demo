var datatable = null;
$(function() {
	// 禁用enter事件
	document.onkeydown = function (event) {
        if (event && event.keyCode == 13) {
            return false;
        }
    }
	
	$X().conf({
		url : '/openx',
		type : 'app'
	});
	openx.head('auth_token', UrlParameter().token);
	initPage();
	loadGoodsTable();
});


/**
 * 新增商品弹窗关闭
 */
function addGoodsClose(){
	$('#add-modal-form').off('hide.bs.modal');
}

/**
 * 新增商品弹窗
 */
function addInfoGoods(){
	$('#goodsCode').val('');
	$('#add-modal-form').modal({'backdrop': 'static'});
}

/**
 * 新增商品提交
 */
function addGoodsSubmit(){
	var goodsCode = $("#goodsCode").val();
	var id = $("#infoId").val();
	if ( openx.isBlank(goodsCode) || openx.isNull(goodsCode)) {
	    alert('商品编码不能为空!');	
	    return;
	}
	$X('/kbs/infoService', 'addGoodsByInfoId').callx({
		goodsCode: goodsCode,
		id: id,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			if(json.errcode==0){			
				loadGoodsTable();
				alert("添加成功！")
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

/**
 * 删除资讯关联商品
 * 
 * @param goodsCode
 * @param infoId
 */
function deleteGoodsCode(goodsCode, infoId){
	YFDialog.confirm("确认删除该商品吗？", function() {
		$X('/kbs/infoService', 'removeGoodsByInfoId').callx({
			goodsCode: goodsCode,
			id: infoId,
			onResult : function(data) {
				var json = eval("(" + data + ")");
				if(json.errcode==0){			
					loadGoodsTable();
					alert("删除成功！")
				}else{
					alert(json.errmsg)
				}
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

/**
 * 初始化页面
 */
function initPage(){
	var infoId = UrlParameter().infoId;
	$("#infoId").val(infoId);
	$X('/kbs/infoService', 'findInfoById').callx({
		id: infoId,
		onResult : function(data) {
			var obj = eval("(" + data + ")");
			$("#infoLabels").html(obj.infoLabels);
			$("#infoTitle").html(obj.infoTitle);
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	}); 
}


/**
 * 加载资讯关联商品列表
 * @param id 资讯ID
 */
function loadGoodsTable(){
	var _infoId = UrlParameter().infoId;
	if (datatable == null) {
		datatable = $('#datatable').DataTable({
			"destroy": true,//-------------------------------add by david.tao--------------------https://datatables.net/manual/tech-notes/3
			"bAutoWidth" : true,//自动宽度
			"bInfo" : true,//页脚信息
			"bSort" : false,//排序
			"bLengthChange" : true, //改变每页显示数据数量
			"aLengthMenu" : [ 10,25, 50, 100 ],//每页显示行
			"processing" : true,//正在处理显示开关
			"serverSide" : true,//服务器端处理
			"searching" : false,//搜索功能
			"columns" : [
					{
						"data" : "goodsCode"
					},{
						"data" : "goodsName"
					},{
						"data" : function(record, type, val) {
							var str = '<div class="action-buttons">';
								str += '<span class="btn btn-xs btn-primary" onclick="deleteGoodsCode(\'' + record.goodsCode + '\', \''+_infoId+'\')"><i class="ace-icon fa fa-edit bigger-130"></i> 删除</span>&nbsp;&nbsp;';
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
				var _infoId = UrlParameter().infoId;
				$X('/kbs/infoService', 'findInfoGoodsByPaging').callx({
						pageNo : requestStart,
						pageSize : requestLength,
						infoId : _infoId,
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
		datatable.ajax.reload();
	}
	
}

/**
 * 返回上级菜单
 */
function returnBack(){
	var url="/kbs/html/information.html"+location.search.substr(location.search.indexOf("?"));
    location.href=url;
}
