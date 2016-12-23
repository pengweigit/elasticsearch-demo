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
	//初始化标签下拉框。。。
	$X('/kbs/infoService', 'getAllLabels').callx({
		onResult : function(data) {
			var json = eval("(" + data + ")");
			$.each(json, function(index,item){
	            $("<option value="+item.id+">"+item.name+"</option>").appendTo("#s_infoLabels");
			});
//			$.each(json, function(index,item){
//	            $("<input name='infoLabels' type='checkbox' value="+item.id+" />"+item.name).appendTo("#myInfoLabels");
//			});     
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	}); 
	
	
	//$(".mf_remove").on("click",'',removeHiddenId);
	
//checkboxHelper = $.fn.check({checkall_name: "checkAll", checkbox_name: "check"});
	var param = {};
	initDatatable(param);
//	initPage();
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
		"bAutoWidth" : false,//自动宽度
		"bInfo" : true,//页脚信息
		"bSort" : false,//排序
		"bLengthChange" : true, //改变每页显示数据数量
		"aLengthMenu" : [ 10,
				25, 50, 100 ],//每页显示行
		"processing" : true,//正在处理显示开关
		"serverSide" : true,//服务器端处理
		"searching" : false,//搜索功能
		"columns" : [
//				{
//					"data" :"id"
//				},
				{
					"data" : "infoLabels"
				},{
					"data" : "infoTitle"
				},{
					"data" : "infoSort"
				},{
					"data" : "favoritesNum"
				},{
					"data" : "readNum"
				},{
					"data" : "creater"
				},{
					"data" : function(source){//"createTime"
						if (source.createTime != "")
							return new Date(source.createTime).format("yyyy-MM-dd hh:mm:ss");
						else
							return "";
					}
				},
				{
					"data" : function(source, type, val) {
						var str = '<div class="action-buttons">';
							str += '<span class="btn btn-xs btn-primary" onclick="editLabel(\'' + source.id + '\')"><i class="ace-icon fa fa-edit bigger-130"></i> 编辑</span>&nbsp;&nbsp;';
  		     				str += '<span class="btn btn-xs btn-primary" onclick="deleteLabel(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 删除</span>&nbsp;&nbsp;';
  		     				str += '<span class="btn btn-xs btn-primary" onclick="previewInfo(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 预览</span>&nbsp;&nbsp;';
  		     				str += '<span class="btn btn-xs btn-primary" onclick="viewGoods(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i>查看商品</span>&nbsp;&nbsp;';
  		     				if (source.isStick==1) {
  		     					str += '<span class="btn btn-xs btn-primary" onclick="unstickInfo(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 取消置顶</span>&nbsp;&nbsp;';
  		     				} else {
  		     					str += '<span class="btn btn-xs btn-primary" onclick="stickInfo(\'' + source.id + '\')"><i class="ace-icon fa fa-list-alt bigger-130"></i> 置顶</span>&nbsp;&nbsp;';
  		     				}
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
			$X('/kbs/infoService', 'findInfoForPaging').callx({
					pageNo : requestStart,
					pageSize : requestLength,
					infoModel : o,
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


/**
 * 重新加载表格数据
 */
var reloadData = function() {
	datatable.ajax.reload();
}

var canelGroupButtion = function() {
	$('#goodGroup').off('hide.bs.modal');
}

var canelAddModalForm = function() {
	$('#add-modal-form').off('hide.bs.modal');
}

var initCheckBox = function() {
	$("#myInfoLabels").html('');
	//初始化标签复选框。。。
	$X('/kbs/infoService', 'getAllLabels').callx({
		async: false,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			$.each(json, function(index,item){
	            $("<label class='checkbox inline font-size'><input id='infoLabels' name='infoLabels' type='checkbox' value="+item.id+" />"+item.name+"</label>").appendTo("#myInfoLabels");
			}); 
		}
	}); 
}
var addInfo = function(){
	 initCheckBox();
	$('#infoContent').summernote({
        height: 200,
        tabsize: 2,
        codemirror: {
          mode: 'text/html',
          htmlMode: true,
          lineNumbers: true,
          theme: 'monokai'
        },
        callbacks: {
		    onImageUpload: function(files) {
		      uploadImages(files);	
		    }
		}
      });
	
	$('#id').val("");
	$('#infoTitle').val('');
	$('#infoImage').val('');
	$("#imgPreview").attr("src", "#");
	$('#infoUrl').val('');
	$('#infoSort').val('');
//	$('#infoContent').val('');
	$('#infoContent').summernote('code', '');
	$('#infoGoods').val('');
	$('#infoGoodsNames').val('');
	
	$('#add-modal-form').modal({'backdrop': 'static'});
	$('#add-modal-form').draggable({
		handle: ".custom-draggable"
	});
	document.getElementById('add').style.display = "";
	document.getElementById('edit').style.display = "none";
}

var bindInsertSellGroup = function() {
	$('#add-modal-form').on('hide.bs.modal', function () {
		var str = '';
		if($.trim($('#infoTitle').val()) == '') {
			str += '标题不能为空。\n';
		}
		if(!MyReg.chinese.test($('#infoTitle').val())) {
			str += '标题只能为汉字。\n';
		}
            
		if($.trim($('#infoImage').val()) == '') {
			str += '图片不能为空。\n';
		}
		var num = 0;
		$('input[type="checkbox"][name="infoLabels"]:checked').each(function() {
    		num ++;
		});
		if(num == 0) {
			str += '必须选择至少一个标签。\n';
		}
		
		if($.trim($('#infoSort').val()) == '') {
			str += '排序不能为空。\n';
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
	var checkedLabels = "";
	$('input[type="checkbox"][name="infoLabels"]:checked').each(function() {
		checkedLabels = checkedLabels+","+$(this).val();
	});
	checkedLabels = checkedLabels.substring(1);
if (id == "") {
	$X('/kbs/infoService', 'createInfo').callx({
		infoModel : {
			id : id,

			infoTitle: $('#infoTitle').val(),
			infoImage: $('#infoImage').val(),
			infoUrl: $('#infoUrl').val(),
			infoLabels: checkedLabels,
			infoSort: $('#infoSort').val(),
//			infoContent: $('#infoContent').val(),
			infoContent: $('#infoContent').summernote('code'),
			infoGoods: $('#infoGoods').val(),
			infoGoodsNames: $('#infoGoodsNames').val()
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
	$X('/kbs/infoService', 'updateInfo').callx({
		infoModel : {
			id : id,
			infoTitle: $('#infoTitle').val(),
			infoImage: $('#infoImage').val(),
			infoUrl: $('#infoUrl').val(),
			infoLabels: checkedLabels,
			infoSort: $('#infoSort').val(),
//			infoContent: $('#infoContent').val(),
			infoContent: $('#infoContent').summernote('code'),
			infoGoods: $('#infoGoods').val(),
			infoGoodsNames: $('#infoGoodsNames').val()
		},
		onResult : function(data) {
			reloadData();
			alert("修改成功！")
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
}
//$('#infoContent').destroy();
}

var cleanAddForm = function() {
	$('#id').val('');
	$('#infoTitle').val('');
	$('#infoImage').val('');
	$('#infoUrl').val('');
	$('#infoSort').val('');
//	$('#infoContent').val('');
	$('#infoContent').summernote('code', '');
	$('#infoGoods').val('');
	$('#infoGoodsNames').val('');
	$('input[type="checkbox"][name="infoLabels"]').each(function() {
    		$(this).attr("checked", false);
    });
}

var deleteLabel = function(id) {
	YFDialog.confirm("确认删除该资讯吗？", function() {
			$X('/kbs/infoService', 'deleteInfo').callx({
				infoId : id,
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
	//initCheckBox();
	$("#myInfoLabels").html('');
	//初始化标签复选框。。。
	$X('/kbs/infoService', 'getAllLabels').callx({
		async: false,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			$.each(json, function(index,item){
	            $("<label class='checkbox inline font-size'><input id='infoLabels' name='infoLabels' type='checkbox' value="+item.id+" />"+item.name+"</label>").appendTo("#myInfoLabels");
			}); 
			$('#infoContent').summernote({
		        height: 200,
		        tabsize: 2,
		        codemirror: {
		          mode: 'text/html',
		          htmlMode: true,
		          lineNumbers: true,
		          theme: 'monokai'
		        },
		        callbacks: {
				    onImageUpload: function(files) {
				      uploadImages(files);	
				    }
				}
		      });
			$('#infoTitle').val("");
			$('#infoImage').val("");
			$("#imgPreview").attr("src", "#");
			$('#infoUrl').val("");
//			$('#infoLabels').val("");
			$('#infoSort').val("");
//			$('#infoContent').text("");
			$('#infoContent').summernote('code', '');
			$('#infoGoods').val("");
//			$('input[type="checkbox"][name="infoLabels"]').each(function() {
//		    		$(this).attr("checked", false);
//		    });
			$('#infoGoodsNames').val("");
			 
			$X('/kbs/infoService', 'selectByInfoId').callx({
				infoId : id,
				onResult : function(data) {
					var json = eval("(" + data + ")");

					$('#infoTitle').val(json.infoTitle);
					$('#infoImage').val(json.infoImage);
					$("#imgPreview").attr("src", json.infoImage+"?"+Math.random());
					$('#infoUrl').val(json.infoUrl);
//					$('#infoLabels').val(json.infoLabels);
					var tmp = json.infoLabels;
					$('#infoSort').val(json.infoSort);
//					$('#infoContent').text(json.infoContent);
					$('#infoContent').summernote('code', json.infoContent);
					$('#infoGoods').val(json.infoGoods);
					$('#id').val(id);
					$('#infoGoodsNames').val(json.infoGoodsNames);
					
					if ( tmp != '') {
						var str= new Array(); 
						if (tmp.indexOf(",") == -1)
							tmp += ",";
						str = tmp.split(",");
						for (i=0;i<str.length ;i++ ) {
						    $('input[type="checkbox"][name="infoLabels"]').each(function() {
						    	if (str[i] == this.value)  
						    		$(this).attr("checked", true);
						    });
						}
					}
					
				    document.getElementById('add').style.display = "none";
				    document.getElementById('edit').style.display = "";
					$('#add-modal-form').modal({'backdrop': 'static'});
					$('#add-modal-form').draggable({
						handle: ".custom-draggable"
					});
				},
				onError : function(xhr,status,error) {
					var json = eval("(" + xhr + ")");
					window.alert("异常码：" + json.code + "，异常消息：" + json.message);
				}
			});
		}
	}); 
	
}

// 资讯内容上传图片
function uploadImages(files){
	var fileNameList = new Array();
	for (var i=0; i<files.length; i++) {
		var timestamp = Date.parse(new Date());
		fileNameList.push(timestamp+files[i].name);
	}
	var fileNames = fileNameList.join(',');
	$X().conf({url: '/openx', type: 'app'});
	$X('/kbs/uploadFileService', 'findFileUploadKeys').callx({
		fileNames: fileNames,
		onResult: function (datalist) {
			for (var i=0; i<datalist.length; i++) {
				var myForm = new FormData();
				myForm.append("OSSAccessKeyId", datalist[i].accessID);
				myForm.append("policy", datalist[i].policy);
				myForm.append("signature", datalist[i].signature);
				myForm.append("key", datalist[i].key);
				myForm.append("expire", datalist[i].expire);
				myForm.append("excel_url", datalist[i].host+"/"+datalist[i].key);
				myForm.append("file", files[i]);
				myForm.append("success_action_status", "200");
				
				var oReq = new XMLHttpRequest();
				var img_url = datalist[i].host + "/" + datalist[i].key;
				var img_name = datalist[i].expire+files[i].name;
				oReq.onreadystatechange = function(e){
		            if(oReq.readyState == 4){
		                if(oReq.status==200){
			                $('#infoContent').summernote('insertImage', img_url, img_name);
		                } else {
		                	window.alert('图片上传失败');
		                }	 
		            }
		        };
				oReq.open("POST", datalist[i].host);
		        oReq.send(myForm);	
			}
		},
		onError: function (error) {
			var obj = JSON.parse(error);
			window.alert(obj.message);
		}
	});
}

var previewInfo = function(id){
	$('#thisDiv').html("");
	$X('/kbs/infoService', 'selectByInfoId').callx({
		infoId : id,
		onResult : function(data) {
			var json = eval("(" + data + ")");
			
			var infoTitle = json.infoTitle;
			infoTitle = (openx.isNull(infoTitle)||openx.isBlank(infoTitle))? '':infoTitle;
			
			var createTime = json.createTime;
			var modifyTime = json.modifyTime;
			
			var updateTime = (openx.isNull(modifyTime)||openx.isBlank(modifyTime))?createTime:modifyTime;
			var infoLastUpdateDate = (openx.isNull(updateTime)||openx.isBlank(updateTime))? '':new Date(updateTime).format('yyyy/MM/dd');
			
			var infoImage = json.infoImage;
			infoImage = (openx.isNull(infoImage)||openx.isBlank(infoImage))? '': infoImage;
			
			var infoContent = json.infoContent;
		    infoContent = (openx.isNull(infoContent)||openx.isBlank(infoContent)) ? '':infoContent;
		    
		    var infoGoodsImgPrefix = json.infoGoodsImgPrefix;
		    infoGoodsImgPrefix = (openx.isNull(infoGoodsImgPrefix)||openx.isBlank(infoGoodsImgPrefix)) ? '':infoGoodsImgPrefix;
		    
		    var infoGoodsCodes = json.infoGoods;
		    var infoGoodsNames = json.infoGoodsNames;
		    
		    var goodsCodes = new Array();
		    var goodsNames = new Array();
		    
		    if (!openx.isNull(infoGoodsCodes) && !openx.isBlank(infoGoodsCodes)) {
		    	var infoGoodsCodesArr = infoGoodsCodes.split(",");
		    	var infoGoodsNamesArr = infoGoodsNames.split(",");
		    	if (infoGoodsCodesArr.length == infoGoodsNamesArr.length) {
		    		for(var i=0; i<infoGoodsCodesArr.length; i++) {
		    			goodsCodes.push(infoGoodsCodesArr[i]);
		    			goodsNames.push(infoGoodsNamesArr[i]);
		    		}
		    	}
		    }
		    
		    //$('#page_name').html(infoTitle);
		    //$('#thisDiv').html(infoContent);
		    // 初始化商品预览信息
		    var appendHtml = "";
		    appendHtml += '<div class="allBox">\
										    <header>\
										        <h2 id="preview_infoTitle" class="information-header-h2">'+infoTitle+'</h2>\
										        <span id="preview_updateDate">益丰健康 '+infoLastUpdateDate+'</span>\
										    </header>\
										    <div class="mainBox">\
										        <div class="pic" id="preview_infoContent">';
			if (!openx.isNull(infoImage) && !openx.isBlank(infoImage)) {
				appendHtml += '<img id="preview_infoImg" src="'+infoImage+'" alt="" class="information_img">';
			}			 				        
            appendHtml += infoContent;
            appendHtml += '</div>';
            
            
		    if (goodsCodes.length > 0) {
		    	appendHtml += '<div class="recommend">\
						                <div id="login_frame">\
					                    <div class="with_line">为您推荐</div>\
					            </div>';
		    	appendHtml += '<ul class="information_ul">';
		    	for (var i=0; i<goodsCodes.length; i++) {
		    		var goodsName = goodsNames[i];
		    		goodsName = goodsName.substring(0,28)+"..."
		    		var goodsImgUrl = '';
		    		if (!openx.isNull(infoGoodsImgPrefix) && !openx.isBlank(infoGoodsImgPrefix)) {
		    			goodsImgUrl += infoGoodsImgPrefix;
			    		if (!infoGoodsImgPrefix.endsWith('/')) {
			    			goodsImgUrl += '/';
			    		}
			    		goodsImgUrl += goodsCodes[i] + '/' + goodsCodes[i] + 'a1.jpg';
		    		}
		    		appendHtml += '<li class="information_li">\
						                    <a href="javaccript:;"><img name="preview_goodsImg" src="'+goodsImgUrl+'" alt="" class="information_img"></a>\
						                    <div>\
						                        <p name="preview_goodsName">'+goodsName+'</p>\
						                    </div>\
						                </li>';
		    	}
		    	appendHtml += '</ul>';
		    	appendHtml += '</div>';
		    }
		    appendHtml += '</div></div>';							            
		    
		    $('#thisDiv').html(appendHtml);
		    $('#create-modal-form_all').modal({'backdrop': 'static'});
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
}

var viewGoods = function(id){
	var url="/kbs/html/viewInfoGoods.html"+location.search.substr(location.search.indexOf("?"))+"&infoId="+id;
    location.href=url;
}

// 取消资讯置顶
var unstickInfo = function(id){
	 $X('/kbs/infoService', 'updateInfoStick').callx({
		infoModel : {
			id : id,
			isStick: 0
		},
		onResult : function(data) {
			reloadData();
			alert("操作成功！")
		},
		onError : function(xhr,status,error) {
			var json = eval("(" + xhr + ")");
			window.alert("异常码：" + json.code + "，异常消息：" + json.message);
		}
	});
}

// 资讯置顶
var stickInfo = function(id){
	alert("stick id:"+id);
	 $X('/kbs/infoService', 'updateInfoStick').callx({
		infoModel : {
			id : id,
			isStick: 1
		},
		onResult : function(data) {
			reloadData();
			alert("操作成功！")
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

var cleanSearchFrom = function() {
	$('#s_infoLabels option[value="-1"]').attr("selected", true);
	$('#s_infoTitle').val('');
	
    $("#s_infoLabels").each(function(){  
        $(this).selectpicker('val',$(this).find('option:first').val());    //重置bootstrap-select显示  
        $(this).find("option").attr("selected", false);                    //重置原生select的值  
        $(this).find("option:first").attr("selected", true);  
    });  
}

var searchInfo = function() {
//	if(datatable != null) {
//		datatable.destroy();
//	}
	
	var searchData = {
			infoTitle : $('#s_infoTitle').val(),
			infoLabels : $('#s_infoLabels').val()
	};
	initDatatable(searchData);
}

/**
 * 商品列表加载
 */
var loadZtGoods = function(o) {
	// 重置搜索条件
	$("#goodsType").val("1");
	$("#goodsName").val("");
	var params = {searchType : "1", goodsName : ""};
	if (goodsDataTable != null) {
		goodsDataTable.destroy();
	}
	goodsDataTable = $('#goodsDataTable').DataTable({
		"bAutoWidth" : false,//自动宽度
		"bInfo" : true,//页脚信息
		"bSort" : false,//排序
		"bLengthChange" : true, //改变每页显示数据数量
		"aLengthMenu" : [ 10, 25, 50, 100 ],//每页显示行
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
					goods : params,
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
	
	$('#goodGroup').on('shown.bs.modal', function () {
		$('.modal-backdrop').each(function(i, n) {
			$(n).remove();
		});
	});
	$('#goodGroup').modal({'backdrop': 'static'});
	
	
	/////////////////////////////////////////
	//需要新增的行数组
	var addRow = new Array();

	var editGoodsCodes = $('#infoGoods').val().split(",");
	var editGoodsNames = $('#infoGoodsNames').val().split(",");
	if ($.trim(editGoodsCodes) != "") {
		//初始化表格对象
		if(groupDataTable == null) {
			groupDataTable = $('#groupDataTable').DataTable({
				"bAutoWidth" : false,//自动宽度
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
			var infoGoods = $('#infoGoods').val();
			if (infoGoods == null || infoGoods == "" || infoGoods.length == 0) {// 新增发布时选择商品
				var groupRows = groupDataTable.row();
				var len = groupRows[0].length;
				for (var ii = len- 1; ii >= 0; ii--) {
					groupDataTable.row(ii).remove().draw();
				 }
				groupDataTable.draw();
			}
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
	loadZtGoodsEx(param);
}

var loadZtGoodsEx = function(o){
	var params = null;
	var goodType = $('#goodsType').val();
	var goodsName = $('#goodsName').val();
	if(goodsDataTable != null) {
		goodsDataTable.destroy();
		params = {searchType : goodType, goodsName : ''};
	} else {
		params = {searchType : goodType, goodsName : goodsName};
	}
	
	goodsDataTable = $('#goodsDataTable').DataTable({
		"bAutoWidth" : false,//自动宽度
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
					goods : params,
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
	
	$('#goodGroup').on('shown.bs.modal', function () {
		$('.modal-backdrop').each(function(i, n) {
			$(n).remove();
		});
	});
	$('#goodGroup').modal({'backdrop': 'static'});
	
	
	/////////////////////////////////////////
	//需要新增的行数组
	var addRow = new Array();

	var editGoodsCodes = $('#infoGoods').val().split(",");
	var editGoodsNames = $('#infoGoodsNames').val().split(",");
	//if ($.trim(editGoodsCodes) != "") {
		//初始化表格对象
		if(groupDataTable == null) {
			groupDataTable = $('#groupDataTable').DataTable({
				"bAutoWidth" : false,//自动宽度
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
				//groupDataTable.clear();
			}		
		/*$.each(editGoodsCodes, function(key, value) {
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
		}*/
	/*} else {
		if (groupDataTable != null) {//删除之前页面上选择过的商品列表
			var infoGoods = $('#infoGoods').val();
			if (infoGoods == null || infoGoods == "" || infoGoods.length == 0) {// 新增发布时选择商品
				var groupRows = groupDataTable.row();
				var len = groupRows[0].length;
				for (var ii = len- 1; ii >= 0; ii--) {
					groupDataTable.row(ii).remove().draw();
				 }
				groupDataTable.draw();
			}
		}
	}*/
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
				"bAutoWidth" : false,//自动宽度
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
		var rows = $('#groupDataTable').find('tbody>tr[role=row]');
		if (!groupDataTable || groupDataTable == null || rows.length < 1) { 
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
		$('#infoGoods').val(groupGoodsCodes.substring(0, groupGoodsCodes.length-1));
		$('#infoGoodsNames').val(groupGoodsNames.substring(0, groupGoodsNames.length-1));
	} else {
		$('#groupGoodsInfo').val('');
		$('#selectGroupGoods').text('选择商品组合');
	}
	groupDataTable.clear();
}

var canelGroupButtion = function() {
	$('#goodGroup').off('hide.bs.modal');
}

// 导入商品(excel)
function importGoods(){
	// 选择文件
	$('#excelDialog').modal('toggle');
	$('#accessIDExcel').val('');
	$('#policyExcel').val('');
	$('#expireExcel').val('');
	$('#keyExcel').val('');
	$('#signatureExcel').val('');
	$('#fileExcel').val('');
}

function getExcelFileName(){
	var arr = $('#fileExcel').val().split('\\');
	var timestamp = Date.parse(new Date());
	var fileName = timestamp+arr[arr.length - 1];//这就是要取得的文件名称
	
	if (fileName == '' || fileName == 'undefind') {
		window.alert("请选择导入的Excel文件！");
		return;
	}else if (fileName.split(".")[1].toUpperCase()  == "XLS" || fileName.split(".")[1].toUpperCase() == "XLSX"){
		findExcelFileKey(fileName);
	}else {
		window.alert("仅限上传Excel文件！");
		return;
	}

}

// 上传商品
function uploadGoodsExcel(){
	var form = $("#ossformExcel");
	var url= $('#ossformExcel').attr("action");
	var uploadUrl = url+"/"+$('#keyExcel').val();
	var arr = $('#fileExcel').val().split('\\');
	var fileName = arr[arr.length - 1];//这就是要取得的文件名称 
		
	if(fileName == '' || fileName == 'undefind'){
		window.alert("请选择需要上传的文件！");
		return;
	}
	$('#excelDialog').modal('hide');
    YFDialog.loading('商品正在导入中，请耐心等待......',"../../staticSource/img");   
    var options  = {    
       url:url,    
       type:'post',    
       success:function(data1)    
       {    
        $X().conf({url: '/openx', type: 'app'});
        $X('/kbs/infoService', 'uploadInfoGoods').callx({
        	uploadUrl: uploadUrl,
        	fileName: fileName,
            onResult: function (responseData) {
            	var json = JSON.parse(responseData);
            	YFDialog.close();
            	alert(json.errmsg);
                if(json.errcode==0){
                    var goodsList = json.data;
                    var goodsCodeList = new Array();
                    var goodsNameList = new Array();
                    for (var i=0; i<goodsList.length; i++) {
                    	goodsCodeList.push(goodsList[i].goodsCode);
                    	goodsNameList.push(goodsList[i].goodsName);
                    }
                    if (!openx.isNull(goodsCodeList) && !openx.isBlank(goodsCodeList)) {
                		$('#infoGoods').val(goodsCodeList.join(","));
                		$('#infoGoodsNames').val(goodsNameList.join(","));
                    } else {
                		$('#infoGoods').val('');
                		$('#infoGoodsNames').val('');
                	}
                }
            },
            onError: function (error) {
            	YFDialog.close();
            	var obj = JSON.parse(error);
    			window.alert(obj.message);
            }
        },60*1000);  
       }    
    };    
    form.ajaxSubmit(options);
}

function findExcelFileKey(fileName){
	$X().conf({url: '/openx', type: 'app'});
	$X('/kbs/uploadFileService', 'findFileUploadKey').callx({
		fileName: fileName,
		onResult: function (data) {
			$('#ossformExcel').attr("action", data.host)
			$('#accessIDExcel').val(data.accessID);
			$('#policyExcel').val(data.policy);
			$('#signatureExcel').val(data.signature);
			$('#keyExcel').val(data.key);
			$('#expireExcel').val(data.expire);
			$('#excel_urlExcel').val(data.host + "/" + data.key);
		},
		onError: function (error) {
			var obj = JSON.parse(error);
			window.alert(obj.message);
		}
	});
}

/**
 * 下载批量导入资讯商品模板
 */
function downloadInfoGoodsTemplate(){
	location.href = "http://yf-example.oss-cn-shenzhen.aliyuncs.com/kbs/KBS资讯商品导入模板.xls";
}

//------------------------------------------------------------------------------------------------图片上传---------------------------------------------------------------------------


//打开文件上传form
function openFileForm() {
	$('#file_form').modal('toggle');
	$('#accessID').val('');
	$('#policy').val('');
	$('#expire').val('');
	$('#key').val('');
	$('#signature').val('');
	$('#file').val('');
}

//获取文件名
function getFileName() {
	var arr = $('#file').val().split('\\');
	var timestamp = Date.parse(new Date());
	var fileName = timestamp+arr[arr.length - 1];//这就是要取得的文件名称

	if (fileName == '' || fileName == 'undefind') {
		window.alert("请选择需要上传的图片文件！");
		return;
	}else if (fileName.split(".")[1].toUpperCase()  == "JPG" || fileName.split(".")[1].toUpperCase() == "JPEG" || fileName.split(".")[1].toUpperCase() == "GIF"){
		findFileKey(fileName);
	}else {
		window.alert("仅限上传JPG或GIF格式的图片！");
		return;
	}

}


//获取文件上传前置数据
function findFileKey(fileName) {
	$X().conf({url: '/openx', type: 'app'});
	$X('/kbs/uploadFileService', 'findFileUploadKey').callx({
		fileName: fileName,
		onResult: function (data) {
			// window.alert("操作成功！");
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
		window.alert("请选择需要上传的图片文件！");
		return;
	}

	var options = {
		url: url,
		type: 'post',
		success: function (data) {
			$('#fileUrl').val(url + "/" + $('#keyName').val());
			$("#infoImage").val(uploadUrl);
			setTimeout($("#imgPreview").attr("src", uploadUrl+"?"+Math.random()), 1000);
		}
	};
	form.ajaxSubmit(options);

	
//	$X().conf({url: '/openx', type: 'app'});
//	$X('/kbs/sellGroupService', 'parsingExcelInfo').callx({
//		uploadUrl: uploadUrl,
//		fileName: fileName,
//		onResult: function (data) {
//			var json = eval("(" + data + ")");
//			var param = {};//-------------add by david.tao--------
//			initDatatable(param);
//			$('#file_form').modal('hide');
//			datatable.ajax.reload();
//			var message = json.errmsg;
//			if (message.length >= 17) {
//				alert("<font size='2.5'>" + message + "</font>");
//			} else {
//				alert(message);
//			}
//		},
//		onError: function (error) {
//			var obj = JSON.parse(error);
//			window.alert(obj.message);
//		}
//	},60*1000);
}