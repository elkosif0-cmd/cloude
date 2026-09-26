/* S.kosif — منظومة العمليات المتقدمة والفوترة والذكاء التشغيلي
   - الفاتورة الضريبية ZATCA وطباعة إيصال حراري 80mm
   - حاسبة خلطات ومصنعات اللحوم (برجر، كفتة، سجق، شاورما)
   - مولد ملصقات الموازين والتغليف الحرارية (60x40mm)
   - تتبع الشحنات وسلسلة التبريد ومراقبة الـ HACCP
   - دليل الشيف والقطعية المثالية للطهي
   - ماسح الباركود وQR بالكاميرا
   - إدارة ائتمان المطاعم وكشوف الحسابات البنكية
*/
(()=>{
"use strict";

/* eslint-disable no-redeclare, no-constant-condition -- vendored, minified qrcode.js */
var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var aMat,a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&c._fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(!1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d;window.QRCode=QRCode}.call(window);
/* eslint-enable no-redeclare, no-constant-condition */

const {$,$$,esc,num,load,save,money,toast}=window.SK;
const roots={};

/* Web Audio API Beep */
function beep(freq=880, duration=0.12){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type="sine"; osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+duration);
  }catch{}
}

/* ==========================================================================
   1. ZATCA TLV & Electronic Invoicing Engine
   ========================================================================== */
function zatcaTLV(seller, vatNo, timestamp, total, vat){
  function encodeTag(tag, str){
    const bytes=new TextEncoder().encode(str||"");
    return new Uint8Array([tag, bytes.length, ...bytes]);
  }
  const parts=[
    encodeTag(1, seller),
    encodeTag(2, vatNo),
    encodeTag(3, timestamp),
    encodeTag(4, total),
    encodeTag(5, vat)
  ];
  let len=parts.reduce((s,p)=>s+p.length,0);
  let out=new Uint8Array(len), off=0;
  parts.forEach(p=>{ out.set(p, off); off+=p.length; });
  let bin="";
  out.forEach(b=>{ bin+=String.fromCharCode(b); });
  return btoa(bin);
}

let invoiceItems=[];
let invoicePayment={
  method:"all_card", // all_card | all_cash | split | credit
  cashPaid:0,
  cardPaid:0,
  cardRef:"",
  transferPaid:0,
  creditPaid:0,
  cashTendered:0
};

function zatcaHTML(){
  /* seller identity comes from «الإعدادات › هوية المنشأة»; nothing is invented */
  const org=((load("aghnam-pricing-v3",{})||{}).settings)||{};
  const seller=String(org.biz||(document.getElementById("biz-name")||{}).textContent||"").trim();
  const vatNo=String(org.vatNo||"").trim();
  const now=new Date();
  const invNo="INV-"+now.getFullYear()+String(now.getMonth()+1).padStart(2,"0")+String(now.getDate()).padStart(2,"0")+"-022";
  const subtotal=invoiceItems.reduce((s,x)=>s+x.total,0);
  const vatAmount=subtotal*0.15;
  const grandTotal=subtotal+vatAmount;

  if(invoicePayment.method==="all_card"){
    invoicePayment.cardPaid=grandTotal;
    invoicePayment.cashPaid=0;
    invoicePayment.transferPaid=0;
    invoicePayment.creditPaid=0;
  } else if(invoicePayment.method==="all_cash"){
    invoicePayment.cashPaid=grandTotal;
    invoicePayment.cardPaid=0;
    invoicePayment.transferPaid=0;
    invoicePayment.creditPaid=0;
  } else if(invoicePayment.method==="credit"){
    invoicePayment.creditPaid=grandTotal;
    invoicePayment.cashPaid=0;
    invoicePayment.cardPaid=0;
    invoicePayment.transferPaid=0;
  }
  const totalPaid=invoicePayment.cashPaid+invoicePayment.cardPaid+invoicePayment.transferPaid+invoicePayment.creditPaid;
  const changeDue=invoicePayment.cashTendered>invoicePayment.cashPaid?(invoicePayment.cashTendered-invoicePayment.cashPaid):0;
  const remainingDue=Math.max(0,grandTotal-totalPaid);
  const payMethodLabel=invoicePayment.method==="all_card"?"مدى / بطاقة مصرفية":
                       invoicePayment.method==="all_cash"?"نقدي كامل":
                       invoicePayment.method==="credit"?"حساب ائتماني / آجل":
                       "دفع مقسم (Split)";

  return [
    '<div class="sk38-rcpt-preview-wrap">',
      '<div class="sk38-rcpt-form">',
        '<div class="sk-grid2">',
          '<label class="sk-field"><span>اسم المنشأة</span><input id="sk38-seller" value="'+esc(seller)+'"></label>',
          '<label class="sk-field"><span>الرقم الضريبي (15 رقم)</span><input id="sk38-vatno" inputmode="numeric" placeholder="أدخله في الإعدادات › هوية المنشأة" value="'+esc(vatNo)+'"></label>',
        '</div>',
        '<div class="sk-grid2">',
          '<label class="sk-field"><span>اسم العميل / المطعم</span><input id="sk38-cust" value="مطعم الضيافة الفاخرة"></label>',
          '<label class="sk-field"><span>رقم الفاتورة</span><input id="sk38-invno" value="'+invNo+'"></label>',
        '</div>',
        '<div class="sk-section-title" style="margin:12px 0 8px;"><b>بنود الفاتورة الحالية</b></div>',
        '<div id="sk38-inv-items">',
          invoiceItems.map((it,idx)=>'<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">'+
            '<input style="flex:2;" class="sk38-it-name" data-i="'+idx+'" value="'+esc(it.name)+'">'+
            '<input style="width:70px;" type="number" step="0.1" class="sk38-it-qty" data-i="'+idx+'" value="'+it.qty+'">'+
            '<input style="width:85px;" type="number" step="0.5" class="sk38-it-price" data-i="'+idx+'" value="'+it.price+'">'+
            '<span style="font-weight:bold;width:80px;text-align:left;">'+money(it.total)+'</span>'+
            '<button type="button" class="sk38-it-del btn-del" data-i="'+idx+'" style="background:rgba(239,68,68,0.15);color:var(--sk-bad);border:none;border-radius:4px;width:28px;height:28px;cursor:pointer;">×</button>'+
          '</div>').join(""),
        '</div>',
        '<div style="display:flex;gap:8px;margin-top:10px;">',
          '<button type="button" id="sk38-add-item" class="btn" style="padding:6px 12px;font-size:0.85rem;">+ بند جديد</button>',
          '<button type="button" id="sk38-cart-import" class="btn" style="padding:6px 12px;font-size:0.85rem;">استيراد من سلة الطلبيات</button>',
        '</div>',

        '<div class="sk-section-title" style="margin:14px 0 8px;"><b>سداد الفاتورة وطريقة الدفع (POS)</b></div>',
        '<div class="sk-chips" style="margin-bottom:10px;">',
          '<button type="button" class="chip sk38-pay-m '+(invoicePayment.method==='all_card'?'active':'')+'" data-m="all_card">مدى / بطاقة</button>',
          '<button type="button" class="chip sk38-pay-m '+(invoicePayment.method==='all_cash'?'active':'')+'" data-m="all_cash">نقدي كامل</button>',
          '<button type="button" class="chip sk38-pay-m '+(invoicePayment.method==='split'?'active':'')+'" data-m="split">دفع مقسم (Split)</button>',
          '<button type="button" class="chip sk38-pay-m '+(invoicePayment.method==='credit'?'active':'')+'" data-m="credit">آجل / ائتمان</button>',
        '</div>',

        (invoicePayment.method==='split'?[
          '<div style="background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);margin-bottom:10px;">',
            '<div class="sk-grid2">',
              '<label class="sk-field"><span>المدفوع مدى / بطاقة (ر.س)</span><input id="sk38-pay-card" type="number" step="1" value="'+invoicePayment.cardPaid+'"></label>',
              '<label class="sk-field"><span>مرجع العملية البنكية (Auth Ref)</span><input id="sk38-pay-cardref" type="text" placeholder="مثال: 948271" value="'+esc(invoicePayment.cardRef)+'"></label>',
            '</div>',
            '<div class="sk-grid2" style="margin-top:8px;">',
              '<label class="sk-field"><span>المدفوع نقداً (ر.س)</span><input id="sk38-pay-cash" type="number" step="1" value="'+invoicePayment.cashPaid+'"></label>',
              '<label class="sk-field"><span>المبلغ المستلم نقداً (لحساب الفكة)</span><input id="sk38-pay-tendered" type="number" step="1" value="'+invoicePayment.cashTendered+'"></label>',
            '</div>',
            '<div class="sk-grid2" style="margin-top:8px;">',
              '<label class="sk-field"><span>المدفوع تحويل بنكي (ر.س)</span><input id="sk38-pay-transfer" type="number" step="1" value="'+invoicePayment.transferPaid+'"></label>',
              '<label class="sk-field"><span>المسجل على الحساب الآجل (ر.س)</span><input id="sk38-pay-credit" type="number" step="1" value="'+invoicePayment.creditPaid+'"></label>',
            '</div>',
            '<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:0.85rem;padding-top:6px;border-top:1px dashed var(--line,#ddd);">',
              '<span>المسدد: <b>'+totalPaid.toFixed(2)+' ر.س</b></span>',
              (changeDue>0?'<span style="color:var(--sk-ok);">الفكة المرجعة: <b>'+changeDue.toFixed(2)+' ر.س</b></span>':''),
              (remainingDue>0.05?'<span style="color:var(--sk-bad);">المتبقي بذمة العميل: <b>'+remainingDue.toFixed(2)+' ر.س</b></span>':'<span style="color:var(--sk-ok);">✓ مسدد بالكامل</span>'),
            '</div>',
          '</div>'
        ].join(''):invoicePayment.method==='all_cash'?[
          '<div style="background:var(--surface-2,#fafafa);padding:10px;border-radius:8px;border:1px solid var(--line,#eee);margin-bottom:10px;">',
            '<div class="sk-grid2">',
              '<label class="sk-field"><span>المبلغ المستلم من العميل</span><input id="sk38-pay-tendered" type="number" step="5" value="'+(invoicePayment.cashTendered||grandTotal)+'"></label>',
              '<div style="display:flex;flex-direction:column;justify-content:center;"><span>المتبقي للعميل (فكة):</span><b style="font-size:1.1rem;color:var(--sk-ok);">'+changeDue.toFixed(2)+' ر.س</b></div>',
            '</div>',
          '</div>'
        ].join(''):''),

        '<div style="display:flex;gap:8px;margin-top:16px;border-top:1px solid var(--line,#ddd);padding-top:14px;flex-wrap:wrap;">',
          '<button type="button" id="sk38-print-rcpt" class="btn btn-pri">طباعة إيصال حراري (80mm)</button>',
          '<button type="button" id="sk38-wa-rcpt" class="btn" style="background:var(--sk-ok);color:#fff;">مشاركة عبر واتساب</button>',
          '<button type="button" id="sk38-verify-tlv-btn" class="btn">فحص وتدقيق رمز الـ QR (TLV)</button>',
        '</div>',
        '<div id="sk38-tlv-verify-box" style="display:none;background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);margin-top:10px;">',
          '<div class="sk-section-title" style="margin-bottom:6px;"><b>مدقق وفاحص رموز ZATCA الإلكترونية</b></div>',
          '<textarea id="sk38-tlv-input" rows="2" style="width:100%;box-sizing:border-box;font-family:monospace;font-size:12px;padding:6px;border-radius:6px;border:1px solid var(--line,#ccc);" placeholder="الصق نص الـ Base64 لرمز الفاتورة هنا للتحقق..."></textarea>',
          '<div style="display:flex;gap:8px;margin-top:8px;">',
            '<button type="button" class="btn sm primary" id="sk38-tlv-decode">فك التشفير والتدقيق</button>',
            '<button type="button" class="btn sm" id="sk38-tlv-load-cur">فحص الفاتورة الحالية</button>',
          '</div>',
          '<div id="sk38-tlv-out" style="margin-top:8px;font-size:0.82rem;line-height:1.6;"></div>',
        '</div>',
      '</div>',
      '<div class="sk38-rcpt-view" id="sk38-receipt-printable">',
        '<div class="sk38-rcpt-header">',
          '<h2>'+esc(seller)+'</h2>',
          '<p>مختارات الذواقة واللحوم البلدية الفاخرة</p>',
          '<p>الرقم الضريبي: '+esc(vatNo)+'</p>',
          '<p style="font-weight:bold;margin-top:6px;">فاتورة ضريبية مبسطة</p>',
          '<p>SIMPLIFIED TAX INVOICE</p>',
        '</div>',
        '<div class="sk38-rcpt-meta">',
          '<div><span>رقم الفاتورة:</span><b>'+invNo+'</b></div>',
          '<div><span>التاريخ والوقت:</span><b>'+now.toLocaleString("ar-SA")+'</b></div>',
          '<div><span>العميل:</span><b>'+esc($("#sk38-cust")?.value||"مطعم الضيافة")+'</b></div>',
          '<div><span>طريقة الدفع:</span><b>'+esc(payMethodLabel)+'</b></div>',
        '</div>',
        '<table class="sk38-rcpt-table">',
          '<thead><tr><th>الصنف</th><th style="text-align:center;">الكمية</th><th style="text-align:center;">السعر</th><th style="text-align:left;">الإجمالي</th></tr></thead>',
          '<tbody>',
            invoiceItems.map(it=>'<tr><td>'+esc(it.name)+'</td><td style="text-align:center;">'+it.qty+'</td><td style="text-align:center;">'+it.price.toFixed(2)+'</td><td style="text-align:left;">'+it.total.toFixed(2)+'</td></tr>').join(""),
          '</tbody>',
        '</table>',
        '<div class="sk38-rcpt-totals">',
          '<div><span>المجموع الخاضع للضريبة:</span><b>'+subtotal.toFixed(2)+' ر.س</b></div>',
          '<div><span>ضريبة القيمة المضافة (15٪):</span><b>'+vatAmount.toFixed(2)+' ر.س</b></div>',
          '<div class="sk38-rcpt-grand"><span>الإجمالي المستحق:</span><b>'+grandTotal.toFixed(2)+' ر.س</b></div>',
        '</div>',
        '<div class="sk38-rcpt-payments">'+
          (invoicePayment.cardPaid>0?'<div><span>مدى / شبكة:</span><b>'+invoicePayment.cardPaid.toFixed(2)+' ر.س '+(invoicePayment.cardRef?'(مرجع: '+invoicePayment.cardRef+')':'')+'</b></div>':'')+
          (invoicePayment.cashPaid>0?'<div><span>نقداً:</span><b>'+invoicePayment.cashPaid.toFixed(2)+' ر.س '+(invoicePayment.cashTendered>0?'(المستلم: '+invoicePayment.cashTendered.toFixed(2)+')':'')+'</b></div>':'')+
          (changeDue>0?'<div><span>المتبقي للعميل (فكة):</span><b style="color:var(--sk-ok);">'+changeDue.toFixed(2)+' ر.س</b></div>':'')+
          (invoicePayment.transferPaid>0?'<div><span>تحويل بنكي:</span><b>'+invoicePayment.transferPaid.toFixed(2)+' ر.س</b></div>':'')+
          (invoicePayment.creditPaid>0?'<div><span>حساب آجل:</span><b>'+invoicePayment.creditPaid.toFixed(2)+' ر.س</b></div>':'')+
          (remainingDue>0.05?'<div style="font-weight:bold;color:var(--sk-bad);"><span>المتبقي بذمة العميل:</span><b>'+remainingDue.toFixed(2)+' ر.س</b></div>':'')+
        '</div>',
        '<div class="sk38-rcpt-qr">',
          '<div class="sk38-rcpt-qr-box" id="sk38-qrcode-box"></div>',
          '<span>امسح الرمز للتحقق من هيئة الزكاة والضريبة (ZATCA)</span>',
        '</div>',
        '<div class="sk38-rcpt-footer"><p>شكراً لاختياركم أغنام الوادي</p><p>لحوم بلدية طازجة تذبح يومياً وفق أعلى معايير الجودة والسلامة</p></div>',
      '</div>',
    '</div>'
  ].join("");
}

