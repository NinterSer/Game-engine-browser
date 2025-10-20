//import {mathLib} from './lib/math.js';
//const mathLib = new mathLib();
function Vector2D(x,y){return {x:x,y:y}};

function Frame2D(width, height, startPoint={x:0, y:0}){
	return {width:width, height:height, x:startPoint.x, y:startPoint.y}
}

function Size2D(width,height){return {width:width, height:height}};

function generateID(word='', countChars=8, dict=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']){
	let result = word;
	for(let i=0; i<countChars; i++){result+=dict[Math.floor(Math.random()*dict.length)];}
	return result
}

function randomColor(){
	let result = '#'
	let dict = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
	for(let i=0; i<6; i++){result+=dict[Math.floor(Math.random()*dict.length)];};
	return result
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = err => reject(err); 
    img.src = src;
    if (img.complete) resolve(img);
  });
}

function loadAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = err => reject(err);
    audio.src = src;
    audio.load();
    if (audio.readyState >= 4) resolve(audio);
  });
}

function loadJSON(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

function Area2Area(area1, area2){
	if(!mathLib.Circle2Circle(area1.globalCircle, area2.globalCircle))return false

	for(let point of area1.globalPoints()){
		if(mathLib.pointInPolygon(point, area2.globalArea))return true
	}

	for(let point of area2.globalPoints()){
		if(mathLib.pointInPolygon(point, area1.globalArea))return true
	}

	return false
}

function physicsArea2Area1(areaMove, areaWait, point={x:0,y:0}){
	point.x = 0; point.y = 0; point.distance = Infinity; point.result = false;

	if(!mathLib.Circle2Circle(areaMove.globalCircle, areaWait.globalCircle))return point

	for(let p of areaMove.globalPoints()){
		if(mathLib.pointInPolygon(p, areaWait.globalArea)){point.result = true; break}
	}

	for(let p of areaWait.globalPoints()){
		if(mathLib.pointInPolygon(p, areaMove.globalArea)){point.result = true; break}
	}

	if(point.result == false)return point
	for (let p1 of areaMove.globalPoints()) {
    for (let p2 of areaWait.globalPoints()) {
      const dx = p1.x - p2.x; // Разница по X
      const dy = p1.y - p2.y; // Разница по Y
      const distance = dx * dx + dy * dy; // Квадрат расстояния
            
      if (distance < point.distance) {
        point.distance = distance;
        point.x = dx; // расстояния по X
        point.y = dy; // расстояния по Y
      }
	  }
  }
  point.distance = Math.sqrt(point.distance);
  return point
}

function correctionStaticGlobalListArea2Area(targetArea, listArea, blackList, x=0, y=0, point={x:0, y:0}, typeRepeat=0, useArea=true, rotate=0){
	function correctionPositionStatic2Static(areaMove, areaWait, x=0, y=0, point={x:0, y:0, result: false}){
		/*let maxR = areaMove.globalMaxPoint(false, false, true);
		let minR = areaMove.globalMinPoint(false, false, true);
		x<0 ? minR.x+=x : maxR.x+=x;
		y<0 ? minR.y+=y : maxR.y+=y;
		if(mathLib.Rectangle2Rectangle(new Rectangle(maxR, minR), new Rectangle(areaWait.globalMaxPoint(false, false, true), areaWait.globalMinPoint(false, false, true)))==false)return point
		*/

		const xy = Math.sqrt(x**2+y**2);
		const {x:mx, y:my} = areaMove.globalPosition;
		const {x:wx, y:wy} = areaWait.globalPosition;
		const length = Math.sqrt((mx-wx)**2+(my-wy)**2);
		if(length>(areaMove.radius+xy+areaWait.radius))return point

		let max = 0; xR = 0; yR = 0;
		let enter = undefined;
		for(let p of areaMove.globalPoints()){
			const l = [p, {x:p.x+x, y:p.y+y}]
			const c = mathLib.segmentPolygonIntersection(l, areaWait.globalArea);
			for(let e of c){
				const maxT = (e.x-l[1].x)**2+(e.y-l[1].y)**2; 
				if(maxT>max){xR = e.x-l[1].x; yR = e.y-l[1].y; max = maxT; enter = e; }
			}
		}

		for(let p of areaWait.globalPoints()){
			const l = [p, {x:p.x-x, y:p.y-y}]
			const c = mathLib.segmentPolygonIntersection(l, areaMove.globalArea);
			for(let e of c){
				const maxT = (e.x-l[1].x)**2+(e.y-l[1].y)**2; 
				if(maxT>max){xR = l[1].x-e.x; yR = l[1].y-e.y; max = maxT; enter = e;}
			}
		}

		if(xR!=0 || yR!=0)point.result = true
		point.x = xR; point.y = yR; point.max = max; point.enter = enter;
		return point
	}

	function correctionRotateStatic2Static(areaMove, areaWait, x=0, y=0, rotate=0){
		//const xy = Math.sqrt(x**2+y**2);
		const {x:mx, y:my} = areaMove.globalPosition;
		const {x:wx, y:wy} = areaWait.globalPosition;
		const length = Math.sqrt((mx-wx)**2+(my-wy)**2);
		const startRotate = rotate;
		if(length>(areaMove.radius+areaWait.radius))return {rotate:rotate-startRotate, enterPoint:undefined}

		const center = Vector2D(x,y);
		const direct = startRotate/Math.abs(startRotate);
		rotate = Math.abs(rotate);
		let enterPoint = undefined;
		for (let pointR of areaMove.globalPoints()){
			for(let line of areaWait.globalLines()){
				const radius = Math.sqrt((x-pointR.x)**2+(y-pointR.y)**2);
				//console.log(radius);
				for(let point of mathLib.findIntersections({point:center, radius:radius}, line)){
					//console.log(center, pointR, point, mathLib.calculateAngle(center, pointR, point, typeCorner=0));
					let value = mathLib.calculateAngle(center, pointR, point, typeCorner=0);
					//value=value*direct;
					if(rotate>value){rotate=value; enterPoint=point; }
				}
			}
		}

		for (let pointR of areaWait.globalPoints()){
			for(let line of areaMove.globalLines()){
				const radius = Math.sqrt((x-pointR.x)**2+(y-pointR.y)**2);
				//console.log(radius);
				for(let point of mathLib.findIntersections({point:center, radius:radius}, line)){
					//console.log(center, pointR, point, mathLib.calculateAngle(center, pointR, point, typeCorner=0));
					let value = mathLib.calculateAngle(center, pointR, point, typeCorner=0);
					//value=value*direct;
					if(rotate>value){rotate=value; enterPoint=point;}
				}
			}
		}

		console.log(rotate==startRotate?0:(rotate*direct-startRotate-0.1*direct));
		return {rotate:rotate==startRotate?0:(rotate*direct-startRotate-0.1*direct), enterPoint:enterPoint}
	}

	blackList = blackList.map((e)=>{return e.id});
	targetArea.map((e)=>{blackList.push(e.id)});
	blackList = [...new Set(blackList)];
	let _ProxyPoint = {x:0, y:0, result:false}

	let max = 0; 
	let X = 0; 
	let Y = 0;
	let area_one = undefined;
	let area_two = undefined;
	let enter = undefined;
	let enterPoint = undefined;
	//let rotate = undefined;

	for(let area of listArea){
		if(blackList.includes(area.id))continue
		switch(area.typeArea){
		case typeArea.collision:
			for (let target of targetArea){
				enter = Area2Area(area, target);
				if(enter==false)break
				area_one = area;
				area_two = target;
			}
			break
		case typeArea.static:
			for (let target of targetArea){
				switch(target.typeArea){
				case typeArea.collision:
					enter = Area2Area(area, target);
					if(enter==false)break
					area_one = area;
					area_two = target;
					break
				case typeArea.static:
					if(useArea==false)break
					switch(typeRepeat){
					case 0:
						point = correctionPositionStatic2Static(target, area, x, y, _ProxyPoint);
						if(point.max > max && point.result){
							X = point.x; 
							Y = point.y; 
							max = point.max;
							area_one = area;
							area_two = target;
							enterPoint = point.enter;
						};
						break
					case 2:
						const result = correctionRotateStatic2Static(target, area, x, y, rotate);
						if(Math.abs(result.rotate)<Math.abs(rotate)){
							area_one = area;
							area_two = target;
							enterPoint = result.enter;
							rotate = result.rotate;
						};
						break
					}
					break
				}
			}
			break
		}
	}

	_ProxyPoint.x = X*1.0001; _ProxyPoint.y = Y*1.0001; _ProxyPoint.rotate = rotate;
	if(area_one!=undefined && area_two!=undefined){
		if(area_one.enter!=undefined)area_one.enter(area_two,enterPoint);
		if(area_two.enter!=undefined)area_two.enter(area_one,enterPoint);
	}
	return _ProxyPoint
}

async function preloadAll(resources) {
  // 1) Формируем массив промисов
  const promises = [];

  // картинки
  for (const key in resources.images) {
    const src = resources.images[key];
    promises.push(
      loadImage(src).then(img => { resources.images[key] = img; })
    );
  }

  // аудио
  for (const key in resources.audio) {
    const src = resources.audio[key];
    promises.push(
      loadAudio(src).then(audio => { resources.audio[key] = audio; })
    );
  }

  // JSON
  for (const key in resources.json) {
    const url = resources.json[key];
    promises.push(
      loadJSON(url).then(data => { resources.json[key] = data; })
    );
  }

  // 2) Ожидаем, пока все промисы завершатся
  await Promise.all(promises);
  // 3) Весь набор уже подменён готовыми объектами
  console.log('Все ресурсы загружены', resources);
}

class Window {
	_object = {
		width: 0,
		height: 0,
		positionHTML: 'relative',
		position: {
			x: 0,
			y: 0
		}
	}

	get height(){return this._object.height};
	set height(height){
		this.HTML.style.height = height;
		this._object.height = height;
	};

	get width(){return this._object.width};
	set width(width){
		this.HTML.style.width = width;
		this._object.width = width;
	};

	get positionHTML(){return this._object.positionHTML};
	set positionHTML(positionHTML){
		this.HTML.style.position = positionHTML;
		this._object.positionHTML = positionHTML;
	};

	get position(){return this._ProxyPosition};
	get globalPosition(){return this._ProxyPosition};

	set position(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position);
		}
	}

	constructor(
		parent 				= document.body,
		id 						= 'GameWindow',
		//width 				= window.innerWidth,
		//height				= window.innerHeight,
		width 				= `100vw`,
		height				= `100vh`,
		positionHTML	= 'relative',
		x 						= 0,
		y 						= 0
		){

		this.HTML = document.createElement('div');
		this.HTML.setAttribute('id',id);
		this.parent = parent;
		parent.appendChild(this.HTML);
		this.width = width;
		this.height = height;
		this.positionHTML = positionHTML;
		this.position = {x, y};
		this.HTML.style.overflow = 'hidden';
		this._ProxyPosition = {x:0,y:0}
		this._ProxyEventTarget = {id:undefined};

		this.HTML.addEventListener('mousemove',(event)=>{
			let obj = event.target.eventParent;
			if(obj==undefined)obj={type:undefined};
			switch(obj.type){
			case 'Area2D':
				if(obj.id==this._ProxyEventTarget.id){
					if(obj._inArea(event.offsetX, event.offsetY)){
						obj._mousePositionProxy.x = event.offsetX+obj.minX;
			  		obj._mousePositionProxy.y = event.offsetY+obj.minY;
						if(obj._object.mouseIn){
							if(obj.move!=undefined)obj.move(obj, obj._mousePositionProxy);
						} else {
							if(obj.over!=undefined)obj.over(obj, obj._mousePositionProxy)
							obj._object.mouseIn = true
						}
					} else if(obj._object.mouseIn) {
						obj._mousePositionProxy.x = event.offsetX+obj.minX;
			  		obj._mousePositionProxy.y = event.offsetY+obj.minY;
			  		obj._object.mouseIn = false;
			  		if(obj.out!=undefined)obj.out(obj, obj._mousePositionProxy)
					}
					//if(obj.move!=undefined)obj.move();
				} else {
					if(obj.over!=undefined && obj._inArea(event.offsetX, event.offsetY))obj.over();
					if(this._ProxyEventTarget.out!=undefined)this._ProxyEventTarget.out();
					this._ProxyEventTarget = obj;
				}
				break
			case undefined:
				break
			}
		})
	}

	setPosition(x=undefined,y=undefined){
		if(x!=undefined){
			this._object.position.x = x;
			this.HTML.style.left = `${x}px`;
		}
		if(y!=undefined){
			this._object.position.y = y;
			this.HTML.style.top = `${y}px`;
		}
	}
}

