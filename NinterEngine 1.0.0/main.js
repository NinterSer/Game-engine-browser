//-----------------------------Область переменных---------------------------------
let deltaChange = 1000;
let LANGUAGE = "ru";
OBJECTS = {
	SPECIAL:{},
	STATIC:{},
	SPRITE:{}
};

//----------------------------Список ошибок---------------------------------------
error_ = {en:"",ru:""};
error_0 = {en:"id - is an automatically generated value",ru:"id - это автоматически создаваемое значение"};
error_1 = {en:"center is set via the method setCenter(x,y)",ru:"center устанавливается через метод setCenter(x,y)"};
error_2 = {en:"The setArea() method takes as an argument an array with coordinates, of the type [{x:0,y:0},{x:1,y:1}]",ru:"Метод setArea() принимает в качестве аргумента массив с координатами, по типу [{x:0,y:0},{x:1,y:1}]"};
error_3 = {en:"The value is not of type {x:0,y:0}",ru:"Значение не является типом {x:0,y:0}"}
error_4 = {en:"value is not of type {x:0,y:0,z:0}",ru:"Значение не является типом {x:0,y:0,z:0}"}
//--------------------------------------------------------------------------------

//--------------------------------------------------------------------------------

//-----------------------------Загрузка элементов---------------------------------

//--------------------------------------------------------------------------------

//-----------------------------Создание игрового окна-----------------------------
if(document.getElementById("NinterWindowsGame") == null){
	let WindowsGame = document.createElement('div');
	WindowsGame.setAttribute("id","NinterWindowsGame");
	document.body.appendChild(WindowsGame);
	//document.body.createElement("div")
}

if(document.getElementById("NinterWindowsGame").style.width != '100%' || document.getElementById("NinterWindowsGame").style.height != '100%' || document.getElementById("NinterWindowsGame").style.position != 'fixed'){
	let WindowsGame = document.getElementById("NinterWindowsGame").style;
	WindowsGame.position = "fixed";
	WindowsGame.width = "100%";
	WindowsGame.height = "100%";
	WindowsGame.left = "0px";
	WindowsGame.top = "0px";
}

//--------------------------------------------------------------------------------

//----------------------------Область предопределённых объектов---------------------------
var SCENE = {};
SCENE.HTML = document.createElement("div");
SCENE.HTML.setAttribute('id','SCENE');
document.getElementById("NinterWindowsGame").appendChild(SCENE.HTML);
SCENE.HTML.style.position = "relative";
SCENE.HTML.style.left = String(window.innerWidth/2)+"px";
SCENE.HTML.style.top = String(window.innerHeight/2)+"px";
SCENE.setPosition = function(x=0,y=0){
	SCENE.HTML.style.left = String(x+window.innerWidth/2)+"px";
	SCENE.HTML.style.top = String(y+window.innerHeight/2)+"px";
};
SCENE.position = {x:0,y:0}; SCENE.globalPosition = {x:0,y:0};
SCENE.rotate = 0; SCENE.globalRotate = 0;
SCENE.scale = {x:1,y:1}; SCENE.globalScale = {x:1,y:1};
SCENE.size = {x:0,y:0}; SCENE.globalSize = {x:0,y:0};
SCENE.parent = SCENE;
SCENE.childs = {};
OBJECTS.SPECIAL.SCENE = SCENE;


var coordinates = {
	windows:{x: window.innerWidth/2,y: window.innerHeight/2},
	x: 0, y:0,

	checkWindows: function() {
		if (coordinates.windows.x != window.innerWidth/2 || coordinates.windows.y !=  window.innerHeight/2){
			coordinates.windows.x = window.innerWidth/2; coordinates.windows.y =  window.innerHeight/2;
		}
	}
}
OBJECTS.SPECIAL.coordinates = coordinates;