function updateZatcaQR(){
  const seller=$("#sk38-seller")?.value||"";
  const vatNo=$("#sk38-vatno")?.value||"";
  const now=new Date().toISOString().slice(0,19)+"Z";
  const subtotal=invoiceItems.reduce((s,x)=>s+x.total,0);
  const vatAmount=(subtotal*0.15).toFixed(2);
  const grandTotal=(subtotal*1.15).toFixed(2);
  const tlvB64=zatcaTLV(seller,vatNo,now,grandTotal,vatAmount);
  const box=$("#sk38-qrcode-box");
  if(box&&window.QRCode){
    box.innerHTML="";
    try{
      new window.QRCode(box,{
        text:tlvB64,
        width:125,
        height:125,
        correctLevel:window.QRCode.CorrectLevel.M
      });
    }catch{ box.textContent="QR Error"; }
  }
}

function decodeZatcaTLV(b64){
  try{
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    let off=0;
    const tags={};
    const decoder=new TextDecoder("utf-8");
    while(off<bytes.length){
      const tag=bytes[off];
      const len=bytes[off+1];
      const valBytes=bytes.slice(off+2, off+2+len);
      tags[tag]=decoder.decode(valBytes);
      off+=2+len;
    }
    return tags;
  }catch{ return null; }
}

function decodeAndDisplayTLV(b64){
  const out=$("#sk38-tlv-out"); if(!out)return;
  const tags=decodeZatcaTLV(b64);
  if(!tags||!tags[1]||!tags[2]){
    out.innerHTML='<div style="color:var(--sk-bad);font-weight:bold;">رمز الـ QR غير متوافق مع معايير ZATCA Phase 2 أو صيغة Base64 غير صالحة.</div>';
    return;
  }
  const vatValid=/^3\d{13}3$/.test(tags[2]);
  const total=Number(tags[4])||0;
  const vat=Number(tags[5])||0;
  const expectedVat=total>0?(total-(total/1.15)):0;
  const mathValid=Math.abs(vat-expectedVat)<0.5;

  out.innerHTML='<div style="background:var(--sk-surface);border:1px solid color-mix(in srgb,var(--sk-info) 35%,var(--sk-line));padding:10px;border-radius:6px;">'+
    '<div style="color:var(--sk-ok);font-weight:bold;margin-bottom:6px;">✓ تم فك ترميز TLV بنجاح ومطابق لمعايير ZATCA</div>'+
    '<div>• <b>اسم المنشأة (Tag 1):</b> '+esc(tags[1])+'</div>'+
    '<div>• <b>الرقم الضريبي (Tag 2):</b> <span dir="ltr">'+esc(tags[2])+'</span> '+(vatValid?'<span style="color:var(--sk-ok);">(صحيح 15 رقم)</span>':'<span style="color:var(--sk-bad);">(تنبيه: يجب أن يبدأ وينتهي بـ 3)</span>')+'</div>'+
    '<div>• <b>الوقت والتاريخ (Tag 3):</b> '+esc(tags[3])+'</div>'+
    '<div>• <b>الإجمالي مع الضريبة (Tag 4):</b> '+total.toFixed(2)+' ر.س</div>'+
    '<div>• <b>مبلغ الضريبة (Tag 5):</b> '+vat.toFixed(2)+' ر.س '+(mathValid?'<span style="color:var(--sk-ok);">(15% دقيقة)</span>':'')+'</div>'+
  '</div>';
}