class OriginCoordinates {


	_object = {
		width: 0,
		height: 0,
		positionHTML: 'absolute',
		position: {
			x: 0,
			y: 0
		},
		childs: []
	}

	get childs(){return this._object.childs}
	set childs(child){this._object.childs.push(child);}

	get position(){return this._object.position}
	set position(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position);
		}
	}

	get scale(){return {x:1,y:1}}
	get globalScale(){return {x:1,y:1}}
	get rotate(){return 0}
	get globalRotate(){return 0}

	get globalPosition(){return this._object.position};
	set globalPosition(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position.x);
		}
	}

	get positionHTML(){return this._object.positionHTML}
	set positionHTML(positionHTML){this._object.positionHTML=positionHTML; this.HTML.style.position=positionHTML}

	constructor(
		xDevian 				= WINDOW.HTML.offsetWidth/2,
		yDevian 				= WINDOW.HTML.offsetHeight/2,	
		parent 			= document.body,
		id 				= 'COORDINATES',
		positionHTML 	= 'absolute',
		width						= WINDOW.HTML.offsetWidth/2,
		height 					= WINDOW.HTML.offsetHeight/2,
		){

		this.width = width;
		this.height = height;
		this.HTML = document.createElement('div');
		this.HTML.setAttribute('id',id);
		this.HTML.setAttribute('style','height: 0px; width: 0px;');
		this.parent = parent;
		parent.appendChild(this.HTML);
		this.positionHTML = positionHTML;
		this.xDevian = xDevian;
		this.yDevian = yDevian;
		this.position = {x:0, y:0};
	}

	_addChildArea(area){return}
	_removeChildArea(area){return}

	setPosition(x=undefined,y=undefined){
		if(x!=undefined){
			this.HTML.style.left = `${x+this.xDevian}px`;
		}
		if(y!=undefined){
			this.HTML.style.top = `${y+this.yDevian}px`;
		}
	}
}

class Camera {
	_object = {
		target: {globalPosition:{x:0,y:0}},
		zoom: 1,
		coordinates: undefined
	}

	get coordinates(){return this._object.coordinates};
	set coordinates(coordinates){
		this._object.coordinates = coordinates;
		this._ProxyPosition.x = -this.target.globalPosition.x;
		this._ProxyPosition.y = -this.target.globalPosition.y;
		coordinates.position = this._ProxyPosition;
	}

	get target(){return this._object.target}
	set target(target){
		this._object.target = target;
	}

	get zoom(){return this._object.zoom}
	set zoom(zoom){this.setZoom(zoom, this.slow)}

	constructor(coordinates=COORDINATES, zoom=1, target=WINDOW){
		const self = this;
		this._ProxyPosition = {
			x:0,
			y:0
		}

		this.target = target;
		this.coordinates = coordinates;
		this.zoom = zoom;
		this.slow = undefined;
	}

	setZoom(zoom, slow=undefined){
		if(slow!=undefined){
			if(zoom<this._object.zoom){zoom=this._object.zoom-slow<zoom?zoom:this._object.zoom-slow}else if(zoom>this._object.zoom){zoom=this._object.zoom+slow>zoom?zoom:this._object.zoom+slow}
		}
		this._object.zoom = zoom;
		this.coordinates.xDevian=this.coordinates.width/zoom;
		this.coordinates.yDevian=this.coordinates.height/zoom;
		this.coordinates.HTML.style.zoom = zoom;
		this.coordinates = this.coordinates;
	}
}

class KeyBoard {
	constructor(keys=keysCode){
		keys.forEach((key)=>{this[key] = false});

		this.event = {};
		this.event.down = document.addEventListener('keydown',(e)=>{this[e.code]=true});
		this.event.up = document.addEventListener('keyup',(e)=>{this[e.code]=false});

		this.down
	}
}

class TypePosition {
	local = 0
	global = 1
}

class TypeRepeat {
	position = 0
	scale = 1
	rotate = 2
	scalePosition = 3
	rotatePosition = 4
}

class TypeSaveSize {
	noSave = 0
	height = 1
	width = 2
	save = 3
	saveSize = 3
	size = 3
}

class TypeImageRendering {
	auto = 'auto'
	smooth = 'smooth'
	crispEdges = 'crisp-edges'
	pixelated = 'pixelated'
}

class TypeArea {
	collision = 0;
	static = 1;
	kinematic = 2;
	dynamic = 3;
	physical = 4;
	material = 5;
}

class Mouse {
	_object = {
		position: {
			x:0,
			y:0
		}
	}

	constructor(parent = WINDOW, pointStart=COORDINATES){
		this.parent = parent;
		this.pointStart=pointStart;

		//this.parent.HTML.addEventListener('mousemove',(e)=>{console.log(e); this.#setPosition(e.offsetX, e.offsetY);}, { capture: true })
	}

	#setPosition(x,y){
		this._object.position.x = x-this.pointStart.HTML.offsetLeft;
		this._object.position.y = y-this.pointStart.HTML.offsetTop;
		//console.log(this._object.position.x);
	}
}

class Objects {
	objects = [];
	id = [];

	constructor(types=['Sprite','Area2D','Static']){
		for(let object of types){this[object]=[]}
	}

	add(object){
		this.objects.push(object);
		if(this[object.type]==undefined)this[object.type]=[];
		this[object.type].push(object);
		if(!this.checkId(object.id))this.id.push(object.id);
	}

	checkId(id){return this.id.includes(id)}

	remove(object){
		for(let i=0; i<this.objects.length; i++){
			if(object.id==this.objects[i])this.objects.splice(i,1);
		}
		for(let i=0; i<this[object.type].length; i++){
			if(object.id==this[object.type][i])this[object.type].splice(i,1);
		}
		if(this.checkId(object.id))this.id.splice(this.id.indexOf(object.id),1);
	}