var camera = {
	zoom: 1,
	position:{x:0,y:0}, globalPosition:{x:0,y:0},
	width:window.innerWidth,height:window.innerHeight,

	setPosition: function(x=0,y=0){
		SCENE.setPosition.x(x*-1, y*-1);
		camera.globalPosition.x = x; camera.position.x = x;
		camera.globalPosition.y = y; camera.position.y = y;
	},
	setGlobalPosition: function(x=0,y=0){
		SCENE.setPosition.x(x*-1, y*-1);
		camera.globalPosition.x = x; camera.position.x = x;
		camera.globalPosition.y = y; camera.position.y = y;
	},
	Move: function(x=0,y=0){
		SCENE.setPosition((x+camera.position.x)*-1,(y+camera.position.x)*-1);
		camera.globalPosition.x = x+camera.position.x; camera.position.x = x+camera.position.x;
		camera.globalPosition.y = y+camera.position.y; camera.position.y = y+camera.position.y;
	},
	checkSize: function(){
		if (camera.width != window.innerWidth || camera.height !=  window.innerHeight){
			camera.width = window.innerWidth; camera.height =  window.innerHeight;
		}
	}
}
OBJECTS.SPECIAL.camera = camera;


class PRELOADRESOURCES {
	IMAGE = [];
	status = 0;
	get LENGTH(){return this.IMAGE.length};
	set image(image){this.IMAGE[this.IMAGE.length] = image};
	start(){
		this.status = 0;
		let step = 100/this.LENGTH; 
		for (let i=0; i<this.IMAGE.length; i++){
			let img = new Image;
			img.onload = ()=>{
				this.status+=step;
				this.event(this.status, this.IMAGE[i]);
			};
			img.src = this.IMAGE[i];
		}
	}
	event = function(status, resourve){
		null
	}
}

function preloadResources(resource=PRELOADRESOURCES){
	if (typeof resource != typeof {x:0,y:0}){
		null
	} else {
		//let preloadImage = src => (new Image().src = resource.IMAGE);
		resource.status = 0;
		let step = 100/resource.LENGTH; 
		for (let i=0; i<resource.IMAGE.length; i++){
			let img = new Image;
			img.onload = ()=>{resource.status+=step;};
			img.src = resource.IMAGE[i];
		}
	}
}
//----------------------------------------------------------------------------------------

//-----------------------------Постоянно выполняемые функции------------------------------
setInterval(function(){
	coordinates.checkWindows();
	camera.checkSize();
}, deltaChange);

//----------------------------------------------------------------------------------------

//-----------------------------Функции геометрии------------------------------------------
//Дистанция между двумя точками
function distanceBetweenPoints(point_1,point_2={x:0,y:0}){
	let result = Math.sqrt( Math.pow( point_1.x-point_2.x,2 ) + Math.pow( point_1.y-point_2.y,2 ) );
	return result
}