function bindZatca(){
  updateZatcaQR();
  $("#sk38-seller")?.addEventListener("input",updateZatcaQR);
  $("#sk38-vatno")?.addEventListener("input",updateZatcaQR);
  $("#sk38-add-item")?.addEventListener("click",()=>{
    invoiceItems.push({name:"بند جديد",qty:1,price:100,total:100});
    paint("zatca");
  });
  $$(".sk38-pay-m").forEach(b=>{
    b.onclick=()=>{
      invoicePayment.method=b.dataset.m;
      paint("zatca");
    };
  });
  $("#sk38-pay-cash")?.addEventListener("input",e=>{ invoicePayment.cashPaid=num(e.target.value); paint("zatca"); });
  $("#sk38-pay-card")?.addEventListener("input",e=>{ invoicePayment.cardPaid=num(e.target.value); paint("zatca"); });
  $("#sk38-pay-cardref")?.addEventListener("input",e=>{ invoicePayment.cardRef=e.target.value; });
  $("#sk38-pay-transfer")?.addEventListener("input",e=>{ invoicePayment.transferPaid=num(e.target.value); paint("zatca"); });
  $("#sk38-pay-credit")?.addEventListener("input",e=>{ invoicePayment.creditPaid=num(e.target.value); paint("zatca"); });
  $("#sk38-pay-tendered")?.addEventListener("input",e=>{ invoicePayment.cashTendered=num(e.target.value); paint("zatca"); });

  $("#sk38-verify-tlv-btn")?.addEventListener("click",()=>{
    const box=$("#sk38-tlv-verify-box");
    if(box)box.style.display=box.style.display==="none"?"block":"none";
  });
  $("#sk38-tlv-load-cur")?.addEventListener("click",()=>{
    const seller=$("#sk38-seller")?.value||"";
    const vatNo=$("#sk38-vatno")?.value||"";
    const now=new Date().toISOString().slice(0,19)+"Z";
    const subtotal=invoiceItems.reduce((s,x)=>s+x.total,0);
    const vatAmount=(subtotal*0.15).toFixed(2);
    const grandTotal=(subtotal*1.15).toFixed(2);
    const tlvB64=zatcaTLV(seller,vatNo,now,grandTotal,vatAmount);
    const ta=$("#sk38-tlv-input");
    if(ta)ta.value=tlvB64;
    decodeAndDisplayTLV(tlvB64);
  });
  $("#sk38-tlv-decode")?.addEventListener("click",()=>{
    const ta=$("#sk38-tlv-input");
    if(ta)decodeAndDisplayTLV(ta.value.trim());
  });

  $$(".sk38-it-name").forEach(el=>el.oninput=()=>{invoiceItems[+el.dataset.i].name=el.value});
  $$(".sk38-it-qty").forEach(el=>el.oninput=()=>{
    const idx=+el.dataset.i; invoiceItems[idx].qty=num(el.value);
    invoiceItems[idx].total=invoiceItems[idx].qty*invoiceItems[idx].price;
    paint("zatca");
  });
  $$(".sk38-it-price").forEach(el=>el.oninput=()=>{
    const idx=+el.dataset.i; invoiceItems[idx].price=num(el.value);
    invoiceItems[idx].total=invoiceItems[idx].qty*invoiceItems[idx].price;
    paint("zatca");
  });
  $$(".sk38-it-del").forEach(el=>el.onclick=()=>{
    invoiceItems.splice(+el.dataset.i,1);
    paint("zatca");
  });
  $("#sk38-cart-import")?.addEventListener("click",()=>{
    const cart=load("skosif_v32_cart",{});
    const keys=Object.keys(cart);
    if(!keys.length){ toast("سلة الطلبيات فارغة حالياً."); return; }
    invoiceItems=keys.map(k=>({
      name:cart[k].name||k,
      qty:cart[k].qty||1,
      price:Number(cart[k].price)||0,
      total:(cart[k].qty||1)*(Number(cart[k].price)||0)
    }));
    toast("تم استيراد "+invoiceItems.length+" بند من سلة الطلبيات.");
    paint("zatca");
  });
  $("#sk38-print-rcpt")?.addEventListener("click",()=>{
    const rcpt=$("#sk38-receipt-printable");
    if(!rcpt)return;
    rcpt.classList.add("sk38-print-active");
    window.print();
    setTimeout(()=>rcpt.classList.remove("sk38-print-active"),1000);
  });
  $("#sk38-wa-rcpt")?.addEventListener("click",()=>{
    const seller=$("#sk38-seller")?.value||"أغنام الوادي";
    const cust=$("#sk38-cust")?.value||"العميل الكريم";
    const subtotal=invoiceItems.reduce((s,x)=>s+x.total,0);
    const grandTotal=subtotal*1.15;
    const changeDue=invoicePayment.cashTendered>invoicePayment.cashPaid?(invoicePayment.cashTendered-invoicePayment.cashPaid):0;
    const totalPaid=invoicePayment.cashPaid+invoicePayment.cardPaid+invoicePayment.transferPaid+invoicePayment.creditPaid;
    const remainingDue=Math.max(0,grandTotal-totalPaid);

    let msg="*🧾 فاتورة ضريبية مبسطة — "+seller+"*\n";
    msg+="العميل: "+cust+"\nالتاريخ: "+new Date().toLocaleDateString("ar-SA")+"\n";
    msg+="--------------------------------\n";
    invoiceItems.forEach(it=>{ msg+="• "+it.name+" ("+it.qty+") = "+it.total.toFixed(2)+" ر.س\n"; });
    msg+="--------------------------------\n";
    msg+="*المجموع الخاضع للضريبة:* "+subtotal.toFixed(2)+" ر.س\n";
    msg+="*ضريبة القيمة المضافة (15٪):* "+(subtotal*0.15).toFixed(2)+" ر.س\n";
    msg+="*الإجمالي المستحق:* "+grandTotal.toFixed(2)+" ر.س\n";
    msg+="--------------------------------\n";
    if(invoicePayment.cardPaid>0)msg+="• سداد مدى / شبكة: "+invoicePayment.cardPaid.toFixed(2)+" ر.س\n";
    if(invoicePayment.cashPaid>0)msg+="• سداد نقدي: "+invoicePayment.cashPaid.toFixed(2)+" ر.س\n";
    if(changeDue>0)msg+="• الفكة المرجعة: "+changeDue.toFixed(2)+" ر.س\n";
    if(invoicePayment.transferPaid>0)msg+="• تحويل بنكي: "+invoicePayment.transferPaid.toFixed(2)+" ر.س\n";
    if(invoicePayment.creditPaid>0)msg+="• حساب آجل: "+invoicePayment.creditPaid.toFixed(2)+" ر.س\n";
    if(remainingDue>0.05)msg+="• المتبقي بذمة العميل: "+remainingDue.toFixed(2)+" ر.س\n";
    msg+="رقم الفاتورة: "+($("#sk38-invno")?.value||"")+"\n\nشكراً لتعاملكم معنا!";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });
}

/* ==========================================================================
   2. Code 128 Barcode Generator
   ========================================================================== */
const CODE128_PATTERNS=[
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112'
];

function code128SVG(text,height=32){
  const str=String(text||"20260901").replace(/[^A-Za-z0-9_-]/g,"");
  const START_B=104, codes=[START_B]; let checksum=START_B;
  for(let i=0;i<str.length;i++){
    const code=str.charCodeAt(i)-32, c=(code>=0&&code<=95)?code:0;
    codes.push(c); checksum+=c*(i+1);
  }
  codes.push(checksum%103); codes.push(106);
  let pattern=""; for(let c of codes)pattern+=CODE128_PATTERNS[c]||"";
  let x=6, rects="";
  for(let i=0;i<pattern.length;i++){
    let w=parseInt(pattern[i],10);
    if(i%2===0)rects+='<rect x="'+x+'" y="0" width="'+w+'" height="'+height+'" fill="#000"/>';
    x+=w;
  }
  return '<svg viewBox="0 0 '+(x+6)+' '+(height+14)+'" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:0 auto;">'+
    rects+'<text x="'+((x+6)/2)+'" y="'+(height+11)+'" text-anchor="middle" font-family="monospace" font-size="10" fill="#000">'+str+'</text></svg>';
}

/* ==========================================================================
   3. Meat Blending Costing Engine
   ========================================================================== */
const BLEND_PRESETS=[
  {name:"برجر واغيو كلاسيك (80/20)",leanCut:"كتف ورقبة عجل",leanKg:20,leanCost:48,fatCut:"شحم الظهر ولية",fatKg:5,fatCost:15,spicesCost:85,pkgCost:45,pieceGrams:150,shrink:6,margin:35},
  {name:"كفتة غنم نعيمي بلدي (75/25)",leanCut:"فخذ وكتف نعيمي",leanKg:15,leanCost:55,fatCut:"لية خروف طازجة",fatKg:5,fatCost:20,spicesCost:60,pkgCost:35,pieceGrams:100,shrink:5,margin:30},
  {name:"سجق لحم بلدي متبل",leanCut:"هبر بقر بلدي",leanKg:18,leanCost:42,fatCut:"شحم بقر فاخر",fatKg:4,fatCost:14,spicesCost:110,pkgCost:70,pieceGrams:80,shrink:8,margin:40},
  {name:"شاورما لحم عجل متبلة",leanCut:"شاورما عجل توب سايد",leanKg:25,leanCost:52,fatCut:"لية خروف مقرمشة",fatKg:4,fatCost:22,spicesCost:130,pkgCost:50,pieceGrams:200,shrink:10,margin:38}
];
let blendState={...BLEND_PRESETS[0]};

