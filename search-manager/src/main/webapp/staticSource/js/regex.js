/**
 * 正则表达式js
 */
var MyReg = {
	phone : /^(((13[0-9]{1})|(14[57]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
	postCode:/^\d{6}$/,
	password:/^[A-Za-z0-9_]{6,20}$/,
	chinese: /^[\u4e00-\u9fa5]+$/
}