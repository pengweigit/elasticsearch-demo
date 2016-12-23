-- --------------------------------------------------------
-- 存储过程：calcGoodsSortFieldValue
-- 实现集团级商品的权重排序值的计算，包含：销量、毛利、销量*毛利三个排序字段，第四个排序字段（是否曾购买）需要实现根据会员ID进行值的相加
-- 四个字段的累加值为排序字段的最终值
-- 三个排序字段的计算公式均为：(A/sum(A))*商品个数，三个值累加后会被写入临时表zz_goods中的sortValue字段，并添加到solr索引中
-- solr搜索商品时，如果是会员，需要将sortValue加上一个变量作为最终的排序字段值，否则，直接用sortValue进行排序
-- 两次定时任务进行索引维护：原有的定时任务保证每日商品数据的近实时增量更新；新的定时任务保证每月四个排序值的定时全量更新
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS calcGoodsSortFieldValue;
CREATE PROCEDURE calcGoodsSortFieldValue(IN weight1 NUMERIC(10,2), IN weight2 NUMERIC(10,2), IN weight3 NUMERIC(10,2)) COMMENT 'calculate goods sort field value and update it into table zz_goods--Add by David.Tao'
BEGIN
-- 定义变量
DECLARE sortCount INT;-- 存放总商品数
DECLARE _goodsCode VARCHAR(10); -- 存放从游标中取出来的商品编码
DECLARE calcValue1 NUMERIC(10,2);-- 销量值
DECLARE calcValue2 NUMERIC(10,2);-- 毛利额
DECLARE calcValue3 NUMERIC(10,2);-- 销量 * 毛利

-- 这个用于处理游标到达最后一行的情况
DECLARE s INT DEFAULT 0;
-- 声明游标myCursor（myCursor是个多行结果集）
DECLARE myCursor CURSOR FOR SELECT goods_code FROM zt_goods_profit;  
-- 设置一个终止标记
-- DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET s=1;  
DECLARE CONTINUE HANDLER FOR NOT FOUND SET s=1;

--
-- 创建临时表用以生成全量索引
DROP TABLE IF EXISTS zz_goods;
CREATE TABLE zz_goods(
SELECT gg.goods_code,gg.goods_name,gg.common_name,gg.main_barcode,gm.manufacturer_name,gg.mnemonics,gg.modify_time,00000.00 AS sortValue
FROM zt_goods_group gg LEFT JOIN zt_goods_manufacturer gm ON gg.manufacturer_code=gm.manufacturer_code);
CREATE UNIQUE INDEX i_PK_goodsCode ON zz_goods(goods_code(20));
--


-- 值赋给变量（必须在所有DECLARE语句之后）
SELECT count(1) INTO sortCount FROM zt_goods_profit;

-- 打开游标
OPEN myCursor;
-- 获取游标当前指针的记录，读取一行数据并传给变量goodsCode
FETCH  myCursor INTO _goodsCode; 

-- 开始循环，判断是否游标已经到达了最后作为循环条件
WHILE s <> 1 DO
    SET calcValue1 = (SELECT 
			(
			(SELECT t.sales_volume FROM zt_goods_profit t WHERE t.goods_code = _goodsCode)/
			(SELECT SUM(t.sales_volume) FROM zt_goods_profit t)
			) * sortCount);
  
    SET calcValue2 = (SELECT 
			(
			(SELECT t.gross_profit FROM zt_goods_profit t WHERE t.goods_code = _goodsCode)/
			(SELECT SUM(t.gross_profit) FROM zt_goods_profit t)
			) * sortCount);

    SET calcValue3 = (SELECT 
			(
			(SELECT t.total_gross_profit FROM zt_goods_profit t WHERE t.goods_code = _goodsCode)/
			(SELECT SUM(t.total_gross_profit) FROM zt_goods_profit t)
			) * sortCount);

    -- 执行插入操作
    UPDATE zz_goods zg SET zg.sortValue = calcValue1*weight1 + calcValue2*weight2 + calcValue3*weight3 WHERE zg.goods_code = _goodsCode;

    -- 读取下一行的数据
    FETCH  myCursor INTO _goodsCode;  
END WHILE;  

-- 关闭游标
CLOSE myCursor;

END