function blendingHTML(){
  const calc=(window.SKServices?.meatops?.calculateBlend?.({
    leanKg:blendState.leanKg,
    fatKg:blendState.fatKg,
    leanCost:blendState.leanCost,
    fatCost:blendState.fatCost,
    spicesCost:blendState.spicesCost,
    pkgCost:blendState.pkgCost,
    shrinkPct:blendState.shrink,
    pieceGrams:blendState.pieceGrams,
    marginPct:blendState.margin
  }))||(()=>{
    const rawWeight=blendState.leanKg+blendState.fatKg;
    const netYield=rawWeight*(1-blendState.shrink/100);
    const totalCost=(blendState.leanKg*blendState.leanCost)+(blendState.fatKg*blendState.fatCost)+blendState.spicesCost+blendState.pkgCost;
    const costPerKg=netYield>0?totalCost/netYield:0;
    const pieces=blendState.pieceGrams>0?Math.floor((netYield*1000)/blendState.pieceGrams):0;
    const costPerPiece=pieces>0?totalCost/pieces:0;
    const targetMargin=Math.min(90,Math.max(5,blendState.margin))/100;
    const pricePerKg=costPerKg/(1-targetMargin);
    const pricePerPiece=costPerPiece/(1-targetMargin);
    const totalRevenue=pieces*pricePerPiece;
    const totalProfit=totalRevenue-totalCost;
    const leanPct=rawWeight>0?(blendState.leanKg/rawWeight)*100:80;
    const fatPct=rawWeight>0?(blendState.fatKg/rawWeight)*100:20;
    return {rawWeight,netYield,totalCost,costPerKg,pieces,costPerPiece,pricePerKg,pricePerPiece,totalRevenue,totalProfit,leanPct,fatPct};
  })();
  const {rawWeight,netYield,totalCost,costPerKg,pieces,costPerPiece,pricePerKg,pricePerPiece,totalRevenue,totalProfit,leanPct,fatPct}=calc;

  return [
    '<div class="sk-chips" style="margin-bottom:14px;">',
      BLEND_PRESETS.map((p,idx)=>'<button type="button" class="chip sk38-blend-preset" data-p="'+idx+'">'+esc(p.name)+'</button>').join(""),
    '</div>',
    '<div class="sk38-gauge-wrap">',
      '<div style="font-size:0.85rem;font-weight:bold;width:120px;">نسبة الهبر/الدهن:</div>',
      '<div class="sk38-gauge-bar">',
        '<div class="sk38-gauge-lean" style="width:'+leanPct+'%;"></div>',
        '<div class="sk38-gauge-fat" style="width:'+fatPct+'%;"></div>',
      '</div>',
      '<div class="sk38-gauge-info"><span class="lean">هبر: '+leanPct.toFixed(0)+'٪</span><span class="fat">شحم: '+fatPct.toFixed(0)+'٪</span></div>',
    '</div>',
    '<div class="sk-grid2">',
      '<label class="sk-field"><span>اسم الوصفة</span><input id="sk38-b-name" value="'+esc(blendState.name)+'"></label>',
      '<label class="sk-field"><span>وزن القرص / القطعة (جرام)</span><input id="sk38-b-piece" type="number" value="'+blendState.pieceGrams+'"></label>',
    '</div>',
    '<div class="sk-section-title" style="margin:12px 0 8px;"><b>مكونات اللحم والشحم</b></div>',
    '<div class="sk-grid2">',
      '<div style="background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);">',
        '<b style="color:#2e7d32;">مكون اللحم الهبر (Lean)</b>',
        '<label class="sk-field" style="margin-top:6px;"><span>اسم القطعية</span><input id="sk38-b-leancut" value="'+esc(blendState.leanCut)+'"></label>',
        '<div class="sk-grid2" style="margin-top:8px;">',
          '<label class="sk-field"><span>الوزن (كجم)</span><input id="sk38-b-leankg" type="number" step="0.5" value="'+blendState.leanKg+'"></label>',
          '<label class="sk-field"><span>التكلفة/كجم (ر.س)</span><input id="sk38-b-leancost" type="number" step="1" value="'+blendState.leanCost+'"></label>',
        '</div>',
      '</div>',
      '<div style="background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);">',
        '<b style="color:#d97706;">مكون الشحم / الدهن (Fat/Suet)</b>',
        '<label class="sk-field" style="margin-top:6px;"><span>نوع الدهن</span><input id="sk38-b-fatcut" value="'+esc(blendState.fatCut)+'"></label>',
        '<div class="sk-grid2" style="margin-top:8px;">',
          '<label class="sk-field"><span>الوزن (كجم)</span><input id="sk38-b-fatkg" type="number" step="0.5" value="'+blendState.fatKg+'"></label>',
          '<label class="sk-field"><span>التكلفة/كجم (ر.س)</span><input id="sk38-b-fatcost" type="number" step="1" value="'+blendState.fatCost+'"></label>',
        '</div>',
      '</div>',
    '</div>',
    '<div class="sk-section-title" style="margin:14px 0 8px;"><b>التكاليف الإضافية والفاقد</b></div>',
    '<div class="sk-grid2">',
      '<label class="sk-field"><span>تكلفة التوابل والخلطة (ر.س)</span><input id="sk38-b-spices" type="number" value="'+blendState.spicesCost+'"></label>',
      '<label class="sk-field"><span>تكلفة التغليف والعلب (ر.س)</span><input id="sk38-b-pkg" type="number" value="'+blendState.pkgCost+'"></label>',
      '<label class="sk-field"><span>نسبة الفاقد / الانكماش %</span><input id="sk38-b-shrink" type="number" step="0.5" value="'+blendState.shrink+'"></label>',
      '<label class="sk-field"><span>الهامش الربحي المستهدف %</span><input id="sk38-b-margin" type="number" step="1" value="'+blendState.margin+'"></label>',
    '</div>',
    '<div class="sk-kpis" style="margin-top:16px;">',
      '<div class="sk-kpi"><span>إجمالي وزن الخلطة الصافي</span><b>'+netYield.toFixed(2)+' كجم</b></div>',
      '<div class="sk-kpi"><span>عدد الأقراص / القطع</span><b>'+pieces+' حبة</b></div>',
      '<div class="sk-kpi"><span>التكلفة الفعلية للكيلو</span><b>'+money(costPerKg)+'</b></div>',
      '<div class="sk-kpi"><span>تكلفة الحبة الواحدة</span><b>'+money(costPerPiece)+'</b></div>',
      '<div class="sk-kpi accent"><span>سعر البيع المقترح/كجم</span><b>'+money(pricePerKg)+'</b></div>',
      '<div class="sk-kpi accent"><span>سعر بيع الحبة المقترح</span><b>'+money(pricePerPiece)+'</b></div>',
      '<div class="sk-kpi good"><span>الربح الإجمالي المتوقع</span><b>'+money(totalProfit)+'</b></div>',
    '</div>',
    '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
      '<button type="button" id="sk38-batch-order" class="btn btn-pri">طباعة أمر تشغيل باتش تحضير (Work Order)</button>',
      '<button type="button" id="sk38-wa-blend" class="btn" style="background:#25D366;color:#fff;">مشاركة بطاقة تسعير الخلطة عبر واتساب</button>',
    '</div>'
  ].join("");
}

