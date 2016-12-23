DROP TABLE IF EXISTS zz_goods;
CREATE TABLE zz_goods(
     SELECT gg.goods_code,gg.goods_name,gg.common_name,gg.main_barcode,gm.manufacturer_name,gg.mnemonics,gg.modify_time,00000.00 AS sortValue 
     FROM zt_goods_group gg 
     LEFT JOIN zt_goods_manufacturer gm 
     ON gg.manufacturer_code=gm.manufacturer_code  
     WHERE gg.del_flag='0' 
) ;
CREATE UNIQUE INDEX i_PK_goodsCode ON zz_goods(goods_code(20));
DROP TABLE IF EXISTS zz_goods_sort;
create table zz_goods_sort as select  t1.goods_code, t1.sales_volume, t1.gross_profit, t1.total_gross_profit, (t1.sales_volume*1.0 / t2.sum_sales_volume ) * t2.sortCount as calcValue1, (t1.gross_profit*1.0 / t2.sum_gross_profit ) * t2.sortCount as calcValue2, (t1.total_gross_profit*1.0 / t2.sum_total_gross_profit ) * t2.sortCount as calcValue3 from zt_goods_profit t1 left join (select SUM(sales_volume) as sum_sales_volume, SUM(gross_profit) as sum_gross_profit, SUM(total_gross_profit) as sum_total_gross_profit, count(*) as sortCount from zt_goods_profit) t2 on 1 = 1;
update zz_goods t1 inner join zz_goods_sort t3 on t1.goods_code = t3.goods_code set t1.sortValue = (t3.calcValue1*0.7 + t3.calcValue2*0.5 + t3.calcValue3*0.3);