//Повернуть тучку на угол с центрои
function rotatePointAnAngle(corner,point,center={x:0,y:0}){
	corner = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
	let corner_start = 0;
	let corner_end = corner;
	let length = Math.sqrt(Math.pow(point.x-center.x,2)+Math.pow(point.y-center.y,2));
	if (point.x > center.x && point.y < center.y){
		corner_start = 90-Math.asin(Math.abs(center.y-point.y)/length)*180/Math.PI;
		corner_end += corner_start;
	}
	else if (point.x > center.x && point.y > center.y){
		corner_start = 90+Math.asin(Math.abs(center.y-point.y)/length)*180/Math.PI;
		corner_end += corner_start;
	}
	else if (point.x < center.x && point.y > center.y){
		corner_start = 270-Math.asin(Math.abs(center.y-point.y)/length)*180/Math.PI;
		corner_end += corner_start;
	}
	else if (point.x < center.x && point.y < center.y){
		corner_start = 270+Math.asin(Math.abs(center.y-point.y)/length)*180/Math.PI;
		corner_end += corner_start;
	}
	else if (point.x == center.x && point.y < center.y){
		corner_start = 0;
		corner_end += corner_start;
	}
	else if (point.x == center.x && point.y > center.y){
		corner_start = 180;
		corner_end += corner_start;
	}
	else if (point.x < center.x && point.y == center.y){
		corner_start = 270;
		corner_end += corner_start;
	}
	else if (point.x > center.x && point.y == center.y){
		corner_start = 90;
		corner_end += corner_start;
	}
	else if (point.x == center.x && point.y == center.y){
		return {x:point.x,y:point.y}
	};
	if (corner_end >= 360){corner_end-= 360;}

	if (corner_end == 0){
		return {x:center.x,y:center.y-length}
	}
	else if (corner_end == 180){
		return {x:center.x,y:center.y+length}
	}
	else if (corner_end == 90){
		return {x:center.x+length,y:center.y}
	}
	else if (corner_end == 270){
		return {x:center.x-length,y:center.y}
	}
	else if (corner_end > 0 && corner_end < 90){
		corner_start = corner_end*Math.PI/180;
		point.x = Math.sin(corner_start)*length+center.x;
		corner_end = (90-corner_end)*Math.PI/180;
		point.y = Math.sin(corner_end)*length*-1+center.y;
	}
	else if (corner_end > 90 && corner_end < 180){
		corner_start = (180-corner_end)*Math.PI/180;
		point.x = Math.sin(corner_start)*length+center.x;
		corner_end = (corner_end-90)*Math.PI/180;
		point.y = Math.sin(corner_end)*length+center.y;
	}
	else if (corner_end > 180 && corner_end < 270){
		corner_start = (corner_end-180)*Math.PI/180;
		point.x = Math.sin(corner_start)*length*-1+center.x;
		corner_end = (270-corner_end)*Math.PI/180;
		point.y = Math.sin(corner_end)*length+center.y;
	}
	else if (corner_end > 270 && corner_end < 360){
		corner_start = (360-corner_end)*Math.PI/180;
		point.x = Math.sin(corner_start)*length*-1+center.x;
		corner_end = (corner_end-270)*Math.PI/180;
		point.y = Math.sin(corner_end)*length*-1+center.y;
	};
	return {x:point.x, y:point.y}
}

function rotatePointAnAngle_notUse(corner, point, center={x:0,y:0}){
	corner = corner%360+(corner-Math.abs(corner))/(2*corner)*360;
	let degrees = 180/Math.PI;
	let x = point.x-center.x;
	let y = point.y-center.y;
	let l = Math.abs(y)/Math.sqrt(x*x+y*y);
	let corner_start = 135-45*(x/Math.abs(x))+(Math.asin(l)*degrees)*(x*y)/Math.abs(x*y)*-1;
	corner = corner_start+corner; corner = corner%360+(corner-Math.abs(corner))/(2*corner)*360;
	x = Math.cos(corner/degrees)*l*(180-corner)/Math.abs(180-corner);
	y = Math.sin(corner/degrees)*l*(corner-90)/Math.abs(corner-90)*(270-corner)/Math.abs(270-corner)*-1;
	return {x:x+center.x,y:y+center.y}
}

//Угол между прямыми

//Прочии функции
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function randomColor(code='rgb'){
	var result = '';
	if (code == 'rgb'){
		result = 'rgb('+String(getRandomInt(10, 240))+','+String(getRandomInt(10, 240))+','+String(getRandomInt(10, 240))+')';
	}
	else if (code == 'rgba'){
		result = 'rgba('+String(getRandomInt(10, 240))+','+String(getRandomInt(10, 240))+','+String(getRandomInt(10, 240))+','+String(getRandomInt(1, 10)/10)+')';
	};
	return result;
};

//установка метаданных изображения
function getMetaDataImage(src, object=null){
	if (object == null){
		console.log(null);
	} else {
		let img = new Image;
		img.onload = function(){
			if (object.width == 0){object.center.x = this.width/2;} else {object.center.x = object.center.x/object.width*this.width;};
			if (object.height == 0){object.center.y = this.height/2} else {object.center.y = object.center.y/object.height*this.height};
			object.width = this.width;
			object.height = this.height;
		}
		img.src = src;
	}
}

//----------------------------------------------------------------------------------------

//-----------------------------Создание объектов------------------------------------------
import { Sprite, Static } from './objects.js'
//----------------------------------------------------------------------------------------