/*
 * 中文分词测试。
 * 请确保系统安装有libmmseg
 * ------------------------------------------
 * mmseg for node.js
 * MMSeg 的 Node.js 插件，由 zzdhidden 开发。 
 * https://github.com/zzdhidden/mmseg-node
 * ------------------------------------------
 * LibMMSeg 简介
 * LibMMSeg 是Coreseek.com为 Sphinx 全文搜索引擎设计的中文分词软件包，其在GPL协议下发行的中文分词法，采用Chih-Hao Tsai的MMSEG算法。
 * LibMMSeg 采用C++开发，同时支持Linux平台和Windows平台，切分速度大约在300K/s（PM-1.2G），截至当前版本（0.7.1）LibMMSeg没有为速度仔细优化过，进一步的提升切分速度应仍有空间。
 * 词典的构造
 *
 * mmseg -u unigram.txt
 *
 * 该命令执行后，将会产生一个名为unigram.txt.uni的文件，将该文件改名为uni.lib，完成词典的构造。需要注意的是，unigram.txt 必须为UTF-8编码。
 *
 * 词典文件格式：
 *
 * ....
 * 河 187
 * x:187
 * 造假者 1
 * x:1
 * 台北队 1
 * x:1
 * 湖边 1
 * ......
 *
 * 其中，每条记录分两行。其中，第一行为词项，其格式为：[词条]\t[词频率]。需要注意的是，对于单个字后面跟这个字作单字成词的频率，这个频率 需要在大量的预先切分好的语料库中进行统计，用户增加或删除词时，一般不需要修改这个数值；对于非单字词，词频率处必须为1。第二行为占位项，是由于 LibMMSeg库的代码是从Coreseek其他的分词算法库（N-gram模型）中改造而来的，在原来的应用中，第二行为该词在各种词性下的分布频 率。LibMMSeg的用户只需要简单的在第二行处填"x:1"即可。
 *
 * 用户可以通过修改词典文件增加自己的自定义词，以提高分词法在某一具体领域的切分精度，系统默认的词典文件在data/unigram.txt中。
 *
 * 分词
 * mmseg -d tobe_segment.txt
 *
 * 其中，命令使用‘-d’开关指定词库文件所在的位置，参数dict_dir为词库文件（uni.lib ）所在的目录；tobe_segment.txt 为待切分的文本文件，必须为UTF-8编码。如果一切正确，mmseg会将切分结果以及所花费的时间显示到标准输出上。
 *
 * 对特殊短语的支持
 *
 * 由于LibMMSeg是为Sphinx全文搜索引擎设计的，因此其内置了部分搜索引擎切分算法的特性，主要表现在对特殊短语的支持上。
 *
 * 在搜索引擎中，需要处理C++时，如果分词器中没有词组C++，则将被切分为C/x +/x +/x，在进一步的检索中，可能每个词会由于出现的过于频繁而被过滤掉，导致搜索的结果与C++相关度不高不说，也严重影响的全文搜索的速度。在 LibMMSeg中，内置对特殊短语的支持。
 *
 * 其输入文件格式如下
 *
 * test commit 
	.net => dotnet
	c# => csharp
	c++ => cplusplus

 * 其中左侧是待支持的特殊短语，右侧是左侧的特殊短语需要被转换为的短语。这一转换在分词前进行。

 * 可以在行的开头加入'//'作为注释符号，发现符号'//'后，整行将被忽略。

 * 特殊短语词库构造命令：

 * mmseg -b exceptions.txt

 * 其中, 开关'-b'指示mmseg是要构造特殊短语词库；exceptions.txt是用户编辑的特殊短语转换规则。

 * 该命令执行后，将在当前目录下产生一个名为"synonyms.dat"的文件，将该文件放在"uni.lib"同一目录下，分词系统将自动启动特殊短语转换功能。

 * 注意：

 * 1、在启用了该功能后，如果分词系统发现了一个特殊短语，将直接输出其在右侧对应的替换的值；

 * 2、右侧被替换的值，请保证不会被分词器进行切分。（eg. C++ => C# 这个转换的意义不大，并且可能导致C++这个短语永远无法被检索到！）
 *
 *
 *
 *
 * */
var mmseg = require("mmseg");
var q = mmseg.open('/usr/local/etc/');
//console.log(q.segmentSync("我是中文分词"));
//console.log(q.segmentSync("我要一瓶红烧酱油和一盒新鲜的纯牛奶以及卖的最好的口香糖"));
//console.log(q.segmentSync("中国的干红葡萄酒长城赤霞珠庄园酒哈尔滨啤酒，哇哈哈旺仔小馒头"));

var http = require('http');
var querystring=require('querystring');
var url=require('url');
server = http.createServer(function (request, res) {
	//res.writeHeader(200, {"Content-Type": "text/plain"});
	//res.end("请输入需要分词的中文文本");
        var postData = "";  
        var pathname = url.parse(request.url).pathname;  
	request.setEncoding("utf8");  
	request.addListener("data",function(data){  
		postData  += data;  
		//console.log("Received POST data :")+data ;  
	});  
	request.addListener("end",function(){  
		//console.log(pathname);
		baseHTML(res);
		if(pathname === "/reqSplit"){
			var text = querystring.parse(postData).text_in;
		        //console.log(text);
			var words = q.segmentSync(text);
			//console.log(words);
			//var keys = JSON.stringify(words);
			var keysHtml = "";
			for(var i in words){
				keysHtml += "<strong>" + words[i] + "</strong>" + " ";
			}
			var htmlText = 	"<div><h3><em>分词结果:</em></h3><p>  " + keysHtml + "</p></div>";
			res.write(htmlText);
		}
		res.end();
		
        })  
})
server.listen(3001);

function baseHTML(res){
	res.writeHeader(200, {"Content-Type": "text/html"});
	res.write('<html><meta charset="utf-8"><title>longraise 中文分词测试系统</title><body><h1>longraise 便利店商品中文分词系统测试页面</h1><h3>@李才军</h3><div><p><strong>测试说明：</strong></p><p>本页面用于测试对于便利店常用商品的分词支持。用于完善便利店商品搜索分词词库。</p><p>请参与测试人员根据自己喜好输入模糊或准确的商品名称，点击提交按钮后，分词系统将对提交的文本进行分词算法，并将最终的分词结果显示在输入框的后面。</p><p>每个分词后的词组以空格符隔开。</p><p>请仔细审核分词后的词组，并记录未正确分词的词汇。请定期将结果列表反馈至开发人员处，或发送邮件至licj@longraise.com</p></div><div><form method="post" action="reqSplit"><div><lable>请在下面的输入框中输入测试文本（例如：银鹭桂圆莲子八宝粥）:</lable></div><div><textarea name="text_in" row=40 cols=80 autofocus></textarea></div><div><button type="submit">提交</button></div></form></div></body></html>');
	
}
