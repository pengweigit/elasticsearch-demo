http://www.wxdl.cn/index/solr-dismax.html（Solr dismax 源码详解以及使用方法）
http://www.howardliu.cn/translation-the-extended-dismax-query-parser/（solr-搜索-eDisMax查询解析器）
====================================================================
在SOLR中，有两种方式实现类似搜索效果，不过结果score大相径庭。
1：在q中直接拼接 
q=title:直播^1+OR+content:直播^0.1+OR+describe:直播^0.01 
2： 
q=直播&defType=dismax/edismax/MydefType&qf=title^1+content^0.1+describe^0.01 
MydefType指自定义的defType
====================================================================
很多情况下，两个方法，能够实现相同的排序结果，但是它们的计算规则并不相同，实际score也不同 
第一钟方式，相当于多个field得分累加，最终匹配分值（sumOfSquaredWeights）=查询语句在两个域中的得分之和，实际上也就是上述lucene的实现方式； 
第二种，是多个field计算各自的得分，然后取其中一个得分最高的field的得分


使用Solr搭建搜索引擎很容易，但是如何制定合理的打分规则(boost)做排序却是一个很头痛的事情。Solr本身的排序打分规则是继承自Lucene的文本相关度的打分即boost，这一套算法对于通用的提供全文检索的服务来讲，已经够用了，但是对于一些专门领域的搜索来讲，文本相关度的打分是不合适的。
如何来定制适合自身业务的排序打分规则（boost）呢？经过这段时间的思考与实践，想到了如下三个方法：
1、定制Lucene的boost算法，加入自己希望的业务规则；
2、使用Solr的edismax实现的方法，通过bf查询配置来影响boost打分。
3、在建索引的schema时设置一个字段做排序字段，通过它来影响文档的总体boost打分。
上面每一种方法都有其优劣，下面分析一下各自的优劣。
第一种方法技术难度要求较高，需要读懂Lucene的boost打分算法，在代码层做定制.
第二种方式就简单不少，不过因为受限于edismax提供的方法，所以有些局限性。
第三种排序可完全消除文本相关性打分的影响，文本检索匹配逻辑只负责找到匹配的项，排序由自定义字段处理。
着重介绍一下通过使用Solr的DisMaxQParserPlugin通过配置来制定结果文档打分规则。
DisMaxQParserPlugin提供在针对文本boost打分上，支持搜索多个schema索引字段，并针对每一个字段设置不同的boost权限。
pf查询 与 qf查询
pf: 可提供对一条记录的多个字段做匹配的功能
qf: 针对查询的每个字段设置不同的boost权重打分，其设置的字段必须为在pf中配置的项。
可在solrconfig.xml中的browse中配置做如下配置：

<requestHandler name="/browse" class="solr.SearchHandler">
<lst name="defaults">
<str name="defType">edismax</str>
<str name="pf">
name info title
</str>
<str name="qf">
name^1 info^0.8 title^0.6
</str>
</lst>
</requestHandler>
上面一段的意思是，查询name，info,title三个字段，每个字段的文本相关度打分权重分别为1,0.8,0.6。计算查询出的每一条结果的权重方法如下：分别计算各字段的文本打分然后乘于配置的权重，最后三者相加即为该结果的boost得分。
bf查询
除去pf查询，qf查询之外，仍然希望索引记录的其它字段能够计入打分中，这时可以使用bf查询。bf查询支持一些数据函数，这些函数可作用在索引记录的字段上，多为时间，数值等字段。同样bf也支持添加权重。下面是一个使用bf查询配置的例子：

<requestHandler name="/browse" class="solr.SearchHandler">
<lst name="defaults">
<str name="defType">edismax</str>
<str name="bf">
sum(recip(ms(NOW,created_time),3.16e-11,1,1),sqrt(log(max(sales,1))),sqrt(log(count)))^10
</str>
<str name="pf">
name info title
</str>
<str name="qf">
name^1 info^0.8 title^0.6
</str>
</lst>
</requestHandler>
其中sum，recip，ms，sqrt，log，max这些都是Solr提供的数学方法，支持的所有数学方法可在这里查找到：http://wiki.apache.org/solr/FunctionQuery
edismax相关资源：http://wiki.apache.org/solr/DisMaxQParserPlugin