	*[Symbol.iterator]() {
		for (let object of this.objects){
			yield object
		}
	}
}

const typeImageRendering = new TypeImageRendering();
const typePosition = new TypePosition();
const typeRepeat = new TypeRepeat();
const typeSaveSize = new TypeSaveSize();
const typeArea = new TypeArea();
let keysCode = ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace', 'Digit7', 'KeyW', 'KeyQ', 'Tab', 'CapsLock', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'AltLeft', 'ControlRight', 'AltRight', 'Space', 'MetaLeft', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad5', 'Numpad4', 'Numpad6', 'Numpad8', 'Numpad7', 'Numpad9', 'NumpadSubtract', 'NumpadAdd', 'NumpadEnter', 'NumpadMultiply', 'NumpadDivide', 'NumLock', 'Insert', 'Home', 'PageUp', 'Delete', 'PageDown', 'End', 'F1', 'F2', 'Enter', 'ScrollLock', 'Pause']

const KEYS = new KeyBoard();
const WINDOW = new Window();
const COORDINATES = new OriginCoordinates(WINDOW.HTML.offsetWidth/2, WINDOW.HTML.offsetHeight/2, WINDOW.HTML);
const CAMERA = new Camera();
const OBJECTS = new Objects();
const MOUSE = new Mouse();

const FPS      = 60;
const STEP_MS  = 1000 / FPS;   // 16.6667 мс
let previous = performance.now();
let accumulator = 0;
function _tick(){
	for(let object of OBJECTS){
		object.script.repeat(object);
	}
};
function loop(now) {
  const delta = now - previous;   // прошедшее время с прошлого кадра
  previous = now;
  accumulator += delta;
  // Выполняем тик, пока накопилось минимум STEP_MS
  while (accumulator >= STEP_MS) {
    _tick();                     // ваш код, вызываемый раз в ~16.6 мс
    accumulator -= STEP_MS;
  }
  requestAnimationFrame(loop);
}

// старт
requestAnimationFrame(loop);

var LANGUAGE = 'ru';
const error = {
	1:{ru:"Неверный формат указания точки - {x:0,y:0}", eng:"Incorrect point format - {x:0,y:0}"}
}

class Area2D {
	 _object = {
		width: 0,
		height: 0,
		positionHTML: 'absolute',
		position: {
			x: 0,
			y: 0
		},
		scale: {
			x:1,
			y:1
		},
		rotate: 0,
		childs: [],
		parent: undefined,
		area: [],
		showObject: false,
		_mousemove: undefined,
		over: undefined, 
		out: undefined,
		click: undefined,
		enter: undefined,
		mouseIn: false,
		areas: []
	}

	script = {
		self: this,
		repeat: (self)=>{},
		start: (self)=>{},
		remove: (self)=>{},
		change: (self, type)=>{},
		intersectionArea: (self, area, point)=>{},
		conflictArea: (self, area, point)=>{}
	}

	savePosition = typePosition.global;
	repeat={
		position: typeRepeat.position,
		scale: typeRepeat.scalePosition,
		rotate: typeRepeat.rotatePosition
	}
	ascent = false;
	typeArea = typeArea.collision;
	radius = 0;

	get type(){return "Area2D"}
	set type(type){return}

	get childArea(){return this._object.areas}
	set childArea(area){
		if(['Area2D','Circle2D','Rectangle2D'].includes(area.type)==false)return
		if(this._object.areas.map((e)=>{return e.id}).includes(area.id))return
		this._object.areas.push(area);
	}

	get area(){
		return this._object.area.map((point)=>{
			point = mathLib.rotatePoint(point, this.rotate);
			point.x*=this.scale.x;
			point.y*=this.scale.y;
			return point
		});
	}
	set area(area){
		if(Array.isArray(area)){
			this._object.area = this.checkArea(area, true);
		} else if (typeof area == 'object'){
			if(area.x==undefined || area.y==undefined){
				console.error(error[1][LANGUAGE]);
			} else if (Array.isArray(this._object.area)){
				this._object.area.push(area);
			} else {
				this._object.area = [area];
			}
		}

		this._change();
		this._updatePseudoRadius();
	}

	get globalArea(){
		return this._object.area.map((point)=>{
			point = mathLib.rotatePoint(point, this.rotate);
			point.x=point.x*this.globalScale.x+this.globalPosition.x;
			point.y=point.y*this.globalScale.y+this.globalPosition.y;
			return point
		});
	}
	set globalArea(area){
		if(Array.isArray(area)){
			this._object.area = this.checkArea(area, true);
		} else if (typeof area == 'object'){
			if(area.x==undefined || area.y==undefined){
				console.error(error[1][LANGUAGE]);
			} else if (Array.isArray(this._object.area)){
				this._object.area.push(area);
			} else {
				this._object.area = [area];
			}
		}

		this._updatePseudoRadius();
	}

	get line(){
		let lines = [];
		for(let line of this.lines(true)){
			lines.push(line)
		}
		return lines
	}

	get globalLine(){
		let lines = [];
		for(let line of this.globalLines(true)){
			lines.push(line)
		}
		return lines
	}

	get over(){return this._object.over}
	get out(){return this._object.out}
	get move(){return this._object.move}
	get enter(){return this._object.enter}

	set over(func){
		if(typeof func!='function')return
		this._addEventDOM();
		this._object.over = (target=undefined, point=undefined)=>{
			if(this.ascent && this.parent.over!=undefined)this.parent.over(target, point);
			func(target, point);
		}
	}
	set move(func){
		if(typeof func!='function')return
		this._addEventDOM();
		this._object.move = (target=undefined, point=undefined)=>{
			if(this.ascent && this.parent.move!=undefined)this.parent.move(target, point);
			func(target, point);
		}
	}
	set out(func){
		if(typeof func!='function')return
		this._addEventDOM();
		this._object.out = (target=undefined, point=undefined)=>{
			if(this.ascent && this.parent.out!=undefined)this.parent.out(target, point);
			func(target, point);
		}
	}
	set enter(func){
		this._object.enter = func;
	}

	get max(){return this.maxPoint(true, true)}
	get maxX(){return this.maxPoint(true, false)}
	get maxY(){return this.maxPoint(false, true)}

	get min(){return this.minPoint(true, true)}
	get minX(){return this.minPoint(true, false)}
	get minY(){return this.minPoint(false, true)}

	get globalMax(){return this.globalMaxPoint(true, true)}
	get globalMaxX(){return this.globalMaxPoint(true, false)}
	get globalMaxY(){return this.globalMaxPoint(false, true)}

	get globalMin(){return this.globalMinPoint(true, true)}
	get globalMinX(){return this.globalMinPoint(true, false)}
	get globalMinY(){return this.globalMinPoint(false, true)}

	get rectangle(){return this.getRectangle()}
	get globalRectangle(){return this.getGlobalRectangle()}

	get circle(){return this.getCircle()}
	get globalCircle(){return this.getGlobalCircle()}

	get childs(){return this._object.childs};
	set childs(child){
		for(let ch of this._object.childs){if(ch.id==child.id){return}}
		this._object.childs.push(child); 
		this.HTML.appendChild(child.HTML);
		child._object.parent = this;
	};

	get parent(){return this._object.parent};
	set parent(parent){
		if(this.parent!=undefined)this.parent._removeChildArea(this);
		this._object.parent = parent;
		switch(this.savePosition){
			case typePosition.global:
				let globalPosition = this.globalPosition;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.globalPosition = globalPosition;
				break
			case typePosition.local:
				let position = this.position;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.position = position;
				break
		}
		for(let ch of parent._object.childs){if(ch.id==parent.id){return}};
		parent._object.childs.push(this);
		parent._addChildArea(this);
		switch(parent.type){
		case 'Static':
			this.typeArea = typeArea.static;
			break
		case 'Sprite':
			this.typeArea = typeArea.collision;
			break
		case 'Rectangle2D':
			this.typeArea = typeArea.collision;
			break
		case 'Circle2D':
			this.typeArea = typeArea.collision;
			break
		case 'Area2D':
			this.typeArea = typeArea.collision;
			break
		}
	};