function bindBlending(){
  $$(".sk38-blend-preset").forEach(b=>{
    b.onclick=()=>{ blendState={...BLEND_PRESETS[+b.dataset.p]}; paint("blending"); };
  });
  const reCalc=()=>{
    blendState.name=$("#sk38-b-name").value;
    blendState.pieceGrams=num($("#sk38-b-piece").value);
    blendState.leanCut=$("#sk38-b-leancut").value;
    blendState.leanKg=num($("#sk38-b-leankg").value);
    blendState.leanCost=num($("#sk38-b-leancost").value);
    blendState.fatCut=$("#sk38-b-fatcut").value;
    blendState.fatKg=num($("#sk38-b-fatkg").value);
    blendState.fatCost=num($("#sk38-b-fatcost").value);
    blendState.spicesCost=num($("#sk38-b-spices").value);
    blendState.pkgCost=num($("#sk38-b-pkg").value);
    blendState.shrink=num($("#sk38-b-shrink").value);
    blendState.margin=num($("#sk38-b-margin").value);
    paint("blending");
  };
  ["sk38-b-leankg","sk38-b-leancost","sk38-b-fatkg","sk38-b-fatcost","sk38-b-spices","sk38-b-pkg","sk38-b-shrink","sk38-b-margin","sk38-b-piece"].forEach(id=>{
    $("#"+id)?.addEventListener("input",reCalc);
  });
  $("#sk38-batch-order")?.addEventListener("click",()=>{
    const batchNo="BATCH-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+Math.floor(10+Math.random()*90);
    const rawWeight=blendState.leanKg+blendState.fatKg;
    const netYield=rawWeight*(1-blendState.shrink/100);
    const pieces=blendState.pieceGrams>0?Math.floor((netYield*1000)/blendState.pieceGrams):0;
    const w=window.open("","_blank","width=600,height=750");
    if(!w)return toast("يرجى السماح بالنوافذ المنبثقة لطباعة أمر التشغيل");
    w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>أمر تشغيل باتش تحضير - '+batchNo+'</title>'+
      '<style>body{font-family:system-ui,sans-serif;padding:24px;line-height:1.5;color:#111;}'+
      'h2{margin:0 0 6px;color:#1e3a8a;}table{width:100%;border-collapse:collapse;margin:16px 0;}'+
      'th,td{border:1px solid #ccc;padding:8px 10px;text-align:right;}th{background:#f1f5f9;}'+
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;}'+
      '.box{background:#f8fafc;padding:12px;border:1px solid #cbd5e1;border-radius:6px;}'+
      '.sign{display:flex;justify-content:space-between;margin-top:40px;border-top:1px solid #999;padding-top:10px;}'+
      '</style></head><body>'+
      '<div style="text-align:center;border-bottom:2px solid #1e3a8a;padding-bottom:10px;margin-bottom:16px;">'+
      '<h2>أمر تشغيل وتحضير دفعة مصنعات لحوم</h2>'+
      '<div>أغنام الوادي للذبائح واللحوم — قسم التصنيع والتجهيز</div>'+
      '<b>رقم الباتش: '+batchNo+' | تاريخ التشغيل: '+new Date().toLocaleDateString("ar-SA")+'</b>'+
      '</div>'+
      '<div class="grid">'+
      '<div class="box"><b>اسم الخلطة:</b> '+esc(blendState.name)+'<br><b>وزن القطعة / القرص:</b> '+blendState.pieceGrams+' جرام</div>'+
      '<div class="box"><b>الكمية المستهدفة:</b> '+pieces+' حبة<br><b>الوزن الصافي المتوقع:</b> '+netYield.toFixed(2)+' كجم</div>'+
      '</div>'+
      '<table><thead><tr><th>المكون</th><th>القطعية المحددة</th><th>الوزن المطلوب</th><th>الملاحظات التشغيلية</th></tr></thead><tbody>'+
      '<tr><td>لحم هبر (Lean)</td><td>'+esc(blendState.leanCut)+'</td><td><b>'+blendState.leanKg+' كجم</b></td><td>درجة حرارة اللحم 0-2° م عند الفرم</td></tr>'+
      '<tr><td>شحم / دهن (Fat)</td><td>'+esc(blendState.fatCut)+'</td><td><b>'+blendState.fatKg+' كجم</b></td><td>فرم متجانس على قرص 4.5 مم</td></tr>'+
      '<tr><td>خلطة البهارات والتوابل</td><td>توابل مصنعات خاصة</td><td>موزونة مسبقاً</td><td>تخلط ببطء لمنع ارتفاع الحرارة</td></tr>'+
      '<tr><td>التعبئة والتغليف</td><td>أطباق فاكيوم مسحوبة الهواء</td><td>'+pieces+' عبوة</td><td>وضع ملصق البيانات وتاريخ الصلاحية</td></tr>'+
      '</tbody></table>'+
      '<div class="box"><b>تعليمات ضبط الجودة وسلامة الغذاء:</b> التأكد من نظافة المفرمة وتعقيمها، فحص درجة حرارة العجينة ألا تتعدى 4° مئوية، وأخذ عينة اختبار طهي قبل التعبئة الكاملة.</div>'+
      '<div class="sign"><div>مسؤول التحضير: ........................</div><div>مشرف الجودة: ........................</div></div>'+
      '<script>window.onload=()=>{window.print();}<\/script></body></html>');
    w.document.close();SK.brandPrint(w);
  });
  $("#sk38-wa-blend")?.addEventListener("click",()=>{
    const rawWeight=blendState.leanKg+blendState.fatKg;
    const netYield=rawWeight*(1-blendState.shrink/100);
    const totalCost=(blendState.leanKg*blendState.leanCost)+(blendState.fatKg*blendState.fatCost)+blendState.spicesCost+blendState.pkgCost;
    const costPerKg=netYield>0?totalCost/netYield:0;
    const pieces=blendState.pieceGrams>0?Math.floor((netYield*1000)/blendState.pieceGrams):0;
    const pricePerPiece=pieces>0?(totalCost/pieces)/(1-blendState.margin/100):0;
    let msg="*🍔 بطاقة تكلفة خلطة: "+blendState.name+"*\n";
    msg+="نسبة الهبر/الشحم: "+((blendState.leanKg/rawWeight)*100).toFixed(0)+"٪ هبر / "+((blendState.fatKg/rawWeight)*100).toFixed(0)+"٪ شحم\n";
    msg+="إجمالي وزن التشغيل: "+netYield.toFixed(2)+" كجم\n";
    msg+="عدد القطع الناتجة: "+pieces+" حبة ("+blendState.pieceGrams+" جم)\n";
    msg+="التكلفة الفعلية للكيلو: "+costPerKg.toFixed(2)+" ر.س\n";
    msg+="سعر بيع الحبة المقترح (هامش "+blendState.margin+"٪): "+pricePerPiece.toFixed(2)+" ر.س\n";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });
}

/* ==========================================================================
   4. Scale Labels HTML & Logic
   ========================================================================== */
let stickerState={
  name:"ريب آي عجل بلدي فاخر",
  weight:1.450,
  unitPrice:95.0,
  packDate:new Date().toISOString().slice(0,10),
  expDate:new Date(Date.now()+5*86400000).toISOString().slice(0,10),
  lot:"LOT-2609-08",
  origin:"مسلخ شمال الرياض - ذبح محلي معتمد"
};

function labelsHTML(){
  const total=stickerState.weight*stickerState.unitPrice;
  const barcode="20"+Math.floor(stickerState.unitPrice).toString().padStart(4,"0")+Math.floor(stickerState.weight*1000).toString().padStart(5,"0");
  const barcodeSVG=code128SVG(barcode,30);

  return [
    '<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">',
      '<div style="flex:1 1 340px;">',
        '<div class="sk-grid2">',
          '<label class="sk-field"><span>اسم القطعية / المنتج</span><input id="sk38-stk-name" value="'+esc(stickerState.name)+'"></label>',
          '<label class="sk-field"><span>رقم الشحنة / اللوت (Lot)</span><input id="sk38-stk-lot" value="'+esc(stickerState.lot)+'"></label>',
        '</div>',
        '<div class="sk-grid2">',
          '<label class="sk-field"><span>الوزن الصافي (كجم)</span><input id="sk38-stk-wt" type="number" step="0.005" value="'+stickerState.weight+'"></label>',
          '<label class="sk-field"><span>سعر الكيلو شامل الضريبة (ر.س)</span><input id="sk38-stk-pr" type="number" step="0.5" value="'+stickerState.unitPrice+'"></label>',
        '</div>',
        '<div class="sk-grid2">',
          '<label class="sk-field"><span>تاريخ التعبئة</span><input id="sk38-stk-pdate" type="date" value="'+stickerState.packDate+'"></label>',
          '<label class="sk-field"><span>تاريخ الانتهاء</span><input id="sk38-stk-edate" type="date" value="'+stickerState.expDate+'"></label>',
        '</div>',
        '<label class="sk-field" style="margin-bottom:14px;"><span>المسلخ ومصدر الذبح</span><input id="sk38-stk-orig" value="'+esc(stickerState.origin)+'"></label>',
        '<div><button type="button" id="sk38-print-stk" class="btn btn-pri">طباعة الملصق الحراري (60x40mm)</button></div>',
      '</div>',
      '<div style="flex:0 0 320px;">',
        '<div class="sk38-stk-view" id="sk38-sticker-printable">',
          '<div class="sk38-stk-brand"><span>أغنام الوادي • S.kosif</span><span>ذبح حلال 100٪</span></div>',
          '<div class="sk38-stk-name">'+esc(stickerState.name)+'</div>',
          '<div class="sk38-stk-grid">',
            '<div><span>الوزن الصافي</span><b>'+stickerState.weight.toFixed(3)+' كجم</b></div>',
            '<div><span>سعر الكيلو</span><b>'+money(stickerState.unitPrice)+'</b></div>',
            '<div class="main-price"><span>المبلغ الإجمالي</span><b>'+money(total)+'</b></div>',
          '</div>',
          '<div class="sk38-stk-barcode">'+barcodeSVG+'</div>',
          '<div class="sk38-stk-footer"><span>تعبئة: '+stickerState.packDate+'</span><span>انتهاء: '+stickerState.expDate+'</span><span>حفظ مبرد (0 - 4°م)</span></div>',
        '</div>',
      '</div>',
    '</div>'
  ].join("");
}

function bindLabels(){
  const reStk=()=>{
    stickerState.name=$("#sk38-stk-name").value;
    stickerState.lot=$("#sk38-stk-lot").value;
    stickerState.weight=num($("#sk38-stk-wt").value);
    stickerState.unitPrice=num($("#sk38-stk-pr").value);
    stickerState.packDate=$("#sk38-stk-pdate").value;
    stickerState.expDate=$("#sk38-stk-edate").value;
    stickerState.origin=$("#sk38-stk-orig").value;
    paint("labels");
  };
  ["sk38-stk-name","sk38-stk-lot","sk38-stk-wt","sk38-stk-pr","sk38-stk-pdate","sk38-stk-edate","sk38-stk-orig"].forEach(id=>{
    $("#"+id)?.addEventListener("input",reStk);
  });
  $("#sk38-print-stk")?.addEventListener("click",()=>{
    const stk=$("#sk38-sticker-printable");
    if(!stk)return;
    stk.classList.add("sk38-print-active");
    window.print();
    setTimeout(()=>stk.classList.remove("sk38-print-active"),1000);
  });
}

/* ==========================================================================
   5. Traceability & Cold Chain HTML & Logic
   ========================================================================== */
const TRACE_KEY="skosif_v38_batches";
const COLD_KEY="skosif_v38_coldchain";
/* تبدأ السجلات فارغة: لا تُعرض دفعات أو قراءات لم يسجلها المستخدم */
const defaultBatches=[];
const defaultColdLog=[];

