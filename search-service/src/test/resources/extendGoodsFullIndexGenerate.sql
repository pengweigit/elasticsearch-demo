-- 扩展商品搜索接口索引临时表建立脚本 
DROP TABLE IF EXISTS zz_goods_ex;			
CREATE TABLE zz_goods_ex(
SELECT bg.goods_code,bg.recommend_index,bg.channel_code,00000.00 AS sortValue 
 FROM pt_business_goods bg 
 LEFT JOIN pt_business_goods_category bgc ON bgc.goods_code=bg.goods_code and bgc.channel_code=bg.channel_code 
 WHERE bg.channel_goods_status=1 and bg.del_flag=0 
 GROUP BY bg.goods_code, bg.channel_code
);

CREATE UNIQUE INDEX i_PK_goodsCode ON zz_goods_ex(goods_code(20),channel_code(40));

ALTER TABLE `zz_goods_ex` ADD COLUMN `trade_mark` varchar(5) CHARACTER SET utf8 DEFAULT NULL COMMENT '商标';
ALTER TABLE `zz_goods_ex` ADD COLUMN `goods_name` varchar(40) CHARACTER SET utf8 COMMENT '商品名称';
ALTER TABLE `zz_goods_ex` ADD COLUMN `common_name` varchar(50) CHARACTER SET utf8 COMMENT '通用名称';
ALTER TABLE `zz_goods_ex` ADD COLUMN `main_barcode` varchar(20) CHARACTER SET utf8 COMMENT '主条形码';
ALTER TABLE `zz_goods_ex` ADD COLUMN `mnemonics` varchar(80) CHARACTER SET utf8 COMMENT '助记码';
ALTER TABLE `zz_goods_ex` ADD COLUMN `modify_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间';
ALTER TABLE `zz_goods_ex` ADD COLUMN `manufacturer_name` varchar(40) CHARACTER SET utf8 COMMENT '生产厂家名称';
ALTER TABLE `zz_goods_ex` ADD COLUMN `goods_base_desc` text CHARACTER SET utf8 COMMENT '商品说明';
ALTER TABLE `zz_goods_ex` ADD COLUMN `is_prescription`  tinyint(1) NULL DEFAULT 0 COMMENT '是否为处方药(1 是 0 否)';
ALTER TABLE `zz_goods_ex` ADD COLUMN `category_code` text CHARACTER SET utf8 COMMENT '商品类目编码';

-- 类目编码
DROP TABLE IF EXISTS zz_goods_categorycode_ex;
create table zz_goods_categorycode_ex as select t1.goods_code, t1.channel_code, t2.category_code from  zz_goods_ex t1 inner join (select goods_code,group_concat(category_code order by category_code separator ',') as category_code from pt_business_goods_category group by goods_code) t2 on t1.goods_code=t2.goods_code;
update zz_goods_ex t1 inner join zz_goods_categorycode_ex t2 on t1.goods_code=t2.goods_code and t1.channel_code=t2.channel_code set t1.category_code=t2.category_code;

-- 商品基础信息
UPDATE zz_goods_ex t1 
 LEFT JOIN zt_goods_group gg on gg.goods_code=t1.goods_code 
 LEFT JOIN zt_goods_manufacturer gm ON gm.manufacturer_code=gg.manufacturer_code 
 set t1.trade_mark=gg.trademark,t1.goods_name=gg.goods_name,t1.common_name=gg.common_name, 
t1.main_barcode=gg.main_barcode,t1.manufacturer_name=gm.manufacturer_name,t1.mnemonics=gg.mnemonics,t1.modify_time=gg.modify_time;

-- 商品扩展属性
update zz_goods_ex t1 
 inner join zt_goods_expand ge on ge.goods_code=t1.goods_code 
 set t1.goods_base_desc=ge.durg_attending;

-- 商品排序
DROP TABLE IF EXISTS zz_goods_sort_ex;
create table zz_goods_sort_ex as select  t1.goods_code, t1.sales_volume, t1.gross_profit, t1.total_gross_profit, (t1.sales_volume*1.0 / t2.sum_sales_volume ) * t2.sortCount as calcValue1, (t1.gross_profit*1.0 / t2.sum_gross_profit ) * t2.sortCount as calcValue2, (t1.total_gross_profit*1.0 / t2.sum_total_gross_profit ) * t2.sortCount as calcValue3 from zt_goods_profit t1 left join (select SUM(sales_volume) as sum_sales_volume, SUM(gross_profit) as sum_gross_profit, SUM(total_gross_profit) as sum_total_gross_profit, count(*) as sortCount from zt_goods_profit) t2 on 1 = 1;
update zz_goods_ex t1 inner join zz_goods_sort_ex t3 on t1.goods_code = t3.goods_code set t1.sortValue = (t3.calcValue1*0.7 + t3.calcValue2*0.5 + t3.calcValue3*0.3);

-- 是否处方药
DROP TABLE IF EXISTS zz_goods_prescription_ex;
create table zz_goods_prescription_ex as 
select t1.goods_code, 
case when t2.prescription_kind='1' then 1 
 when t2.prescription_kind='2' then 1 
 when t2.prescription_kind='3' then 1 
 else 0 
 end as is_prescription  
 from  zz_goods_ex t1 
 left join zt_goods_group t2 on t1.goods_code=t2.goods_code;
update zz_goods_ex t1 inner join zz_goods_prescription_ex t2 on t1.goods_code=t2.goods_code set t1.is_prescription=t2.is_prescription;