	get position(){return this._positionProxy};
	set position(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position);
		}
	}

	get scale(){return this._scaleProxy};
	set scale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setScale(scale.x);}		
			if(scale.y!=undefined){this.setScale(undefined, scale.y);}
		} else {
			this.setScale(scale, scale);
		}
	}

	get rotate(){return this._object.rotate};
	set rotate(rotate){this.setRotate(rotate)};

	get globalPosition(){return this._globalPositionProxy};
	set globalPosition(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setGlobalPosition(position.x);}		
			if(position.y!=undefined){this.setGlobalPosition(undefined, position.y);}
		} else {
			this.setGlobalPosition(position);
		}
	}

	get globalScale(){return this._globalScaleProxy};
	set globalScale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setGlobalScale(scale.x);}		
			if(scale.y!=undefined){this.setGlobalScale(undefined, scale.y);}
		} else {
			this.setGlobalScale(scale, scale);
		}
	}

	get globalRotate(){return mathLib.typeCorner.normalization(this.repeat.rotate==typeRepeat.rotate||this.repeat.rotate==typeRepeat.rotatePosition?this._object.rotate+this.parent.globalRotate:this._object.rotate, mathLib.typeCorner.degree)};
	set globalRotate(rotate){this.setGlobalRotate(rotate)};

	get positionHTML(){return this._object.positionHTML}
	set positionHTML(positionHTML){this._object.positionHTML=positionHTML; this.HTML.style.position=positionHTML}

	constructor(
			config=undefined
		){

		if(config==undefined){config={}};
		config.parentHTML = config.parentHTML==undefined?COORDINATES.HTML:config.parentHTML;
		config.parent = config.parent==undefined?COORDINATES:config.parent;
		config.id = config.id==undefined?generateID('Area2D'):config.id;

		const self = this;

		this._positionProxy = {
			self: this,
			get x(){return this.self._object.position.x},
			set x(x){this.self.setPosition(x)},
			get y(){return this.self._object.position.y},
			set y(y){this.self.setPosition(undefined, y)}
		}
		this._globalPositionProxy = {
			self: this,
			get x(){return this.self._object.position.x+this.self.parent.globalPosition.x},
			set x(x){this.self.setGlobalPosition(x)},
			get y(){return this.self._object.position.y+this.self.parent.globalPosition.y},
			set y(y){this.self.setGlobalPosition(undefined, y)}
		}
		this._scaleProxy = {
			self: this,
			get x(){return this.self._object.scale.x},
			set x(x){this.self.setScale(x)},
			get y(){return this.self._object.scale.y},
			set y(y){this.self.setScale(undefined, y)}
		}
		this._globalScaleProxy = {
			self: this,
			get x(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.x*this.self.parent.globalScale.x:this.self._object.scale.x},
			set x(x){this.self.setGlobalScale(x)},
			get y(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.y*this.self.parent.globalScale.y:this.self._object.scale.y},
			set y(y){this.self.setGlobalScale(undefined, y)}
		}
		this._ProxyArray = [];
		this._ProxyPoint = {x:0,y:0};
		this._mousePositionProxy = {x:0,y:0}

		config.position = config.position==undefined && config.globalPosition==undefined?{x:undefined, y:undefined}:config.position;
		config.position.x = config.position.x==undefined?0:config.position.x;
		config.position.y = config.position.y==undefined?0:config.position.y;

		config.scale = config.scale==undefined && config.globalScale==undefined?{x:undefined,y:undefined}:config.scale;
		config.scale.x = config.scale.x==undefined?1:config.scale.x;
		config.scale.y = config.scale.y==undefined?1:config.scale.y;

		config.rotate = config.rotate==undefined && config.globalRotate==undefined?0:config.rotate;

		config.zIndex = config.zIndex==undefined?0:config.zIndex;

		this.HTML = document.createElement('div');
		this.HTML.setAttribute('id',config.id);
		this.HTML.setAttribute('style','position: absolute; height: 0px; width: 0px;');
		this.HTML.setAttribute('translate','no');
		this.parentHTML = config.parentHTML;
		this.parentHTML.appendChild(this.HTML);
		this.parent = config.parent;
		this.HTML.type = 'Area2D';
		this.type = 'Area2D';
		this.id=config.id;

		if(config.globalPosition==undefined){this.position=config.position}else{this.globalPosition=config.globalPosition}
		if(config.globalScale==undefined){this.scale=config.scale}else{this.globalScale=config.globalScale}
		if(config.globalRotate==undefined){this.rotate=config.rotate}else{this.globalRotate=config.globalRotate}

		this.zIndex = config.zIndex;

		OBJECTS.add(this);
	}

	*[Symbol.iterator]() {
		for (let point of this.area){
			yield point
		}
	}

	*points(){
		for (let point of this.area){
			yield point
		}
	}

	*globalPoints(){
		const gx = this.globalPosition.x;
		const gy = this.globalPosition.y;
		for (let point of this.area){
			point.x+=gx;
			point.y+=gy;
			yield point
		}
	}

	*lines(newArray=true){
		switch(newArray){
		case true:
			for (let i=0; i<this._object.area.length; i++){
				let j = i>=this._object.area.length-1?0:i+1;
				yield new Line(this.area[i],this.area[j])
			}
			break
		case false:
			for (let i=0; i<this._object.area.length; i++){
				let j = i>=this._object.area.length-1?0:i+1;
				this._ProxyArray = new Line(this.area[i], this.area[j])
				yield this._ProxyArray
			}
			break
		}
	}

	*globalLines(newArray=true){
		const gx = this.globalPosition.x;
		const gy = this.globalPosition.y;
		switch(newArray){
		case false:
			for (let i=0; i<this._object.area.length; i++){
				let j = i>=this._object.area.length-1?0:i+1;
				const start = this.area[i];
				const end = this.area[j];
				start.x+=gx;
				start.y+=gy;
				end.x+=gx;
				end.y+=gy;
				this._ProxyArray = new Line(start, end);
				yield this._ProxyArray
			}
			break
		case true:
			for (let i=0; i<this._object.area.length; i++){
				let j = i>=this._object.area.length-1?0:i+1;
				const start = this.area[i];
				const end = this.area[j];
				start.x+=gx;
				start.y+=gy;
				end.x+=gx;
				end.y+=gy;
				yield new Line(start, end)
			}
			break
		}
	}

	_updatePseudoRadius(){
		const max = this.maxPoint(false,false, true);
		const min = this.minPoint(false,false, true);
		const x = Math.abs(min.x)>max.x?Math.abs(min.x):max.x;
		const y = Math.abs(min.y)>max.y?Math.abs(min.y):max.y;
		this.radius = Math.sqrt(x**2+y**2);
	}

	_addChildArea(area){
		this.childArea = area;
		this.parent._addChildArea(area);
	}

	_removeChildArea(area){
		for(let i=0; i<this.childArea.length; i++){
			if(this.childArea[i].id == area.id)this.childArea.splice(i,1);
		}
		this.parent._removeChildArea(area);
	}

	_inArea(x,y){
		this._mousePositionProxy.x = this.minX;
		this._mousePositionProxy.y = this.minY;
		let min = {x:this.minX,y:this.minY};
		let area = this.area.map((p)=>{return {x:p.x-this._mousePositionProxy.x, y:p.y-this._mousePositionProxy.y}});
		this._mousePositionProxy.x = x;
		this._mousePositionProxy.y = y;
		return mathLib.pointInPolygon(this._mousePositionProxy, area)
	}

	_addEventDOM(){
		if(this.EventHTML!=undefined)return
		this.EventHTML = document.createElement("div");
		this.EventHTML.setAttribute('id',`${this.id}_eventDOM`);
		this.EventHTML.style.position = 'absolute';
		this.HTML.appendChild(this.EventHTML);

		this.EventHTML.over = undefined
		this.EventHTML.out = undefined
		this.EventHTML.eventParent = this;

		this._fixEventDOM();
	}

	_fixEventDOM(){
		if(this.EventHTML==undefined)return
		this.EventHTML.style.top = `${this.minY}px`;
		this.EventHTML.style.left = `${this.minX}px`;
		this.EventHTML.style.height = `${this.maxY-this.minY}px`;
		this.EventHTML.style.width = `${this.maxX-this.minX}px`;
	}

	maxPoint(x=true,y=true, newObject=true){
		if(x && y){
			let max = this.area[0];
			for (let point of this.area){
				max = (max.x+max.y)<(point.x+point.y)?point:max;
			}
			return max
		}	else if(x){
			return Math.max.apply(null,this.area.map((point)=>{return point.x}));
		} else if (y){			
			return Math.max.apply(null,this.area.map((point)=>{return point.y}));
		} else {
			if(newObject){
				return {x:Math.max.apply(null,this.area.map((point)=>{return point.x})), y:Math.max.apply(null,this.area.map((point)=>{return point.y}))}
			}
			this._ProxyPoint.x = Math.max.apply(null,this.area.map((point)=>{return point.x}));
			this._ProxyPoint.y = Math.max.apply(null,this.area.map((point)=>{return point.y}));
			return this._ProxyPoint
		}
	}

	globalMaxPoint(x=true,y=true, newObject=true){
		if(x && y){
			let max = this.globalArea[0];
			for (let point of this.globalArea){
				max = (max.x+max.y)<(point.x+point.y)?point:max;
			}
			return max
		}	else if(x){
			return Math.max.apply(null,this.globalArea.map((point)=>{return point.x}));
		} else if (y){			
			return Math.max.apply(null,this.globalArea.map((point)=>{return point.y}));
		} else {
			if(newObject){
				return {x:Math.max.apply(null,this.globalArea.map((point)=>{return point.x})), y:Math.max.apply(null,this.globalArea.map((point)=>{return point.y}))}
			}
			this._ProxyPoint.x = Math.max.apply(null,this.globalArea.map((point)=>{return point.x}));
			this._ProxyPoint.y = Math.max.apply(null,this.globalArea.map((point)=>{return point.y}));
			return this._ProxyPoint
		}
	}

	minPoint(x=true,y=true, newObject=true){
		if(x && y){
			let min = this.area[0];
			for (let point of this.area){
				min = (min.x+min.y)>(point.x+point.y)?point:min;
			}
			return min
		}	else if(x){
			return Math.min.apply(null,this.area.map((point)=>{return point.x}));
		} else if (y){			
			return Math.min.apply(null,this.area.map((point)=>{return point.y}));
		} else {
			if(newObject){
				return {x:Math.min.apply(null,this.area.map((point)=>{return point.x})), y:Math.min.apply(null,this.area.map((point)=>{return point.y}))}
			}
			this._ProxyPoint.x = Math.min.apply(null,this.area.map((point)=>{return point.x}));
			this._ProxyPoint.y = Math.min.apply(null,this.area.map((point)=>{return point.y}));
			return this._ProxyPoint
		}
	}

	globalMinPoint(x=true,y=true, newObject=true){
		if(x && y){
			let min = this.globalArea[0];
			for (let point of this.globalArea){
				min = (min.x+min.y)>(point.x+point.y)?point:min;
			}
			return min
		}	else if(x){
			return Math.min.apply(null,this.globalArea.map((point)=>{return point.x}));
		} else if (y){			
			return Math.min.apply(null,this.globalArea.map((point)=>{return point.y}));
		} else {
			if(newObject){
				return {x:Math.min.apply(null,this.globalArea.map((point)=>{return point.x})), y:Math.min.apply(null,this.globalArea.map((point)=>{return point.y}))}
			}
			this._ProxyPoint.x = Math.min.apply(null,this.globalArea.map((point)=>{return point.x}));
			this._ProxyPoint.y = Math.min.apply(null,this.globalArea.map((point)=>{return point.y}));
			return this._ProxyPoint
		}
	}

	getRectangle(){
		return new Rectangle(this.maxPoint(false, false, true), this.minPoint(false, false, true))
	}

	getGlobalRectangle(){
		return new Rectangle(this.globalMaxPoint(false, false, true), this.globalMinPoint(false, false, true))
	}

	getCircle(){
		let max = this.maxPoint(false, false, false);
		max = Math.sqrt((max.x)**2+(max.y)**2)
		let min = this.minPoint(false, false, false)
		min = Math.sqrt((min.x)**2+(min.y)**2)
		return new Circle(max>min?max:min, {x:this.position.x,y:this.position.y});
	}

	getGlobalCircle(){
		let max = this.maxPoint(false, false, false);
		max = Math.sqrt((max.x)**2+(max.y)**2)
		let min = this.minPoint(false, false, false)
		min = Math.sqrt((min.x)**2+(min.y)**2)
		return new Circle(max>min?max:min, {x:this.globalPosition.x, y:this.globalPosition.y});
	}

	checkArea(area, fix=true){
		for(let i=0; i<area.length; i++){
			if((area[i].x==undefined || area[i].y==undefined) && !fix){return false}
			area[i].x == area[i].x==undefined?0:area[i].x;
			area[i].y == area[i].y==undefined?0:area[i].y 
		}
		return area
	}

	setPosition(x=undefined,y=undefined){
		if(x!=undefined){
			let diff = x-this._object.position.x
			this.HTML.style.left = `${x}px`;
			this._object.position.x = x;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.x-=diff}
			}
		}
		if(y!=undefined){
			let diff = y-this._object.position.y
			this.HTML.style.top = `${y}px`;
			this._object.position.y = y;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.y-=diff}
			}
		}

		this._change();
	}

	setGlobalPosition(x=undefined, y=undefined){
		if(x!=undefined){
			x = x-this.parent.globalPosition.x;
			this._object.position.x = x;
			this.HTML.style.left = `${x}px`;
		}
		if(y!=undefined){
			y = y-this.parent.globalPosition.y;
			this._object.position.y = y;
			this.HTML.style.top = `${y}px`;
		}

		this._change();
	}

	setScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setScale(undefined, y, true);
				}
			}
		}

		this._change();
	}

	setGlobalScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			x = x/this.parent.globalScale.x;
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setGlobalScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			y = y/this.parent.globalScale.y;
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setGlobalScale(undefined, y, true);
				}
			}
		}

		this._change();
	}

	setRotate(corner, legacy=false, type=mathLib.typeCorner.degree){
		corner = mathLib.typeCorner.normalization(corner, type);
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		for(let i=0; i<this._object.area.length; i++){
			this._object.area[i] = mathLib.rotatePoint(this._object.area[i], diffCorner);
		}
		//
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}

		this._change();
	}

	setGlobalRotate(corner, legacy=false, type=mathLib.typeCorner.degree){
		corner = mathLib.typeCorner.normalization(corner-this.parent.globalRotate, type);
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}

		this._change();
	}

	_change(){
		this.showObject(this._object.showObject);
	}

	showObject(value=true){
		if(value==false && this._object.showObject==false)return

		if(value){
			this.showObject(false);

			const color = randomColor();
			const show = document.createElement('div');
			show.setAttribute('id','show'+this.id);
			show.type = 'showObject'
			show.setAttribute('style',`position:absolute; top:0px; font-size:10px; left:0px; padding:0px; color:${color}; border-radius:0px 5px 5px 5px	; border-color:${color}; border-width:0px 0px 0px 0px; border-style:solid;`);
			this.HTML.appendChild(show);

			const canvas = document.createElement('canvas');

			canvas.style.top = `${this.minY}px`;
			canvas.style.left = `${this.minX}px`;
			canvas.style.width = `${this.globalMaxX-this.globalMinX}px`;
			canvas.style.height = `${this.globalMaxY-this.globalMinY}px`;
			canvas.style.position = 'absolute';
			canvas.width = this.globalMaxX-this.globalMinX;
			canvas.height = this.globalMaxY-this.globalMinY;
			show.appendChild(canvas);
			let ctx = canvas.getContext("2d");
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.moveTo(this.globalArea[0].x-this.globalMinX, this.globalArea[0].y-this.globalMinY);
			for (let point of this.globalArea){
				ctx.lineTo(point.x-this.globalMinX, point.y-this.globalMinY);
			}
			ctx.lineTo(this.globalArea[0].x-this.globalMinX, this.globalArea[0].y-this.globalMinY);
			ctx.stroke();
		} else {
			for(let element of this.HTML.children){if(element.type=='showObject'){element.remove()}};
		}

		this._object.showObject = value;
	}
}

