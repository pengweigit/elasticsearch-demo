Solr中的group与facet的区别

如果是简单的使用的话，那么Facet与group都可以用来进行数据的聚合查询，但是他们还是有很大的区别的。

facet的查询结果主要是分组信息：有什么分组，每个分组包括多少记录；但是分组中有哪些数据是不可知道的，需要进一步搜索。
group则类似于关系数据库的group by，可以用于一个或者几个字段去重、显示一个group的前几条记录等。

facet查询根据条件查询出的是查询结果，facet是聚类后的信息跟查询条件是分开的，查询结果也跟facet没关系。多个Facet字段互不影响，且可以针对每个Facet字段设置查询参数，也可以应用于所有的Facet字段。应用于单独的字段时通过f.字段名.参数名=参数值这种方式调用。比如facet.prefix参数应用于cpu字段，可以采用如下形式f.cpu.facet.prefix=Intel

group查询也就是你的查询条件是跟group相关的，返回的查询结果也是跟group相关的，比如说你想要查询的结果在每个分组中都有数据采集，
那么就最好用group，这样出来的数据跟group也是相关的，但是有个问题，比如说你要查询group每个采集1个，ok那么你查询的时候的条件
rows就无效了（也不能说无效，主要是看你怎么使用），就是最多每个分组给你返回一个，多了没有了。

再细说点就是如果你想查询归查询聚类归聚类，那么使用facet，如果想使用类似采集的效果，每个group分组采集多少个，那么使用group查询。

http://localhost:8080/solr/taowei/select?sort=price+desc&q=*:*&facet=true&facet.limit=20&facet.field=brand&facet.missing=false&facet.mincount=10
http://localhost:8080/solr/taowei/select?sort=price+desc&q=*:*&group=true&group.limit=20&group.field=brand