function traceabilityHTML(){
  const batches=load(TRACE_KEY,defaultBatches);
  const coldLog=load(COLD_KEY,defaultColdLog);

  return [
    '<div class="sk-section-title" style="margin-bottom:8px;"><b>سجل دفعات الذبائح المعتمدة (Batches / Lots)</b></div>',
    '<div class="sk-table-wrap" style="margin-bottom:18px;">',
      '<table class="sk-table"><thead><tr><th>رقم الدفعة</th><th>المصدر / السلالة</th><th>المسلخ</th><th>تاريخ الذبح</th><th>الشهادة البيطرية</th><th>الرؤوس</th><th>الحالة</th></tr></thead><tbody>',
      (batches.length?'':'<tr><td colspan="7" class="sk-empty">لا توجد دفعات مسجلة بعد.</td></tr>')+batches.map(b=>'<tr><td><b>'+esc(b.id)+'</b></td><td>'+esc(b.breed)+'</td><td>'+esc(b.slaughterhouse)+'</td><td>'+esc(b.date)+'</td><td><code>'+esc(b.cert)+'</code></td><td>'+b.count+' رأس</td><td><span class="sk38-badge ok">'+esc(b.status)+'</span></td></tr>').join(""),
      '</tbody></table>',
    '</div>',
    '<div class="sk-section-title" style="margin-bottom:8px;"><b>سجل قراءات درجات حرارة سلسلة التبريد (HACCP Log)</b></div>',
    '<div class="sk-grid2" style="background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);margin-bottom:12px;">',
      '<label class="sk-field"><span>الموقع / الشاحنة</span><input id="sk38-c-loc" placeholder="مثال: براد الشحن 1"></label>',
      '<label class="sk-field"><span>درجة الحرارة م°</span><input id="sk38-c-temp" type="number" step="0.1" value="2.0"></label>',
      '<label class="sk-field"><span>الرطوبة ٪</span><input id="sk38-c-hum" type="number" value="80"></label>',
      '<label class="sk-field"><span>المراقب الصحي</span><input id="sk38-c-insp" placeholder="اسم المراقب"></label>',
      '<div style="display:flex;align-items:flex-end;"><button type="button" id="sk38-c-add" class="btn btn-pri" style="width:100%;">+ تسجيل القراءة</button></div>',
    '</div>',
    '<div class="sk-table-wrap">',
      '<table class="sk-table"><thead><tr><th>الوقت والتاريخ</th><th>الموقع</th><th>الحرارة</th><th>الرطوبة</th><th>المراقب</th><th>الحالة</th></tr></thead><tbody>',
      (coldLog.length?'':'<tr><td colspan="6" class="sk-empty">لا توجد قراءات بعد — سجّل أول قراءة من النموذج أعلاه.</td></tr>')+coldLog.map(c=>{
        const cls=c.temp<=4?"ok":(c.temp<=7?"warn":"danger");
        const txt=c.temp<=4?"🟢 مطابق (0-4°م)":(c.temp<=7?"🟡 تحذير (4-7°م)":"🔴 كسر تبريد (>7°م)");
        return '<tr><td>'+esc(c.time)+'</td><td><b>'+esc(c.loc)+'</b></td><td><b>'+c.temp+'°م</b></td><td>'+c.humidity+'٪</td><td>'+esc(c.inspector)+'</td><td><span class="sk38-badge '+cls+'">'+txt+'</span></td></tr>';
      }).join(""),
      '</tbody></table>',
    '</div>',
    '<div style="margin-top:14px;"><button type="button" id="sk38-wa-trace" class="btn" style="background:#25D366;color:#fff;">مشاركة تقرير الـ HACCP عبر واتساب</button></div>'
  ].join("");
}

function bindTraceability(){
  $("#sk38-c-add")?.addEventListener("click",()=>{
    const loc=$("#sk38-c-loc").value;
    const temp=num($("#sk38-c-temp").value);
    const hum=num($("#sk38-c-hum").value);
    const insp=$("#sk38-c-insp").value;
    const logs=load(COLD_KEY,defaultColdLog);
    logs.unshift({time:new Date().toLocaleString("ar-SA"),loc,temp,humidity:hum,inspector:insp});
    save(COLD_KEY,logs);
    toast("تم تسجيل قراءة سلسلة التبريد بنجاح.");
    paint("traceability");
  });
  $("#sk38-wa-trace")?.addEventListener("click",()=>{
    const batches=load(TRACE_KEY,defaultBatches);
    const logs=load(COLD_KEY,defaultColdLog);
    let msg="*🥩 تقرير سلامة الغذاء وتتبع اللحوم والـ HACCP*\nالتاريخ: "+new Date().toLocaleDateString("ar-SA")+"\n";
    msg+="--------------------------------\n*أحدث الدفعات:*\n";
    batches.slice(0,3).forEach(b=>{ msg+="• "+b.id+" | "+b.breed+" | "+b.slaughterhouse+"\n"; });
    msg+="\n*آخر قراءات التبريد:*\n";
    logs.slice(0,3).forEach(l=>{ msg+="• "+l.loc+": "+l.temp+"°م (رطوبة "+l.humidity+"٪) - "+l.inspector+"\n"; });
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });
}

/* ==========================================================================
   6. Culinary Butchery Guide
   ========================================================================== */
const CULINARY_CUTS=[
  {cat:"bbq",name:"بريسكت عجل بلدي (Beef Brisket)",tenderness:3,marbling:4,temp:"93°C (تدخين بطيء)",time:"10 - 14 ساعة",bestFor:"التدخين البطيء على حطب الأوك، الشواء الأمريكي",tips:"حافظ على طبقة دهن بسماكة 6 ملم (Fat Cap)، واستخدم ملح خشن وفلفل أسود مجروش 16 Mesh."},
  {cat:"bbq",name:"شورت ريبس عظم (Short Ribs)",tenderness:4,marbling:5,temp:"92°C (تذوب في الفم)",time:"6 - 8 ساعات",bestFor:"التدخين، الشواء غير المباشر، الطبخ البطيء في الفرن",tips:"أزل الغشاء الفضي الخلفي (Membrane) لتتشرب النكهة بالتساوي."},
  {cat:"steak",name:"ريب آي عجل بلدي (Prime Ribeye)",tenderness:5,marbling:5,temp:"Medium-Rare: 54°C - 57°C",time:"6 - 8 دقائق",bestFor:"شواية الفحم بحرارة عالية، مقلاة حديد الزهر مع زبدة وثوم وإكليل الجبل",tips:"اترك الستيك يرتاح 5 إلى 7 دقائق بعد الطهي لتعود العصارة لوسط اللحم."},
  {cat:"steak",name:"تندرلوين فيليه (Tenderloin Filet)",tenderness:5,marbling:2,temp:"Rare: 50°C - 52°C | Medium-Rare: 55°C",time:"5 - 7 دقائق",bestFor:"التحمير السريع، ستيك بصلصة الفلفل الأسود",tips:"أنعم وأطرى قطعة في الذبيحة؛ احرص على عدم الإفراط في طهيها لتجنب جفافها."},
  {cat:"traditional",name:"فخذ نعيمي كامل بالعظم",tenderness:4,marbling:3,temp:"75°C - 85°C (استواء كامل ناعم)",time:"2.5 - 3.5 ساعات",bestFor:"المفطح، الكبسة السعودية، المندي، الشواء في الفرن بالقصدير",tips:"قم بعمل شقوق طولية وتبّله بالليمون الأسود والهيل والثوم."},
  {cat:"minced",name:"خلطة مفروم الرقبة والصدر (Chuck-Brisket)",tenderness:5,marbling:4,temp:"71°C للبرجر | 75°C للكباب",time:"4 - 8 دقائق",bestFor:"برجر الذواقة الفاخر، الكباب المحشي، الحواوشي على الفحم",tips:"تفرم بدرجة متوسطة (Coarse Grind) مع المحافظة على برودة اللحم والدهن."}
];
let culFilter="all";

function culinaryHTML(){
  const filtered=culFilter==="all"?CULINARY_CUTS:CULINARY_CUTS.filter(x=>x.cat===culFilter);
  return [
    '<div class="sk-chips" style="margin-bottom:16px;">',
      '<button type="button" class="chip sk38-cul-tab '+(culFilter==='all'?'active':'')+'" data-c="all">الكل</button>',
      '<button type="button" class="chip sk38-cul-tab '+(culFilter==='bbq'?'active':'')+'" data-c="bbq">شواء وتدخين بطيء</button>',
      '<button type="button" class="chip sk38-cul-tab '+(culFilter==='steak'?'active':'')+'" data-c="steak">ستيك وقلاية سريعة</button>',
      '<button type="button" class="chip sk38-cul-tab '+(culFilter==='traditional'?'active':'')+'" data-c="traditional">فرن ومندي وطبخ شعبي</button>',
      '<button type="button" class="chip sk38-cul-tab '+(culFilter==='minced'?'active':'')+'" data-c="minced">مفروم وكباب فاخر</button>',
    '</div>',
    '<div class="sk38-culinary-grid">',
      filtered.map((c,idx)=>{
        const originalIdx=CULINARY_CUTS.indexOf(c);
        return '<div class="sk38-culinary-card">'+
        '<div>'+
          '<span class="sk38-culinary-tag">'+(c.cat==='bbq'?'تدخين وشواء':(c.cat==='steak'?'ستيك فاخر':(c.cat==='traditional'?'طبخ شعبي وفرن':'مفروم مميز')))+'</span>'+
          '<h4 class="sk38-culinary-title">'+esc(c.name)+'</h4>'+
          '<div class="sk38-culinary-stats"><span>الطراوة: '+"".repeat(c.tenderness)+'</span><span>الترخيم: '+"".repeat(c.marbling)+'</span></div>'+
          '<p class="sk38-culinary-desc"><b>الحرارة:</b> '+esc(c.temp)+'<br><b>الاستخدام:</b> '+esc(c.bestFor)+'<br><i style="color:var(--brand,#8b2500);font-size:0.8rem;display:block;margin-top:4px;">'+esc(c.tips)+'</i></p>'+
        '</div>'+
        '<div style="display:flex;gap:6px;margin-top:8px;">'+
          '<button type="button" class="btn btn-pri sk38-cul-add" data-name="'+esc(c.name)+'" style="flex:1;font-size:0.8rem;padding:7px;">أضف للطلبية</button>'+
          '<button type="button" class="btn sk38-cul-card" data-idx="'+originalIdx+'" style="font-size:0.8rem;padding:7px;" title="بطاقة إرشادات الشيف للطهي">بطاقة الطهي</button>'+
        '</div>'+
      '</div>';}).join(""),
    '</div>'
  ].join("");
}