class Frame {
	constructor(image, x, y, width, height, ticks=1, imageSmoothingEnabled=false){
		//if(typeof img=='object'){img=img.img; x=img.x==undefined?0:img.x; y=img.y==undefined?0:img.y;width=img.width; height=img.height}
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.image = image;
		this.ticks = ticks;
		this.imageSmoothingEnabled = imageSmoothingEnabled;
	}
}

class SpriteAnimation{
	_object = {
		timeLime: undefined,
		stop: false,
		pause: false
	}

	get timeLine(){return this._object.timeLine}
	set timeLine(timeLine){this._object.timeLine = timeLine==undefined?new Array():timeLine}

	get stop(){return this._object.stop}
	set stop(stop){if(stop){this.frame=0; this._proxyTicksCount=1; this._object.stop = true}else{this._object.stop = false}}

	get pause(){return this._object.stop}
	set pause(pause){if(pause){this._object.pause = true}else{this._object.pause = false}}

	constructor(sprite, timeLine=undefined){
		this.sprite = sprite;
		this.timeLine = timeLine;
		this.frame = 0;
		this._proxyTicksCount = 1;
		this.repeat = true;
		this.stop = false;
		this.pause = false;
	}

	play(speed=1, end=undefined){
		const timeLine = this.timeLine;
		const len = this.timeLine.length;
		if(this.stop || this.pause){return}
		this.sprite.render(timeLine[this.frame]);
		if(this._proxyTicksCount*speed<timeLine[this.frame].ticks){this._proxyTicksCount+=1}
		else {
			this._proxyTicksCount = 1;
			this.frame+= Math.max(1, Math.round(speed));
		}
		if(this.repeat){
			this.frame = this.frame%len;
		} else if (!this.repeat && this.frame>=len) {
			if(end!=undefined)end();
			this.frame = 0;
			this.stop = true;
		}
	}
}

class Sprite {
	_object = {
		width: undefined,
		height: undefined,
		positionHTML: 'absolute',
		position: {
			x: 0,
			y: 0
		},
		scale: {
			x:1,
			y:1
		},
		rotate: 0,
		childs: [],
		parent: undefined,
		src: undefined, 
		size: {
			width: 1,
			height: 1
		},
		frames: undefined,
		animations: [],
		typeImageRendering: typeImageRendering.auto,
		horizontally: 1,
		vertically: 1,
		showObject: false,
		_mousemove: undefined,
		over: undefined, 
		out: undefined,
		click: undefined,
		mouseIn: false,
		areas: []
	}

	script = {
		self: this,
		repeat: (self)=>{},
		start: (self)=>{},
		remove: (self)=>{},
		change: (self, type)=>{},
		intersectionArea: (self, area, point)=>{},
		conflictArea: (self, area, point)=>{}
	}

	savePosition = typePosition.global;
	repeat={
		position: typeRepeat.position,
		scale: typeRepeat.scalePosition,
		rotate: typeRepeat.rotatePosition
	}
	ascent = false;
	saveSize=typeSaveSize.save;

	get childArea(){return this._object.areas}
	set childArea(area){
		if(['Area2D','Circle2D','Rectangle2D'].includes(area.type)==false)return
		if(this._object.areas.map((e)=>{return e.id}).includes(area.id))return
		this._object.areas.push(area);
	}

