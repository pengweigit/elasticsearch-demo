
function examplemenus() {
    var menus = {};
    menus[1] = {
        id: 1,
        funcname: '益丰-MiniUi-在线事例',
        funccode: 'yijiankang',
        funcaction: '',
        funcicon: 'fa-adjust',
        functype: '0',
        funcseq: '1',
        sortid: '1', 
        parentid: 0
    };

    menus[2] = {
        id: 2,
        funcname: '知识库1',
        funccode: 'jichukongjian',
        funcaction: '',
        funcicon: 'fa-gear',
        functype: '0',
        funcseq: '1-2',
        sortid: '1', 
        parentid: 1
    };
    menus[201] = {
        id: 201,
        funcname: '组合商品',
        funccode: 'tanchuang',
        funcaction: 'kbs/html/sellGroup.html?token=eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMTU3MjdzZWN1cml0eWJyb3dzZXIiLCJpYXQiOjE0NjAxODcyNjAsInN1YiI6IjExNTcyNyIsImlzcyI6IjExNTcyNyIsImV4cCI6MTQ2MDE4OTA2MH0.gkozSJtFaoATEIbu9SXYX6YBA1t5567JQssH1rUYcCc',
        funcicon: 'fa-sitemap',
        functype: '1',
        funcseq: '1-2-201',
        sortid: '1', 
        parentid: 2
    };

    return menus;
}