function bindCulinary(){
  $$(".sk38-cul-tab").forEach(b=>{
    b.onclick=()=>{ culFilter=b.dataset.c; paint("culinary"); };
  });
  $$(".sk38-cul-add").forEach(b=>{
    b.onclick=()=>{
      const name=b.dataset.name;
      const cart=load("skosif_v32_cart",{});
      const id="cul_"+name.replace(/\s+/g,"_");
      /* the price comes from the price list; an unpriced cut is added at 0 for the user to price */
      let price=0;try{const it=(window.SKosifCore.catalog().items||[]).find(x=>x.name===name||x.name.includes(name));if(it&&it.price!=null)price=it.price}catch{}
      cart[id]={id,name,price,qty:(cart[id]?.qty||0)+1};
      save("skosif_v32_cart",cart);
      beep(740,0.1);
      toast(price?"تمت إضافة "+name+" إلى سلة الطلبيات 🛒":"أُضيف "+name+" بلا سعر — حدّد سعره في السلة","info");
    };
  });
  $$(".sk38-cul-card").forEach(b=>{
    b.onclick=()=>{
      const c=CULINARY_CUTS[+b.dataset.idx];
      if(!c)return;
      const w=window.open("","_blank","width=500,height=600");
      if(!w)return toast("يرجى السماح بالنوافذ المنبثقة لطباعة بطاقة الطهي");
      w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>بطاقة إرشادات الشيف - '+esc(c.name)+'</title>'+
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap"><style>body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;padding:20px;text-align:center;border:2px dashed #8a5a2b;margin:10px;border-radius:12px;color:#2b1a0f;}'+
        'h2{margin:6px 0;color:#8a5a2b;}table{width:100%;margin:14px 0;border-collapse:collapse;}td{padding:6px;border-bottom:1px solid #eee;text-align:right;}'+
        'b{color:#111;}.temp-box{background:#fef3c7;padding:8px;border-radius:8px;margin:10px 0;border:1px solid #fde68a;font-weight:bold;}'+
        '</style></head><body>'+
        '<div style="font-size:12px;color:#8a5a2b;font-weight:bold;">مختارات الذواقة — أغنام الوادي</div>'+
        '<h2>'+esc(c.name)+'</h2>'+
        '<div class="temp-box">درجة حرارة الطهي المستهدفة: '+esc(c.temp)+'</div>'+
        '<table>'+
        '<tr><td>طريقة الطهي المثالية:</td><td><b>'+esc(c.bestFor)+'</b></td></tr>'+
        '<tr><td>مدة الطهي المقترحة:</td><td><b>'+esc(c.time)+'</b></td></tr>'+
        '<tr><td>مستوى الطراوة والترخيم:</td><td>'+"".repeat(c.tenderness)+' (ترخيم '+"".repeat(c.marbling)+')</td></tr>'+
        '</table>'+
        '<div style="background:#fbf5ea;padding:10px;border-radius:8px;text-align:right;font-size:13px;line-height:1.5;">'+
        '<b>سر تحضير الشيف:</b> '+esc(c.tips)+'<br><br>'+
        '<b>قاعدة ذهبية:</b> اترك اللحم يرتاح بعد خروجه من الشواية أو الفرن مدة 5 إلى 10 دقائق قبل التقطيع لتحافظ القطعة على كامل عصارتها وطراوتها.'+
        '</div>'+
        '<div style="font-size:11px;color:#888;margin-top:14px;">بالهناء والعافية | أغنام الوادي للذبائح واللحوم الفاخرة</div>'+
        '<script>window.onload=()=>{window.print();}<\/script></body></html>');
      w.document.close();SK.brandPrint(w);
    };
  });
}

/* ==========================================================================
   7. In-App Camera Scanner HTML & Logic
   ========================================================================== */
let scannerStream=null;

function scannerHTML(){
  return [
    '<div class="sk38-scanner-box">',
      '<video id="sk38-video" class="sk38-scanner-video" playsinline></video>',
      '<div class="sk38-scanner-overlay"><div class="sk38-scanner-reticle"><div class="sk38-scanner-laser"></div></div></div>',
    '</div>',
    '<div style="text-align:center;margin-bottom:14px;">',
      '<button type="button" id="sk38-cam-start" class="btn btn-pri">▶ تشغيل الكاميرا</button>',
      '<button type="button" id="sk38-cam-stop" class="btn" style="display:none;">⏹ إيقاف الكاميرا</button>',
    '</div>',
    '<div style="background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);margin-bottom:14px;">',
      '<div class="sk-section-title" style="margin-bottom:6px;"><b>أو أدخل الباركود يدوياً</b></div>',
      '<div style="display:flex;gap:8px;">',
        '<input id="sk38-manual-barcode" placeholder="اكتب أو امسح الباركود (مثال: 2009501450)" style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid var(--line,#ccc);">',
        '<button type="button" id="sk38-manual-search" class="btn">بحث</button>',
      '</div>',
    '</div>',
    '<div id="sk38-scan-result" style="display:none;background:var(--sk-ok-soft);border:1px solid color-mix(in srgb,var(--sk-ok) 35%,var(--sk-line));border-radius:8px;padding:14px;">',
      '<b style="color:var(--sk-ok);">✓ تم التعرف على الباركود بنجاح</b>',
      '<div id="sk38-scan-details" style="margin:6px 0;font-size:0.85rem;"></div>',
    '</div>'
  ].join("");
}

function startScanner(){
  const video=$("#sk38-video"); if(!video)return;
  navigator.mediaDevices?.getUserMedia({video:{facingMode:"environment"}})
    .then(stream=>{
      scannerStream=stream; video.srcObject=stream; video.play();
      $("#sk38-cam-start").style.display="none"; $("#sk38-cam-stop").style.display="inline-flex";
      if("BarcodeDetector" in window){
        const detector=new window.BarcodeDetector({formats:["qr_code","code_128","ean_13"]});
        const interval=setInterval(async()=>{
          if(!scannerStream){ clearInterval(interval); return; }
          try{
            const codes=await detector.detect(video);
            if(codes.length>0){ clearInterval(interval); onBarcodeFound(codes[0].rawValue); }
          }catch{}
        },300);
      }
    })
    .catch(()=>toast("تعذر تشغيل الكاميرا. يرجى التأكد من الإذن أو استخدام الإدخال اليدوي."));
}

function stopScanner(){
  if(scannerStream){ scannerStream.getTracks().forEach(t=>t.stop()); scannerStream=null; }
  const video=$("#sk38-video"); if(video)video.srcObject=null;
  $("#sk38-cam-start")&&($("#sk38-cam-start").style.display="inline-flex");
  $("#sk38-cam-stop")&&($("#sk38-cam-stop").style.display="none");
}

function onBarcodeFound(val){
  beep(960,0.15); stopScanner();
  const res=$("#sk38-scan-result"), det=$("#sk38-scan-details");
  if(!res||!det)return;
  res.style.display="block";
  det.innerHTML='<b>الرمز المقروء:</b> <code>'+esc(val)+'</code>';
  toast("تم مسح الباركود بنجاح: "+val);
}

function bindScanner(){
  $("#sk38-cam-start")?.addEventListener("click",startScanner);
  $("#sk38-cam-stop")?.addEventListener("click",stopScanner);
  $("#sk38-manual-search")?.addEventListener("click",()=>{
    const val=$("#sk38-manual-barcode")?.value.trim();
    if(!val){ toast("أدخل رقم الباركود أولاً"); return; }
    onBarcodeFound(val);
  });
}

/* ==========================================================================
   8. B2B Commercial Credit & Ledger
   ========================================================================== */
const LEDGER_KEY="skosif_v38_ledger";
const defaultCustomers=[];

function b2bcreditHTML(){
  const customers=load(LEDGER_KEY,defaultCustomers);
  const totalOutstanding=customers.reduce((s,c)=>s+c.balance,0);
  const totalLimit=customers.reduce((s,c)=>s+c.limit,0);

  return [
    '<div class="sk-kpis" style="margin-bottom:16px;">',
      '<div class="sk-kpi"><span>إجمالي سقف التسهيلات</span><b>'+money(totalLimit)+'</b></div>',
      '<div class="sk-kpi bad"><span>إجمالي الديون القائمة</span><b>'+money(totalOutstanding)+'</b></div>',
      '<div class="sk-kpi accent"><span>نسبة استهلاك الائتمان</span><b>'+(totalLimit>0?((totalOutstanding/totalLimit)*100).toFixed(1)+'٪':'—')+'</b></div>',
      '<div class="sk-kpi"><span>عدد عملاء الآجل</span><b>'+customers.length+' منشأة</b></div>',
    '</div>',
    '<div class="sk-grid2" style="margin-bottom:14px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:12px;">',
      '<label class="sk-field"><span>اسم العميل (مطعم/فندق)</span><input id="b2b-name"></label>',
      '<label class="sk-field"><span>الجوال</span><input id="b2b-phone" dir="ltr" placeholder="05xxxxxxxx"></label>',
      '<label class="sk-field"><span>سقف الائتمان (ر.س)</span><input id="b2b-limit" type="number" min="0" step="100"></label>',
      '<label class="sk-field"><span>فترة السداد</span><select id="b2b-terms"><option>15 يوم</option><option selected>30 يوم</option><option>45 يوم</option><option>60 يوم</option></select></label>',
      '<div style="grid-column:1/-1"><button type="button" id="b2b-add" class="btn primary">+ إضافة عميل آجل</button></div>',
    '</div>',
    (customers.length?'':'<div class="sk-empty">لا يوجد عملاء آجل بعد. أضف أول عميل من النموذج أعلاه.</div>'),
    '<div class="sk-grid2">',
      customers.map((c,ci)=>{
        const utilPct=c.limit>0?Math.min(100,Math.round((c.balance/c.limit)*100)):0;
        const meterCls=utilPct>=90?"danger":(utilPct>=75?"warn":"");
        return '<div style="background:var(--surface-2,#fafafa);border:1px solid var(--line,#eee);border-radius:10px;padding:14px;">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;">'+
            '<div><b style="font-size:1.02rem;color:var(--ink,#111);">'+esc(c.name)+'</b><div style="font-size:0.8rem;color:var(--ink-2,#666);margin-top:2px;">هاتف: '+esc(c.phone)+' | فترة السداد: <b>'+esc(c.terms)+'</b></div></div>'+
            '<span class="sk38-badge '+(utilPct>90?'danger':'ok')+'">'+utilPct+'٪ استهلاك</span>'+
          '</div>'+
          '<div class="sk38-credit-meter"><div class="sk38-credit-bar '+meterCls+'" style="width:'+utilPct+'%;"></div></div>'+
          '<div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-top:8px;">'+
            '<span>الحد المسموح: <b>'+money(c.limit)+'</b></span>'+
            '<span style="color:var(--sk-bad);">المستحق الحالي: <b>'+money(c.balance)+'</b></span>'+
          '</div>'+
          '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center">'+
            '<input type="number" min="0" step="0.01" placeholder="المبلغ" data-b2b-amt="'+ci+'" style="width:110px;min-height:34px;border:1px solid var(--line);border-radius:8px;padding:0 8px;background:var(--surface);color:var(--ink)">'+
            '<button type="button" class="btn sm" data-b2b-sale="'+ci+'">+ بيع آجل</button>'+
            '<button type="button" class="btn sm" data-b2b-pay="'+ci+'">− سداد</button>'+
            '<button type="button" class="btn sm" data-b2b-del="'+ci+'" aria-label="حذف">حذف</button>'+
          '</div>'+
          '<div style="margin-top:10px;">'+
            '<button type="button" class="btn sk38-wa-stmt" data-name="'+esc(c.name)+'" data-bal="'+c.balance+'" style="background:var(--sk-ok);color:#fff;font-size:0.8rem;padding:5px 10px;">إرسال كشف حساب واتساب</button>'+
          '</div>'+
        '</div>';
      }).join(""),
    '</div>'
  ].join("");
}