	get type(){return "Sprite"}
	set type(type){return}

	get over(){return this._object.over};
	get out(){return this._object.out};
	get click(){return this._object.click};

	set over(func){this._object.over = func};
	set out(func){this._object.out = func};
	set click(func){this._object.click = func};

	get childs(){return this._object.childs};
	set childs(child){
		for(let ch of this._object.childs){if(ch.id==child.id){return}}
		this._object.childs.push(child); 
		this.HTML.appendChild(child.HTML);
		child._object.parent = this;
	};

	get parent(){return this._object.parent};
	set parent(parent){
		this._object.parent = parent;
		switch(this.savePosition){
			case typePosition.global:
				let globalPosition = this.globalPosition;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.globalPosition = globalPosition;
				break
			case typePosition.local:
				let position = this.position;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.position = position;
				break
		}
		for(let ch of parent._object.childs){if(ch.id==parent.id){return}};
		parent._object.childs.push(this);
	};

	get position(){return this._positionProxy};
	set position(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position);
		}
	}

	get scale(){return this._scaleProxy};
	set scale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setScale(scale.x);}		
			if(scale.y!=undefined){this.setScale(undefined, scale.y);}
		} else {
			this.setScale(scale, scale);
		}
	}

	get rotate(){return this._object.rotate};
	set rotate(rotate){this.setRotate(rotate)};

	get globalPosition(){return this._globalPositionProxy};
	set globalPosition(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setGlobalPosition(position.x);}		
			if(position.y!=undefined){this.setGlobalPosition(undefined, position.y);}
		} else {
			this.setGlobalPosition(position);
		}
	}

	get globalScale(){return this._globalScaleProxy};
	set globalScale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setGlobalScale(scale.x);}		
			if(scale.y!=undefined){this.setGlobalScale(undefined, scale.y);}
		} else {
			this.setGlobalScale(scale, scale);
		}
	}

	get globalRotate(){return mathLib.typeCorner.normalization(this.repeat.rotate==typeRepeat.rotate||this.repeat.rotate==typeRepeat.rotatePosition?this._object.rotate+this.parent.globalRotate:this._object.rotate, mathLib.typeCorner.degree)};
	set globalRotate(rotate){this.setGlobalRotate(rotate)};

	get positionHTML(){return this._object.positionHTML}
	set positionHTML(positionHTML){this._object.positionHTML=positionHTML; this.HTML.style.position=positionHTML}

	get height(){return this._object.height};
	set height(height){
		this._object.height = height;
		//this.image.height = height;
		this.imageHTML.style.height = `${height*this.scale.y}px`;
		this.canvasHTML.style.height = `${height*this.scale.y}px`;
		this.canvasHTML.height = height*this.scale.y;
		this.imageHTML.style.top = `${-height*this.scale.y/2}px`;
		//
	}

	get width(){return this._object.width};
	set width(width){	
		this._object.width = width;
		//this.image.width = width;
		this.imageHTML.style.width = `${width*this.scale.x}px`;
		this.canvasHTML.style.width = `${width*this.scale.x}px`;
		this.canvasHTML.width = width*this.scale.x;
		this.imageHTML.style.left = `${-width*this.scale.x/2}px`;
		//
	};

	get src(){return this._object.src};
	set src(src){
		this.image.src = src;
		this._object.src = src;
	}

	get animations(){return this._object.animations}
	set animations(frames){this.addAnimation(`anim${this._object.animations.length}`, frames)}

	get frames(){return this._object.frames}

	get typeImageRendering(){return this._object.typeImageRendering}
	set typeImageRendering(typeImageRendering){this._object.typeImageRendering = typeImageRendering; this.canvasHTML.style.imageRendering = typeImageRendering}

	get horizontally(){return this._object.horizontally}
	set horizontally(value){
		value = value/Math.abs(value);
		this._object.horizontally = value;
		this.canvasHTML.style.transform = `scale(${this._object.vertically},${this._object.horizontally})`;
	}

	get vertically(){return this._object.vertically}
	set vertically(value){
		value = value/Math.abs(value);
		this._object.vertically = value;
		this.canvasHTML.style.transform = `scale(${this._object.vertically},${this._object.horizontally})`
	}

	constructor(
			config=undefined
		){

		if(config==undefined){config={}};
		config.parentHTML = config.parentHTML==undefined?COORDINATES.HTML:config.parentHTML;
		config.parent = config.parent==undefined?COORDINATES:config.parent;
		config.id = config.id==undefined?generateID('Sprite'):config.id;

		const self = this;

		this._positionProxy = {
			self: this,
			get x(){return this.self._object.position.x},
			set x(x){this.self.setPosition(x)},
			get y(){return this.self._object.position.y},
			set y(y){this.self.setPosition(undefined, y)}
		}
		this._globalPositionProxy = {
			self: this,
			get x(){return this.self._object.position.x+this.self.parent.globalPosition.x},
			set x(x){this.self.setGlobalPosition(x)},
			get y(){return this.self._object.position.y+this.self.parent.globalPosition.y},
			set y(y){this.self.setGlobalPosition(undefined, y)}
		}
		this._scaleProxy = {
			self: this,
			get x(){return this.self._object.scale.x},
			set x(x){this.self.setScale(x)},
			get y(){return this.self._object.scale.y},
			set y(y){this.self.setScale(undefined, y)}
		}
		this._globalScaleProxy = {
			self: this,
			get x(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.x*this.self.parent.globalScale.x:this.self._object.scale.x},
			set x(x){this.self.setGlobalScale(x)},
			get y(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.y*this.self.parent.globalScale.y:this.self._object.scale.y},
			set y(y){this.self.setGlobalScale(undefined, y)}
		}

		config.position = config.position==undefined && config.globalPosition==undefined?{x:undefined, y:undefined}:config.position;
		config.position.x = config.position.x==undefined?0:config.position.x;
		config.position.y = config.position.y==undefined?0:config.position.y;

		config.scale = config.scale==undefined && config.globalScale==undefined?{x:undefined,y:undefined}:config.scale;
		config.scale = typeof config.scale == 'number'?{x:config.scale, y:config.scale}:config.scale;
		config.scale.x = config.scale.x==undefined?1:config.scale.x;
		config.scale.y = config.scale.y==undefined?1:config.scale.y;

		config.size = config.size==undefined?{width:undefined,height:undefined}:config.size;
		config.size.width = config.size.width==undefined?1:config.size.width;
		config.size.height = config.size.height==undefined?1:config.size.height;

		config.rotate = config.rotate==undefined && config.globalRotate==undefined?0:config.rotate;

		config.zIndex = config.zIndex==undefined?0:config.zIndex;

		this.HTML = document.createElement('div');
		this.HTML.setAttribute('id',config.id);
		this.HTML.setAttribute('style','position: absolute; height: 0px; width: 0px;');
		this.HTML.setAttribute('translate','no');
		this.parentHTML = config.parentHTML;
		this.parentHTML.appendChild(this.HTML);

		this.parent = config.parent;
		this.HTML.type = 'Sprite';
		this.type = 'Sprite';
		this.id=config.id;

		this.zIndex = config.zIndex;
		this.image = new Image();
		this.image.onload = ()=>{
			switch(this.saveSize){
			case typeSaveSize.noSave:
				this.height = this.image.height;
				this.width = this.image.width;
				break
			case typeSaveSize.height:
				//this.image.height = this.height;
				this.width = this.image.width;
				break
			case typeSaveSize.width:
				this.height = this.image.height;
				//this.image.width = this.width;
				break
			case typeSaveSize.size:
				//this.image.height = this.height;
				//this.image.width = this.width;
				break
			}
		}

		this.rotateHTML = document.createElement('div');
		this.rotateHTML.setAttribute('id',`RotateHTML${this.id}`);
		this.rotateHTML.style.transform = 'rotate(0deg)';
		this.HTML.appendChild(this.rotateHTML);

		this.imageHTML = document.createElement('div');
		this.imageHTML.setAttribute('id',`ImageHTML${this.id}`);
		this.imageHTML.setAttribute('style',`position:absolute; height:${this.height}px; width:${this.width}px; top:${-this.height/2}px; left:${-this.width/2}px`);
		this.rotateHTML.appendChild(this.imageHTML);

		this.canvasHTML = document.createElement('canvas');
		this.canvasHTML.setAttribute('id',`CanvasHTML${this.id}`);
		this.canvasHTML.setAttribute('style',`position:absolute; height:${this.height}px; width:${this.width}px;`);
		this.imageHTML.appendChild(this.canvasHTML);

		if(config.globalPosition==undefined){this.position=config.position}else{this.globalPosition=config.globalPosition}
		if(config.globalScale==undefined){this.scale=config.scale}else{this.globalScale=config.globalScale}
		if(config.globalRotate==undefined){this.rotate=config.rotate}else{this.globalRotate=config.globalRotate}

		this.width = config.width==undefined?this.image.width:config.width;
		this.height = config.height==undefined?this.image.height:config.height;

		if(config.src!=undefined){
			this.src = config.src;
		}

		this.typeImageRendering = typeImageRendering.auto;

		OBJECTS.add(this);
	}

	_addChildArea(area){
		this.childArea = area;
		this.parent._addChildArea(area);
	}

	_removeChildArea(area){
		for(let i=0; i<this.childArea.length; i++){
			if(this.childArea[i].id == area.id)this.childArea.splice(i,1);
		}
		this.parent._removeChildArea(area);
	}

	setPosition(x=undefined,y=undefined){
		if(x!=undefined){
			let diff = x-this._object.position.x
			this.HTML.style.left = `${x}px`;
			this._object.position.x = x;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.x-=diff}
			}
		}
		if(y!=undefined){
			let diff = y-this._object.position.y
			this.HTML.style.top = `${y}px`;
			this._object.position.y = y;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.y-=diff}
			}
		}
	}

	setGlobalPosition(x=undefined, y=undefined){
		if(x!=undefined){
			x = x-this.parent.globalPosition.x;
			this._object.position.x = x;
			this.HTML.style.left = `${x}px`;
		}
		if(y!=undefined){
			y = y-this.parent.globalPosition.y;
			this._object.position.y = y;
			this.HTML.style.top = `${y}px`;
		}
	}

	setScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			x = legacy?this._object.scale.x*x:x;
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;

			this.imageHTML.style.width = `${this.width*x}px`;
			this.canvasHTML.style.width = `${this.width*x}px`;
			this.canvasHTML.width = this.width*x;
			this.imageHTML.style.left = `${-this.width*x/2}px`;

			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			y = legacy?this._object.scale.y*y:y;
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;

			this.imageHTML.style.height = `${this.height*y}px`;
			this.canvasHTML.style.height = `${this.height*y}px`;
			this.canvasHTML.height = this.height*y;
			this.imageHTML.style.top = `${-this.height*y/2}px`;

			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setScale(undefined, y, true);
				}
			}
		}
	}

	setGlobalScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			x = x/this.parent.globalScale.x;
			x = legacy?this._object.scale.x*x:x;
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;

			this.imageHTML.style.width = `${this.width*x}px`;
			this.canvasHTML.style.width = `${this.width*x}px`;
			this.canvasHTML.width = this.width*x;
			this.imageHTML.style.left = `${-this.width*x/2}px`;

			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setGlobalScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setGlobalScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			y = y/this.parent.globalScale.y;
			y = legacy?this._object.scale.y*y:y;
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;

			this.imageHTML.style.height = `${this.height*y}px`;
			this.canvasHTML.style.height = `${this.height*y}px`;
			this.canvasHTML.height = this.height*y;
			this.imageHTML.style.top = `${-this.height*y/2}px`;

			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setGlobalScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setGlobalScale(undefined, y, true);
				}
			}
		}
	}

	setRotate(corner, legacy=false, type=mathLib.typeCorner.degree){
		corner = mathLib.typeCorner.normalization(corner, type);
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		this.rotateHTML.style.transform = `rotate(${this.parent.globalRotate+this._object.rotate}deg)`;
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}
	}

	setGlobalRotate(corner, legacy=false, type=mathLib.typeCorner.degree){
		corner = mathLib.typeCorner.normalization(corner-this.parent.globalRotate, type);
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		this.rotateHTML.style.transform = `rotate(${this.parent.globalRotate+this._object.rotate}deg)`;
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}
	}

	addAnimation(name, frames){
		if(!this.image.complete){setTimeout(()=>this.addAnimation(name, frames),500); return};
		this._object.animations[name] = new SpriteAnimation(this, frames)
	}

	addFrame(name, width=undefined, height=undefined, x=0, y=0){
		width = width==undefined?this._object.width:width;
		height = height==undefined?this._object.height:height;
		if(typeof this._object.frames != 'object'){this.autoFrames(width, height, x, y)}
		this._object.frames[name] = new Frame(this.image, x, y, width, height);
	}

	autoFrames(width=undefined, height=undefined, x=0, y=0){
		if(!this.image.complete){setTimeout(()=>this.autoFrames(width, height, x, y),500); return};
		width = width==undefined?this._object.width:width;
		height = height==undefined?this._object.height:height;

		const fullWidth = this.image.width-this.image.width%width; const cols = fullWidth/width;
		const fullHeight = this.image.height-this.image.height%height; const rows = fullHeight/height;
		console.log(this._object.width);
		const array = new Array(cols*rows);
		for (let r=0; r<rows; r++){
			for (let c=0; c<cols; c++){
				array[r*cols+c] = new Frame(this.image, x+width*c, y+height*r, width, height);
			}
		}
		this._object.frames = new Matrix(rows, cols, array);
	}

	render(options){
		if (!this.image.complete) return;

		options = options==undefined?{}:options;
		let width = options.width==undefined?this._object.width:options.width;
		let height = options.height==undefined?this._object.height:options.height;
		let x = options.x==undefined?0:options.x;
		let y = options.y==undefined?0:options.y;
		let imageSmoothingEnabled = options.imageSmoothingEnabled==undefined?false:options.imageSmoothingEnabled;

		let ctx = this.canvasHTML.getContext("2d");
		ctx.imageSmoothingEnabled = imageSmoothingEnabled;
		ctx.clearRect(0,0,width*this.globalScale.x, height*this.globalScale.y);
		ctx.drawImage(this.image, x, y, width, height, 0, 0, width*this.globalScale.x, height*this.globalScale.y);
	}

	showObject(value=true){
		if(value){
			let color = randomColor();
			let show = document.createElement('div');
			show.setAttribute('id','show'+this.id);
			show.type = 'showObject'
			show.setAttribute('style',`position:absolute; top:0px; font-size:10px; left:0px; padding:2px; color:${color}; border-radius:0px 5px 5px 5px	; border-color:${color}; border-width:2px 0px 0px 2px; border-style:solid;`);
			show.innerText = this.id
			this.HTML.appendChild(show);
		} else {
			for(let element of this.HTML.children){if(element.type=='showObject'){element.remove()}};
		}
	}
}

class Static {
	 _object = {
		width: 0,
		height: 0,
		positionHTML: 'absolute',
		position: {
			x: 0,
			y: 0
		},
		scale: {
			x:1,
			y:1
		},
		rotate: 0,
		childs: [],
		areas: [],
		parent: undefined
	}

	savePosition = typePosition.global;
	repeat={
		position: typeRepeat.position,
		scale: typeRepeat.scalePosition,
		rotate: typeRepeat.rotatePosition
	}
	ascent = false;

	script = {
		self: this,
		repeat: (self)=>{},
		start: (self)=>{},
		remove: (self)=>{},
		change: (self, type)=>{},
		intersectionArea: (self, area, point)=>{},
		conflictArea: (self, area, point)=>{}
	}

	get childArea(){return this._object.areas}
	set childArea(area){
		if(['Area2D','Circle2D','Rectangle2D'].includes(area.type)==false)return
		if(this._object.areas.map((e)=>{return e.id}).includes(area.id))return
		this._object.areas.push(area);
	}

	get over(){return this._object.over};
	get out(){return this._object.out};
	get click(){return this._object.click};

	set over(func){this._object.over = func};
	set out(func){this._object.out = func};
	set click(func){this._object.click = func};

	get type(){return "Static"}
	set type(type){return}

	get childs(){return this._object.childs};
	set childs(child){
		for(let ch of this._object.childs){if(ch.id==child.id){return}}
		this._object.childs.push(child); 
		this.HTML.appendChild(child.HTML);
		child._object.parent = this;
	};

	get parent(){return this._object.parent};
	set parent(parent){
		this._object.parent = parent;
		switch(this.savePosition){
			case typePosition.global:
				let globalPosition = this.globalPosition;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.globalPosition = globalPosition;
				break
			case typePosition.local:
				let position = this.position;
				this.parentHTML = parent.HTML;
				this.parent.HTML.appendChild(this.HTML);
				this.position = position;
				break
		}
		for(let ch of parent._object.childs){if(ch.id==parent.id){return}};
		parent._object.childs.push(this);
	};

	get move(){return this._moveProxy};

	set move(move){
		if(typeof move=='object'){
			if(move.x!=undefined){this.setMove(move.x);}		
			if(move.y!=undefined){this.setMove(undefined, move.y);}
		} else {
			this.setMove(move);
		}
	}