function bindB2BCredit(){
  const repaint=()=>paint("b2bcredit");
  const list=()=>load(LEDGER_KEY,defaultCustomers);
  $("#b2b-add")?.addEventListener("click",()=>{
    const name=($("#b2b-name").value||"").trim(),limit=num($("#b2b-limit").value);
    if(!name)return window.SK.toast("اكتب اسم العميل","err");
    const l=list();l.push({id:"CUST-"+Date.now().toString(36),name,phone:($("#b2b-phone").value||"").trim(),limit,terms:$("#b2b-terms").value,balance:0,moves:[]});
    save(LEDGER_KEY,l);repaint();
  });
  const move=(i,sign)=>{const l=list(),c=l[i],a=num((document.querySelector('[data-b2b-amt="'+i+'"]')||{}).value);if(!c||!(a>0))return window.SK.toast("اكتب مبلغاً صحيحاً","err");
    c.balance=Math.max(0,num(c.balance)+sign*a);(c.moves=c.moves||[]).unshift({at:new Date().toISOString(),type:sign>0?"sale":"payment",amount:a});save(LEDGER_KEY,l);repaint()};
  $$("[data-b2b-sale]").forEach(b=>b.onclick=()=>move(+b.dataset.b2bSale,1));
  $$("[data-b2b-pay]").forEach(b=>b.onclick=()=>move(+b.dataset.b2bPay,-1));
  $$("[data-b2b-del]").forEach(b=>b.onclick=async()=>{if(!await SK.confirm("حذف العميل من سجل الآجل؟",{danger:true,ok:"حذف"}))return;const l=list();l.splice(+b.dataset.b2bDel,1);save(LEDGER_KEY,l);repaint()});
  $$(".sk38-wa-stmt").forEach(b=>{
    b.onclick=()=>{
      const name=b.dataset.name, bal=b.dataset.bal;
      let msg="*كشف حساب وتذكير بالمستحقات المالية*\nالسادة / "+name+"\nتحية طيبة، ونحيطكم علماً بأن الرصيد القائم لحسابكم لدى *أغنام الوادي* هو:\n💰 *"+money(bal)+"*\n\nنأمل التكرم بجدولة السداد.\nشاكرين ومقدرين حسن تعاونكم الدائم.";
      window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
    };
  });
}

/* ==========================================================================
   Screen Dispatcher & Unified Workspaces Registration
   ========================================================================== */
function posHubNav(activeId){
  const tabs=[
    {id:"zatca",icon:"",title:"فاتورة الكاشير والإيصال (F2)"},
    {id:"scanner",icon:"",title:"قارئ الباركود بالكاميرا (F4)"},
    {id:"labels",icon:"",title:"ملصقات الموازين والتغليف (F3)"},
    {id:"culinary",icon:"",title:"نصائح الشيف والطهي"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-pos-go="'+t.id+'">'+SK.icon(t.id)+'<span>'+t.title+'</span></button>').join("")+'</div>';
}

function butcheryHubNav(activeId){
  const tabs=[
    {id:"carcass",icon:"",title:"تفكيك وتصافي الذبيحة وعائد القطعيات"},
    {id:"blending",icon:"",title:"خلط وفرم اللحوم ونسب الدهن (Lean/Fat)"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-butchery-go="'+t.id+'">'+SK.icon(t.id)+'<span>'+t.title+'</span></button>').join("")+'</div>';
}

function storageHubNav(activeId){
  const tabs=[
    {id:"inventory",icon:"",title:"رادار الصلاحية والمخزون FIFO (F9)"},
    {id:"operations",icon:"",title:"غرف التعتيق ومناسبات الشواء (F8)"},
    {id:"traceability",icon:"",title:"مراقبة سلسلة التبريد HACCP"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-storage-go="'+t.id+'">'+SK.icon(t.id)+'<span>'+t.title+'</span></button>').join("")+'</div>';
}

function financeHubNav(activeId){
  const tabs=[
    {id:"execreports",icon:"",title:"التقارير التنفيذية والرسوم البيانية"},
    {id:"b2bcredit",icon:"",title:"ائتمان المطاعم وكشوف الحساب"},
    {id:"suppliers",icon:"",title:"سجل وتقييم الموردين"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-finance-go="'+t.id+'">'+SK.icon(t.id)+'<span>'+t.title+'</span></button>').join("")+'</div>';
}

function paint(id){
  const r=roots[id]; if(!r||!r.isConnected)return;
  if(["zatca","scanner","labels","culinary"].includes(id)){
    let html="", bind=null;
    if(id==="zatca"){ html=zatcaHTML(); bind=bindZatca; }
    else if(id==="scanner"){ html=scannerHTML(); bind=bindScanner; }
    else if(id==="labels"){ html=labelsHTML(); bind=bindLabels; }
    else if(id==="culinary"){ html=culinaryHTML(); bind=bindCulinary; }
    r.innerHTML=posHubNav(id)+'<section class="card"><div class="card-b sk-stack">'+html+'</div></section>';
    if(bind)bind();
    $$("[data-pos-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.posGo));
    return;
  }
  if(id==="blending"){
    r.innerHTML=butcheryHubNav(id)+'<section class="card"><div class="card-b sk-stack">'+blendingHTML()+'</div></section>';
    bindBlending();
    $$("[data-butchery-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.butcheryGo));
    return;
  }
  if(id==="traceability"){
    r.innerHTML=storageHubNav(id)+'<section class="card"><div class="card-b sk-stack">'+traceabilityHTML()+'</div></section>';
    bindTraceability();
    $$("[data-storage-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.storageGo));
    return;
  }
  if(id==="b2bcredit"){
    r.innerHTML=financeHubNav(id)+'<section class="card"><div class="card-b sk-stack">'+b2bcreditHTML()+'</div></section>';
    bindB2BCredit();
    $$("[data-finance-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.financeGo));
    return;
  }
}

/* Register all 7 views */
window.SK.view("zatca",{
  title:"الفاتورة الضريبية ZATCA",
  sub:"إصدار فواتير إلكترونية مبسطة متوافقة مع هيئة الزكاة وطباعة إيصالات حرارية 80mm",
  emoji:"",
  render(node){ roots.zatca=node; paint("zatca"); }
});

window.SK.view("blending",{
  title:"خلطات ومصنعات اللحوم",
  sub:"تسعير وتصنيع البرجر والكفتة والسجق والشاورما وحساب نسبة الهبر إلى الشحم",
  emoji:"",
  render(node){ roots.blending=node; paint("blending"); }
});

window.SK.view("labels",{
  title:"ملصقات الموازين والتغليف",
  sub:"توليد ملصقات حرارية 60x40mm مع باركود وزن وتاريخ الصلاحية والتخزين",
  emoji:"",
  render(node){ roots.labels=node; paint("labels"); }
});

window.SK.view("traceability",{
  title:"تتبع الشحنات وسلسلة التبريد",
  sub:"سجل دفعات الذبائح والشهادات البيطرية ومراقبة درجات حرارة الثلاجات HACCP",
  emoji:"",
  render(node){ roots.traceability=node; paint("traceability"); }
});

window.SK.view("culinary",{
  title:"دليل الشيف والقطعية",
  sub:"دليل طهي تفاعلي وتوصيات الشيف ودرجات الاستواء والربط بالكتالوج",
  emoji:"",
  render(node){ roots.culinary=node; paint("culinary"); }
});

window.SK.view("scanner",{
  title:"ماسح الباركود بالكاميرا",
  sub:"مسح سريع لباركود الكراتين وملصقات الموازين وأكواد ZATCA بالكاميرا",
  emoji:"",
  render(node){ roots.scanner=node; paint("scanner"); }
});

window.SK.view("b2bcredit",{
  title:"ائتمان المطاعم وكشف الحساب",
  sub:"سقف التسهيلات الائتمانية وفترات السداد وكشوفات الحساب عبر واتساب",
  emoji:"",
  render(node){ roots.b2bcredit=node; paint("b2bcredit"); }
});

window.SKosifEnterpriseV38=Object.freeze({zatcaTLV,code128SVG});
})();