	get position(){return this._positionProxy};
	set position(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setPosition(position.x);}		
			if(position.y!=undefined){this.setPosition(undefined, position.y);}
		} else {
			this.setPosition(position);
		}
	}

	get scale(){return this._scaleProxy};
	set scale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setScale(scale.x);}		
			if(scale.y!=undefined){this.setScale(undefined, scale.y);}
		} else {
			this.setScale(scale, scale);
		}
	}

	get rotate(){return this._object.rotate};
	set rotate(rotate){this.setRotate(rotate)};

	get globalPosition(){return this._globalPositionProxy};
	set globalPosition(position){
		if(typeof position=='object'){
			if(position.x!=undefined){this.setGlobalPosition(position.x);}		
			if(position.y!=undefined){this.setGlobalPosition(undefined, position.y);}
		} else {
			this.setGlobalPosition(position);
		}
	}

	get globalScale(){return this._globalScaleProxy};
	set globalScale(scale){
		if(typeof scale=='object'){
			if(scale.x!=undefined){this.setGlobalScale(scale.x);}		
			if(scale.y!=undefined){this.setGlobalScale(undefined, scale.y);}
		} else {
			this.setGlobalScale(scale, scale);
		}
	}

	get globalRotate(){return mathLib.typeCorner.normalization(this.repeat.rotate==typeRepeat.rotate||this.repeat.rotate==typeRepeat.rotatePosition?this._object.rotate+this.parent.globalRotate:this._object.rotate, mathLib.typeCorner.degree)};
	set globalRotate(rotate){this.setGlobalRotate(rotate)};

	get positionHTML(){return this._object.positionHTML}
	set positionHTML(positionHTML){this._object.positionHTML=positionHTML; this.HTML.style.position=positionHTML}

	constructor(
			config=undefined
		){

		if(config==undefined){config={}};
		config.parentHTML = config.parentHTML==undefined?COORDINATES.HTML:config.parentHTML;
		config.parent = config.parent==undefined?COORDINATES:config.parent;
		config.id = config.id==undefined?generateID('Static'):config.id;

		const self = this;

		this._moveProxy = {
			self: this,
			set x(x){this.self.setMove(x)},
			set y(y){this.self.setMove(undefined, y)}
		}
		this._positionProxy = {
			self: this,
			get x(){return this.self._object.position.x},
			set x(x){this.self.setPosition(x)},
			get y(){return this.self._object.position.y},
			set y(y){this.self.setPosition(undefined, y)}
		}
		this._globalPositionProxy = {
			self: this,
			get x(){return this.self._object.position.x+this.self.parent.globalPosition.x},
			set x(x){this.self.setGlobalPosition(x)},
			get y(){return this.self._object.position.y+this.self.parent.globalPosition.y},
			set y(y){this.self.setGlobalPosition(undefined, y)}
		}
		this._scaleProxy = {
			self: this,
			get x(){return this.self._object.scale.x},
			set x(x){this.self.setScale(x)},
			get y(){return this.self._object.scale.y},
			set y(y){this.self.setScale(undefined, y)}
		}
		this._globalScaleProxy = {
			self: this,
			get x(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.x*this.self.parent.globalScale.x:this.self._object.scale.x},
			set x(x){this.self.setGlobalScale(x)},
			get y(){return this.self.repeat.scale==typeRepeat.scale||this.self.repeat.scale==typeRepeat.scalePosition?this.self._object.scale.y*this.self.parent.globalScale.y:this.self._object.scale.y},
			set y(y){this.self.setGlobalScale(undefined, y)}
		}

		config.position = config.position==undefined && config.globalPosition==undefined?{x:undefined, y:undefined}:config.position;
		config.position.x = config.position.x==undefined?0:config.position.x;
		config.position.y = config.position.y==undefined?0:config.position.y;

		config.scale = config.scale==undefined && config.globalScale==undefined?{x:undefined,y:undefined}:config.scale;
		config.scale.x = config.scale.x==undefined?1:config.scale.x;
		config.scale.y = config.scale.y==undefined?1:config.scale.y;

		config.rotate = config.rotate==undefined && config.globalRotate==undefined?0:config.rotate;

		config.zIndex = config.zIndex==undefined?0:config.zIndex;

		this.HTML = document.createElement('div');
		this.HTML.setAttribute('id',config.id);
		this.HTML.setAttribute('style','position: absolute; height: 0px; width: 0px;');
		this.HTML.setAttribute('translate','no');
		this.parentHTML = config.parentHTML;
		this.parentHTML.appendChild(this.HTML);
		this.parent = config.parent;
		this.HTML.type = 'Static';
		//this.type = 'Static';
		this.id=config.id;

		if(config.globalPosition==undefined){this.position=config.position}else{this.globalPosition=config.globalPosition}
		if(config.globalScale==undefined){this.scale=config.scale}else{this.globalScale=config.globalScale}
		if(config.globalRotate==undefined){this.rotate=config.rotate}else{this.globalRotate=config.globalRotate}

		this.zIndex = config.zIndex;

		OBJECTS.add(this);
	}

	_addChildArea(area){
		this.childArea = area;
		this.parent._addChildArea(area);
	}

	_removeChildArea(area){
		for(let i=0; i<this.childArea.length; i++){
			if(this.childArea[i].id == area.id)this.childArea.splice(i,1);
		}
		this.parent._removeChildArea(area);
	}

	setMove(x=undefined,y=undefined){
		if(x!=undefined){
			this.setPosition(this.position.x+x, undefined, true);
		}
		if(y!=undefined){
			this.setPosition(undefined, this.position.y+y, true);
		}
	}

	setPosition(x=undefined,y=undefined, useArea=false){
		if(x!=undefined){
			let diff = x-this._object.position.x
			x+=correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, diff, y, this._ProxyPosition, typeRepeat.position, useArea).x;

			this.HTML.style.left = `${x}px`;
			this._object.position.x = x;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.x-=diff}
			}
		}
		if(y!=undefined){
			let diff = y-this._object.position.y
			y+=correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, x, diff, this._ProxyPosition, typeRepeat.position, useArea).y;

			this.HTML.style.top = `${y}px`;
			this._object.position.y = y;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.y-=diff}
			}
		}
	}

	setGlobalPosition(x=undefined, y=undefined, useArea=false){
		if(x!=undefined){
			x = x-this.parent.globalPosition.x;
			let diff = x-this._object.position.x
			x+=correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, diff, y, this._ProxyPosition, typeRepeat.position, useArea).x;

			this._object.position.x = x;
			this.HTML.style.left = `${x}px`;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.x-=diff}
			}
		}
		if(y!=undefined){
			y = y-this.parent.globalPosition.y;
			let diff = y-this._object.position.y
			y+=correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, x, diff, this._ProxyPosition, typeRepeat.position, useArea).y;

			this._object.position.y = y;
			this.HTML.style.top = `${y}px`;
			for(let child of this._object.childs){
				if(child.repeat.position!=typeRepeat.position){child.position.y-=diff}
			}
		}
	}

	setScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setScale(undefined, y, true);
				}
			}
		}
	}

	setGlobalScale(x=undefined, y=undefined, legacy=false){
		if(x!=undefined){
			x = x/this.parent.globalScale.x;
			let diff = x/this._object.scale.x;
			this._object.scale.x=legacy?this._object.scale.x:x;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(x, undefined, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.x*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.x*=diff;
					child.setGlobalScale(x, undefined, true);
				}
			}
		}
		if(y!=undefined){
			y = y/this.parent.globalScale.y;
			let diff = y/this._object.scale.y;
			this._object.scale.y=legacy?this._object.scale.y:y;
			for(let child of this._object.childs){
				if(child.repeat.scale == typeRepeat.scale){
					//
					child.setScale(undefined, y, true);
				} else if (child.repeat.scale == typeRepeat.position){
					child.position.y*=diff;
				} else if (child.repeat.scale == typeRepeat.scalePosition){
					child.position.y*=diff;
					child.setGlobalScale(undefined, y, true);
				}
			}
		}
	}

	setRotate(corner, legacy=false, type=mathLib.typeCorner.degree, useArea=true){
		//corner = mathLib.typeCorner.normalization(corner, type);
		console.log(corner, correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, this.globalPosition.x, this.globalPosition.y, this._ProxyPosition, typeRepeat.rotate, useArea, legacy?corner:corner-this._object.rotate));
		corner = mathLib.typeCorner.normalization(corner+correctionStaticGlobalListArea2Area(this._object.areas, OBJECTS.Area2D, this._object.areas, this.globalPosition.x,  this.globalPosition.y, this._ProxyPosition, typeRepeat.rotate, useArea, legacy?corner:corner-this._object.rotate).rotate, type);
		
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		//
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}
	}

	setGlobalRotate(corner, legacy=false, type=mathLib.typeCorner.degree){
		/*corner=legacy?corner+this._object.rotate:corner;
		let new_rotate = mathLib.typeCorner.normalization(corner-this.parent.globalRotate, type);
		corner = mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:new_rotate;*/
		corner = mathLib.typeCorner.normalization(corner-this.parent.globalRotate, type);
		const diffCorner = legacy?corner:mathLib.typeCorner.normalization(corner-this._object.rotate, type);
		this._object.rotate = legacy?this._object.rotate:corner;
		//this.rotateHTML.style.transform = `rotate(${new_rotate}deg)`;
		for(let child of this._object.childs){
			switch(child.repeat.rotate){
			case typeRepeat.rotate:
				child.setRotate(diffCorner, true, type);
				break
			case typeRepeat.position:

				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			case typeRepeat.rotatePosition:
				child.setRotate(diffCorner, true, type);
				child.position = mathLib.rotatePoint(child.position, diffCorner, {x:0, y:0}, type);
				break
			}
		}
	}

	showObject(value=true){
		if(value){
			let color = randomColor();
			let show = document.createElement('div');
			show.setAttribute('id','show'+this.id);
			show.type = 'showObject'
			show.setAttribute('style',`position:absolute; top:0px; font-size:10px; left:0px; padding:2px; color:${color}; border-radius:0px 5px 5px 5px	; border-color:${color}; border-width:2px 0px 0px 2px; border-style:solid;`);
			show.innerText = this.id
			this.HTML.appendChild(show);
		} else {
			for(let element of this.HTML.children){if(element.type=='showObject'){element.remove()}};
		}
	}
}