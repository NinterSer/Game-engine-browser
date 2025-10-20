////////////////////////////////////////////// SPRITE /////////////////////////////////////////////////////////////
export class Sprite {
	//Ссылки в OBJECT.SPRITE, parent.childs, HTML

	name = "";
	id = "";
	image = "";
	type = "Sprite";
	HTML = null;
	childs = {};
	repeat = {
		position: true,
		rotate: true,
		scale: true,
		rotatePosition: true,
		scalePosition: true
	};


	#_values_ = {
		render: true,
		src: '',
		width: 0,
		height: 0,
		parent:undefined,
		rotate: 0,
		color: undefined,
		scale: {x:1,y:1},
		center:{
			X:0,
			Y:0
		},
		position:{
			X:0,
			Y:0
		},
		globalPosition:{
			X:0,
			Y:0
		},
		scale: {
			_this_:this,
			X:1,
			Y:1
		},
		globalScale: {
			_this_:this,
			X:1,
			Y:1
		},
		modeDevelopment: false,
		animations: null,
		animationPlay: null
	}
	set draw(config){
		//sx, sy, sWidth, sHeight, dx=0, dy=0, dWidth=this.width, dHeight=this.height
		if (config.sx == undefined){config.sx = 0};
		if (config.sy == undefined){config.sy = 0};
		if (config.dx == undefined){config.dx = 0};
		if (config.dy == undefined){config.dy = 0};
		if (config.sWidth == undefined){config.sWidth = this.image.width};
		if (config.sHeight == undefined){config.sHeight = this.image.height};
		if (config.dWidth == undefined){config.dWidth = this.width};
		if (config.dHeight == undefined){config.dHeight = this.height};
		console.log(config);
		this.drawImage(config.sx, config.sy, config.sWidth, config.sHeight, config.dx, config.dy, config.dWidth, config.dHeight);
	};

	set render(render){
		if (render == "pixelated" || render == false){
			this.HTML.style.imageRendering = "pixelated";
			this.#_values_.render = "pixelated";
		} else if (render == "optimizeSpeed" || render == "speed"){
			this.HTML.style.imageRendering = "optimizeSpeed";
			this.#_values_.render = "optimizeSpeed";
		} else if (render == "optimizeQuality" || render == "quality"){
			this.HTML.style.imageRendering = "optimizeQuality";
			this.#_values_.render = "optimizeQuality";
		} else if (render == "inherit"){
			this.HTML.style.imageRendering = "inherit";
			this.#_values_.render = "inherit";
		} else if (render == "crisp-edges" || render == true){
			this.HTML.style.imageRendering = "crisp-edges";
			this.#_values_.render = "crisp-edges";
		} else {
			this.HTML.style.imageRendering = "none";
			this.#_values_.render = "none";
		}
	}
	get render(){return this.#_values_.render};
	
	set src(src){
		this.image.src = src;
		this.#_values_.src = src;
		getMetaDataImage(src, this);
		this.center.x=this.width/2; 
		this.center.y=this.height/2;
		
		this.#adjustObjectImage();
		this.#adjustHTMLelementImage();

		this.HTML.src = src;
	}
	get src(){return this.#_values_.src};

	set width(width){
		this.setWidth(width);
	}
	get width(){return this.#_values_.width}

	set height(height){
		this.setHeight(height);
	}
	get height(){return this.#_values_.height}

	set parent(parent){this.setParent(parent)};
	get parent(){return this.#_values_.parent};

	get position(){
		return {
			_this_:this,
			set x(x){this._this_.setPosition(x,null)},
			get x(){return this._this_.#_values_.position.X},
			set y(y){this._this_.setPosition(null,y)},
			get y(){return this._this_.#_values_.position.Y}
		}
	}
	set position(position){
		if (position.x == undefined || position.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setPosition(position.x,position.y);
		};
	};
	#old_position = {x:0,y:0};
	//globalPosition = {x:0,y:0};
	get globalPosition(){
		return {
			_this_:this,
			set x(x){this._this_.setGlobalPosition(x,null)},
			get x(){return this._this_.#_values_.globalPosition.X},
			set y(y){this._this_.setGlobalPosition(null,y)},
			get y(){return this._this_.#_values_.globalPosition.Y}
		}
	};
	set globalPosition(position){
		if (position.x == undefined || position.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setGlobalPosition(position.x,position.y);
		};
	};

	get center(){
		return {
			_this_:this,
			set x(x){this._this_.setCenter(x,null)},
			get x(){return this._this_.#_values_.center.X},
			set y(y){this._this_.setCenter(null,y)},
			get y(){return this._this_.#_values_.center.Y}
		}
	};
	set center(center){
		if (center.x == undefined || center.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setCenter(center.x,center.y);
		};
	};

	set scale(scale){
		if (scale.x == undefined || scale.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setScale(scale.x,scale.y);
		};
	}
	get scale(){		
		return {
			_this_:this,
			set x(x){this._this_.setScale(x,null)},
			get x(){return this._this_.#_values_.scale.X},
			set y(y){this._this_.setScale(null,y)},
			get y(){return this._this_.#_values_.scale.Y}
		}
	};

	set globalScale(scale){
		if (scale.x == undefined || scale.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setGlobalScale(scale.x,scale.y);
		};
	}
	get globalScale(){		
		return {
			_this_:this,
			set x(x){this._this_.setGlobalScale(x,null)},
			get x(){return this._this_.#_values_.scale.X*this._this_.parent.globalScale.x},
			set y(y){this._this_.setGlobalScale(null,y)},
			get y(){return this._this_.#_values_.scale.Y*this._this_.parent.globalScale.y}
		}
	};

	set rotate(rotate){this.setRotate(rotate, true)};
	get rotate(){return this.#_values_.rotate};

	set globalRotate(rotate){this.setGlobalRotate(rotate, true)};
	get globalRotate(){return this.#_values_.globalRotate};

	#adjustObjectImage(){
		this.image.src = this.#_values_.src;
		this.image.width = this.#_values_.width;
		this.image.height = this.#_values_.height;
	}

	#adjustHTMLelementImage(){
		this.HTML.style.width = this.#_values_.width + 'px';
		this.HTML.style.height = this.#_values_.height + 'px';
		this.HTML.style.position = "absolute";
		this.HTML.style.top = '';
		this.HTML.style.left = '';
	}

	#generationId(lenght=8){
		let result = "Sprite_";
		let arr = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
		for (let i=0; i<lenght; i++){
			result+=arr[Math.floor(Math.random()*arr.length)];
		};
		if(OBJECTS.SPRITE[result] == undefined){
			return result	
		} else {return this.#generationId()};
	};

	#changeGlobalPositionChild(thisGlobal=true){
		for (let key in this.childs){
			if (this.childs[key].area == null && this.childs[key].areaSolid == false){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			} else if (this.childs[key].area != null && this.childs[key].areaSolid == false){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			} else if (this.childs[key].area != null && this.childs[key].areaSolid == true){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			}
		}
	}

	#changeRotateChild(corner){
		for (let key in this.childs){
			if (this.childs[key].repeat.rotate == false){
				this.childs[key].rotate -= corner;
			}
		}
	}

	#changeRotatePositionChild(corner){
		for (let key in this.childs){
			if (this.childs[key].repeat.rotatePosition == true){
				this.childs[key].position = rotatePointAnAngle_notUse(corner, this.childs[key].position, center={x:0,y:0})
				//this.childs[key].rotate -= corner;
			}
		}
	}

	#changeScalePositionChild(differenceScale){
		for (let key in this.childs){
			if (this.childs[key].repeat.scalePosition){
				this.childs[key].position.x += this.childs[key].position.x*differenceScale.x;
				this.childs[key].position.y += this.childs[key].position.y*differenceScale.y;
			}
		}
	}

	#changeScaleChild(scale){
		for (let key in this.childs){
			if (this.childs[key].repeat.scale){
				this.childs[key].position.x = this.childs[key].scale.x*scale.x;
				this.childs[key].position.y = this.childs[key].scale.y*scale.y;
			}
		}
	}

	#displayingInformationDeveloper(value=false){
		if (value==true && this.#_values_.modeDevelopment == false){
			if (this.#_values_.color == undefined){this.#_values_.color = randomColor();}
			this.HTML.style.width = '1px';
			this.HTML.style.height = '1px';
			this.HTML.style.backgroundColor = this.#_values_.color;

			/*this.#_values_.canvas = document.createElement('canvas');
			this.#_values_.canvas.id = 'canvas'+this.id;
			this.HTML.appendChild(this.#_values_.canvas);
			if (this.#_values_.canvas.getContext && this.#_values_.area.length > 0){
				let pS = {x:this.area.left().x,y:this.area.top().y};
				this.#_values_.canvas.style.position = 'absolute';
				this.#_values_.canvas.width = this.area.right().x-pS.x;
				this.#_values_.canvas.height = this.area.bottom().y-pS.y;
				this.#_values_.canvas.style.left = pS.x+"px";
				this.#_values_.canvas.style.top = pS.y+"px";
				let ctx = this.#_values_.canvas.getContext("2d");
				ctx.beginPath();
				ctx.moveTo(this.area[0].x-pS.x,this.area[0].y-pS.y);
				for (let i=1; i<this.#_values_.area.length; i++){
					ctx.lineTo(this.area[i].x-pS.x,this.area[i].y-pS.y);
				}
				if (this.#_values_.area[0].x != this.#_values_.area[this.#_values_.area.length-1].x || this.#_values_.area[0].y != this.#_values_.area[this.#_values_.area.length-1].y){ctx.lineTo(this.area[0].x-pS.x,this.area[0].y-pS.y);}
				ctx.strokeStyle = this.#_values_.color;
				ctx.stroke();
			}*/
		} else if (value==true && this.#_values_.modeDevelopment == true){
			null;
			/*this.HTML.removeChild(this.#_values_.canvas);
			this.#_values_.canvas = document.createElement('canvas');
			this.#_values_.canvas.id = 'canvas'+this.id;
			this.HTML.appendChild(this.#_values_.canvas);
			if (this.#_values_.canvas.getContext && this.#_values_.area.length > 0){
				let pS = {x:this.area.left().x,y:this.area.top().y};
				this.#_values_.canvas.style.position = 'absolute';
				this.#_values_.canvas.width = this.area.right().x-pS.x;
				this.#_values_.canvas.height = this.area.bottom().y-pS.y;
				this.#_values_.canvas.style.left = pS.x+"px";
				this.#_values_.canvas.style.top = pS.y+"px";
				let ctx = this.#_values_.canvas.getContext("2d");
				ctx.beginPath();
				ctx.moveTo(this.area[0].x-pS.x,this.area[0].y-pS.y);
				for (let i=1; i<this.#_values_.area.length; i++){
					ctx.lineTo(this.area[i].x-pS.x,this.area[i].y-pS.y);
				}
				if (this.#_values_.area[0].x != this.#_values_.area[this.#_values_.area.length-1].x || this.#_values_.area[0].y != this.#_values_.area[this.#_values_.area.length-1].y){ctx.lineTo(this.area[0].x-pS.x,this.area[0].y-pS.y);}
				ctx.strokeStyle = this.#_values_.color;
				ctx.stroke();
			}*/
		} else if (value==false && this.#_values_.modeDevelopment == false){ 
			null;
		}else {
			this.HTML.style.backgroundColor = "rgba(0,0,0,0);"
			/*this.HTML.style.width = '0px';
			this.HTML.style.height = '0px';
			this.HTML.removeChild(this.#_values_.canvas);*/
		}
	}

	constructor(config={
		src: '',
		drawImage: {}
	}){
		if(config.name == undefined){config.name = "Sprite_"+Object.keys(OBJECTS.STATIC).length}; 						//name
		if(config.parent == undefined){config.parent = SCENE};	
		if(config.src == undefined){config.src = '';};
		if(config.center == undefined){config.center = {x:0,y:0}};
		if(config.position == undefined){config.position = {x:0,y:0}};									//position
		if(config.position.x == undefined){config.position.x=(config.x==undefined)?0:config.x;};						//position.x
		if(config.position.y == undefined){config.position.y=(config.y==undefined)?0:config.y;};						//position.y
		try{
			if(config.globalPosition.x!=undefined){config.position.x=config.globalPosition.x-parent.globalPosition.x};	//position.x <- globalPosition.x
			if(config.globalPosition.y!=undefined){config.position.y=config.globalPosition.y-parent.globalPosition.y};	//position.x <- globalPosition.x
		} catch {undefined};
		if(config.size == undefined){config.size = {x:0,y:0,z:0}};								//size
		if(config.size.x==undefined){config.size.x=0};																	//size.x
		if(config.size.y==undefined){config.size.y=0};																	//size.y
		if(config.size.z==undefined){config.size.z=0};
		if(config.render==undefined){config.render = true};
		if(config.corner==undefined){config.corner = 0};

		this.name = config.name;
		let id = this.#generationId();
		this.id = id;
		this.HTML = document.createElement('canvas');																			
		this.HTML.setAttribute('id',id);
		this.parent = config.parent;
		this.HTML.style.position = "absolute";
		this.image = new Image();
		this.ctx = this.HTML.getContext('2d');
		this.image.onload = ()=>{
			this.ctx.canvas.width = this.image.width;
			this.ctx.canvas.height = this.image.height;
			this.ctx.drawImage(this.image, 0,0,this.width,this.height);
		};
		this.src = config.src;
		this.image.src = this.src;

		if (config.width == undefined || config.height == undefined){getMetaDataImage(this.src, this); this.center.x=this.width/2; this.center.y=this.height/2;} else {
			
		};
		if (config.drawImage != undefined){
			this.draw = config.drawImage;
		}

		this.image.width = this.width;
		this.image.height = this.height;
		this.HTML.style.width = this.width;
		this.HTML.style.height = this.height;
		this.position.x = config.position.x;
		this.position.y = config.position.y;
		this.render = config.render;
		this.corner = config.corner;
	}

	splitIntoFrames(width, height){
		let anim = this.width/width - this.width%width;
		let fram = this.height/height - this.height%height;

		for (let i=0; i<anim; i++){

			for (let l=0; l<fram; l++){

			}
		}
	}

	createAnimation(
		name,
		x=0,
		y=0,
		width=this.width,
		height=this.height,
		frames=1,
		repeat=true,
		TimeFrame=60,
		){
		this.#_values_.animations = {};
		this.#_values_.animations[name] = {name:name,x:x,y:y,width:width,height:height,frames:frames,currentFrame:0,repeat:repeat,TimeFrame:TimeFrame,tickCount:0,status:'stop'};
	}

	playAnimation(name){
		let anim = this.#_values_.animations[name];
		for (let key in this.#_values_.animations){
			this.stopAnimation(this.#_values_.animations[key].name);
		};
		anim.status = 'play';
		this.#_values_.animationPlay = anim;
		setTimeout(()=>this.#player(anim),anim.TimeFrame);
	}

	stopAnimation(name){
		let anim = this.#_values_.animations[name];
		anim.status = 'stop';
		anim.currentFrame = 0;
	}

	#updateAnimation(animation){
		if (typeof animation == 'str'){
			animation = this.#_values_.animations[animation];
		}

        if (animation.currentFrame < animation.numberOfFrames - 1) {
            animation.currentFrame++;
        } else if (animation.repeat == true){
            animation.currentFrame = 0;
        } else {
        	this.stopAnimation(animation.name);
        }
        
	}

	#render(animation) {
      this.ctx.clearRect(0, 0, animation.width / animation.numberOfFrames, animation.height);
        this.ctx.drawImage(
            this.image,
            animation.currentFrame * animation.width / animation.numberOfFrames,
            0,
            animation.width / animation.numberOfFrames,
            animation.height,
            0,
            0,
            animation.width / animation.numberOfFrames,
            animation.height
        )
    }

    #player(animation){
    	this.#updateAnimation(this.#_values_.animationPlay);
    	this.#render(this.#_values_.animationPlay);
    	setTimeout(()=>this.#player(animation),animation.TimeFrame);
    }

    drawImage(sx, sy, sWidth, sHeight, dx=0, dy=0, dWidth=this.width, dHeight=this.height){
    	console.log(0,0,this.width,this.height);
    	this.ctx.clearRect(0,0,this.width,this.height);
    	this.width = dWidth;
    	this.height = dHeight;
    	this.ctx.drawImage(this.image, sx,sy,sWidth,sHeight, dx,dy,dWidth,dHeight);
    }

	setPosition(x=null,y=null){
		if(x!=null){
			this.#_values_.position.X = x;
			this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
			this.HTML.style.left = String(x-this.center.x)+"px";	
		};
		if(y!=null){
			this.#_values_.position.Y = y;
			this.#_values_.globalPosition.Y = this.parent.globalPosition.Y+y;
			this.HTML.style.top = String(y-this.center.y)+"px";	
		}
		this.#changeGlobalPositionChild();
	}

	setGlobalPosition(x=null,y=null){
		if(x!=null){
			this.#_values_.globalPosition.X = x;
			this.#_values_.position.X = this.#_values_.globalPosition.X-this.parent.globalPosition.x;
			this.HTML.style.left = String(this.#_values_.position.X-this.center.x)+"px";
		}
		if(y!=null){
			this.#_values_.globalPosition.Y = y;
			this.#_values_.position.Y = this.#_values_.globalPosition.Y-this.parent.globalPosition.y;
			this.HTML.style.top = String(this.#_values_.position.Y-this.center.y)+"px";
		}
		this.#changeGlobalPositionChild();
	}

	setParent(value){
		this.#_values_.parent = value;
		this.parent.HTML.appendChild(this.HTML);
		this.parent.childs[this.id] = this;
	}

	setCenter(x=null,y=null){
		if (x!=null){
			this.HTML.style.left = String(-1*x);
			this.#_values_.center.X = x;
		};
		if (y!=null){
			this.HTML.style.top = String(-1*y);
			this.#_values_.center.Y = y;
		};
	}

	setWidth(width){
		if(this.#_values_.width != 0){this.#_values_.center.X = this.#_values_.center.X/this.#_values_.width*width};
		if(this.#_values_.width != 0){this.#_values_.position.X = this.#_values_.position.X/this.#_values_.width*width};
		this.#_values_.globalPosition.X = this.parent.globalPosition.x+this.#_values_.position.X;
		this.#_values_.width = width;
		this.HTML.style.left = String(this.#_values_.position.X-this.#_values_.center.X)+"px";
		this.HTML.style.width = width+"px";
		this.image.width = width;
		this.#_values_.width = width;
	}

	setHeight(height){
		if(this.#_values_.height != 0){this.#_values_.center.Y = this.#_values_.center.Y/this.#_values_.height*height};
		if(this.#_values_.height != 0){this.#_values_.position.Y = this.#_values_.position.Y/this.#_values_.height*height};
		this.#_values_.globalPosition.Y = this.parent.globalPosition.Y+this.#_values_.position.Y;
		this.#_values_.height = height;
		this.HTML.style.top = String(this.#_values_.position.Y-this.#_values_.center.Y)+"px";
		this.HTML.style.height = height+"px";
		this.image.height = height;
		this.#_values_.height = height;
	}

	setScale(x=null,y=null){
		let differenceScale = {x:this.#_values_.scale.X, y:this.#_values_.scale.Y};

		if(x!=null){
			differenceScale.x = x-this.#_values_.scale.X;
			this.HTML.style.width = this.width*x;
			this.HTML.style.left = this.center.x*x*-1;
			this.#_values_.scale.X = x;
			this.#_values_.globalScale.X = x*this.parent.globalScale.x;
		};
		if(y!=null){
			differenceScale.y = y-this.#_values_.scale.Y;
			this.HTML.style.height = this.height*y;
			this.HTML.style.top = this.center.y*y*-1;
			this.#_values_.scale.Y = y;
			this.#_values_.globalScale.Y = y*this.parent.globalScale.y;
		};

		this.#changeScalePositionChild(differenceScale);
		this.#changeScaleChild({x:this.#_values_.scale.X,y:this.#_values_.scale.Y});
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}

	setGlobalScale(x=null,y=null){
		let differenceScale = {x:this.#_values_.scale.X, y:this.#_values_.scale.Y};

		if(x!=null){
			x = x/this.parent.globalScale.x;
			differenceScale.x = x-this.#_values_.scale.X;
			this.HTML.style.width = this.width*x;
			this.HTML.style.left = this.center.x*x*-1;
			this.#_values_.scale.X = x;
			this.#_values_.globalScale.X = x*this.parent.globalScale.x;
		};
		if(y!=null){
			y = y/this.parent.globalScale.y;
			differenceScale.y = y-this.#_values_.scale.Y;
			this.HTML.style.height = this.height*y;
			this.HTML.style.top = this.center.y*y*-1;
			this.#_values_.scale.Y = y;
			this.#_values_.globalScale.Y = y*this.parent.globalScale.y;
		};

		this.#changeScalePositionChild(differenceScale);
		this.#changeScaleChild({x:this.#_values_.scale.X,y:this.#_values_.scale.Y});
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}

	setRotate(corner, degrees=true){
		if (degrees){
			this.#changeRotateChild(corner-this.#_values_.rotate);
			this.#changeRotatePositionChild(corner-this.#_values_.rotate);
			//let position = rotatePointAnAngle(corner, {x:this.HTML.offsetLeft, y:this.HTML.offsetTop}, {x:0,y:0});
			this.#_values_.rotate = corner;
			this.#_values_.globalRotate = corner+this.parent.globalRotate;
			corner = corner*Math.PI/180;
			//this.HTML.style.top = position.y;
			//this.HTML.style.left = position.x;
			this.HTML.style.transform = 'rotate('+corner+'rad)';
		} else {
			let corner_deg = corner*180/Math.PI;
			this.#changeRotateChild(corner_deg-this.#_values_.rotate);
			this.#changeRotatePositionChild(corner_deg-this.#_values_.rotate);
			//let position = rotatePointAnAngle(corner_deg, {x:this.HTML.offsetLeft, y:this.HTML.offsetTop}, {x:0,y:0});
			this.#_values_.rotate = corner_deg;
			this.#_values_.globalRotate = corner+this.parent.globalRotate;
			//this.HTML.style.top = position.y;
			//this.HTML.style.left = position.x;
			this.HTML.style.transform = 'rotate('+corner+'rad)';
		}
	}

	setGlobalRotate(corner, degrees=true){
		if (degrees){
			this.#_values_.globalRotate = corner;
			corner = corner-this.parent.globalRotate;
			this.#changeRotateChild(corner-this.#_values_.rotate);
			this.#changeRotatePositionChild(corner-this.#_values_.rotate);
			this.#_values_.rotate = corner;
			//let position = rotatePointAnAngle(corner, {x:this.HTML.offsetLeft, y:this.HTML.offsetTop}, {x:0,y:0});
			corner = corner*Math.PI/180;
			//this.HTML.style.top = position.y;
			//this.HTML.style.left = position.x;
			this.HTML.style.transform = 'rotate('+corner+'rad)';
		} else {
			let corner_deg = corner*180/Math.PI;
			this.#_values_.globalRotate = corner_deg;
			corner_deg = corner_deg-this.parent.globalRotate;
			this.#_values_.rotate = corner_deg;
			this.#changeRotateChild(corner_deg-this.#_values_.rotate);
			this.#changeRotatePositionChild(corner_deg-this.#_values_.rotate);
			//let position = rotatePointAnAngle(corner_deg, {x:this.HTML.offsetLeft, y:this.HTML.offsetTop}, {x:0,y:0});
			//this.HTML.style.top = position.y;
			//this.HTML.style.left = position.x;
			this.HTML.style.transform = 'rotate('+corner+'rad)';
		}
	}

}

////////////////////////////////////////////// STATIC /////////////////////////////////////////////////////////////

export class Static {
	//Ссылки в OBJECTS.STATIC, parent.childs, HTML
	//Касается при любом изменении Area, childs,
	name = "";
	id = "";
	useSpeed = false;
	areaSolid = false;
	type = "Static";
	sprites = null;

	set parent(parent){this.setParent(parent)};
	get parent(){return this.#_values_.parent};

	set modeDevelopment(value){this.#displayingInformationDeveloper(value); this.#_values_.modeDevelopment = value;};
	get modeDevelopment(){return this.#_values_.modeDevelopment};

	set area(area){this.setArea(area)}
	get area(){//return this.#_values_.area
		if (this.#_values_.area != null){
			let array = [];
			for (let i=0; i<this.#_values_.area.length; i++){
				array[i] = {x:null,y:null};
				array[i] = rotatePointAnAngle(this.#_values_.rotate, {x:this.#_values_.area[i].x*this.#_values_.scale.X,y:this.#_values_.area[i].y*this.#_values_.scale.Y}, this.center);
			};
			array.left = this.#_values_.area.left;
			array.top = this.#_values_.area.top;
			array.right = this.#_values_.area.right;
			array.bottom = this.#_values_.area.bottom;
			array.rectangle = this.#_values_.area.rectangle;
			array.center = this.#_values_.area.center;
			array.move = this.#_values_.area.move;
			return array
		} else {return null}
	}

	set globalArea(area){this.setGlobalArea(area)}
	get globalArea(){
		let array = [];
		for (let i=0; i<this.#_values_.area.length; i++){
			array[i] = {x:null,y:null};
			array[i] = rotatePointAnAngle(this.#_values_.rotate, {x:this.#_values_.area[i].x*this.#_values_.scale.X,y:this.#_values_.area[i].y*this.#_values_.scale.Y}, this.center);
			array[i].x += this.globalPosition.x;
			array[i].y += this.globalPosition.y;
		};
		array.left = this.#_values_.area.left;
		array.top = this.#_values_.area.top;
		array.right = this.#_values_.area.right;
		array.bottom = this.#_values_.area.bottom;
		array.rectangle = this.#_values_.area.rectangle;
		array.center = this.#_values_.area.center;
		array.move = this.#_values_.area.move;
		array.distanceToCamera = function(){
			let A = distanceBetweenPoints(this[0],camera.position);
			for (let i=0; i<this.length; i++){
				A = (distanceBetweenPoints(this[i],{x:camera.position.x-camera.width*camera.zoom/2,y:camera.position.x-camera.height*camera.zoom/2})<A)?distanceBetweenPoints(this[i],{x:camera.position.x-camera.width*camera.zoom/2,y:camera.position.x-camera.height*camera.zoom/2}):A;
				A = (distanceBetweenPoints(this[i],{x:camera.position.x+camera.width*camera.zoom/2,y:camera.position.x-camera.height*camera.zoom/2})<A)?distanceBetweenPoints(this[i],{x:camera.position.x+camera.width*camera.zoom/2,y:camera.position.x-camera.height*camera.zoom/2}):A;
				A = (distanceBetweenPoints(this[i],{x:camera.position.x+camera.width*camera.zoom/2,y:camera.position.x+camera.height*camera.zoom/2})<A)?distanceBetweenPoints(this[i],{x:camera.position.x+camera.width*camera.zoom/2,y:camera.position.x+camera.height*camera.zoom/2}):A;
				A = (distanceBetweenPoints(this[i],{x:camera.position.x-camera.width*camera.zoom/2,y:camera.position.x+camera.height*camera.zoom/2})<A)?distanceBetweenPoints(this[i],{x:camera.position.x-camera.width*camera.zoom/2,y:camera.position.x+camera.height*camera.zoom/2}):A;
			}
			return A
		}
		return array
	};

	childs = {};
	repeat = {
		position: true,
		rotate: true,
		scale: true,
		rotatePosition: true,
		scalePosition: true
	};

	

	#_values_ = {
		_this_:this,
		canvas: undefined,
		color: undefined,
		modeDevelopment:false,
		parent: null,
		rotate: 0,
		globalRotate: 0,
		position:{
			_this_:this,
			X:0,
			set x(x){this._this_.setPosition(x,null);},
			get x(){return this.X},
			Y:0,
			set y(y){this._this_.setPosition(null,y)},
			get y(){return this.Y}
		},
		globalPosition:{
			_this_:this,
			X:0,
			set x(x){this._this_.setGlobalPosition(x,null)},
			get x(){return this.X},
			Y:0,
			set y(y){this._this_.setGlobalPosition(null,y)},
			get y(){return this.Y}
		},
		size:{
			_this_:this,
			X:0,
			set x(x){this._this_.setSize(x,null,null)},
			get x(){return this.X},
			Y:0,
			set y(y){this._this_.setSize(null,y,null)},
			get y(){return this.Y},
			Z:0,
			set z(z){this._this_.setSize(null,null,z)},
			get z(){return this.Z}
		},
		center:{
			_this_:this,
			X:0,
			set x(x){this._this_.setCenter(x,null)},
			get x(){return this.X},
			Y:0,
			set y(y){this._this_.setCenter(null,y)},
			get y(){return this.Y}
		},
		area:null,
		areaMode:null,
		scale: {
			_this_:this,
			X:1,
			Y:1
		},
		globalScale: {
			_this_:this,
			X:1,
			Y:1
		}
	}
	//position = {x:0,y:0};
	//get position(){return {x:this.#_values_.position.x,y:this.#_values_.position.y}};
	get position(){
		return {
			_this_:this,
			set x(x){this._this_.setPosition(x,null)},
			get x(){return this._this_.#_values_.position.X},
			set y(y){this._this_.setPosition(null,y)},
			get y(){return this._this_.#_values_.position.Y}
		}
	}
	set position(position){
		if (position.x == undefined || position.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setPosition(position.x,position.y);
		};
	};
	#old_position = {x:0,y:0};
	//globalPosition = {x:0,y:0};
	get globalPosition(){
		return {
			_this_:this,
			set x(x){this._this_.setGlobalPosition(x,null)},
			get x(){return this._this_.#_values_.globalPosition.X},
			set y(y){this._this_.setGlobalPosition(null,y)},
			get y(){return this._this_.#_values_.globalPosition.Y}
		}
	};
	set globalPosition(position){
		if (position.x == undefined || position.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setGlobalPosition(position.x,position.y);
		};
	};
	#old_globalPosition = {x:0,y:0};
	set size(size){
		if (size.x == undefined || size.y == undefined || size.z == undefined){console.log(error_4[LANGUAGE]);} else {
			this.setSize(size.x,size.y,size.z);}
	};
	get size(){		
		return {
			_this_:this,
			set x(x){this._this_.setSize(x,null)},
			get x(){return this._this_.#_values_.size.X},
			set y(y){this._this_.setSize(null,y)},
			get y(){return this._this_.#_values_.size.Y}
		}
	};

	set center(center){
		if (center.x == undefined || center.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setCenter(center.x,center.y);
		};
	}
	get center(){		
		return {
			_this_:this,
			set x(x){this._this_.setCenter(x,null)},
			get x(){return this._this_.#_values_.center.X},
			set y(y){this._this_.setCenter(null,y)},
			get y(){return this._this_.#_values_.center.Y}
		}
	}

	set scale(scale){
		if (scale.x == undefined || scale.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setScale(scale.x,scale.y);
		};
	}
	get scale(){		
		return {
			_this_:this,
			set x(x){this._this_.setScale(x,null)},
			get x(){return this._this_.#_values_.scale.X},
			set y(y){this._this_.setScale(null,y)},
			get y(){return this._this_.#_values_.scale.Y}
		}
	};

	set globalScale(scale){
		if (scale.x == undefined || scale.y == undefined){console.log(error_3[LANGUAGE]);} else {
			this.setGlobalScale(scale.x,scale.y);
		};
	}
	get globalScale(){		
		return {
			_this_:this,
			set x(x){this._this_.setGlobalScale(x,null)},
			get x(){return this._this_.#_values_.scale.X*this._this_.parent.globalScale.x},
			set y(y){this._this_.setGlobalScale(null,y)},
			get y(){return this._this_.#_values_.scale.Y*this._this_.parent.globalScale.y}
		}
	};

	set rotate(rotate){this.setRotate(rotate, true)};
	get rotate(){return this.#_values_.rotate};

	set globalRotate(rotate){this.setGlobalRotate(rotate, true)};
	get globalRotate(){return this.#_values_.rotate+this.parent.globalRotate}

	#offsetCenter = {x:0,y:0};

	HTML = undefined;

	//physics variables
	speed = null;
	globalSpeed = null;
	mass = null;
	//-----------------

	#generationId(lenght=8){
		let result = "Static_";
		let arr = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
		for (let i=0; i<lenght; i++){
			result+=arr[Math.floor(Math.random()*arr.length)];
		};
		if(OBJECTS.STATIC[result] == undefined){
			return result	
		} else {return this.#generationId()};
	};

	#checkSpeed(){
		this.speed = Math.sqrt(Math.pow(Math.abs(this.#_values_.position.x-this.old_position.x),2)+Math.pow(this.#_values_.position.y-this.old_position.y,2));
		this.globalSpeed = Math.sqrt(Math.pow(Math.abs(this.#_values_.globalPosition.x-this.old_globalPosition.x),2)+Math.pow(this.#_values_.globalPosition.y-this.old_globalPosition.y,2));
		this.old_globalPosition = this.#_values_.globalPosition;
		this.old_position = this.#_values_.position;
	};

	#changeGlobalPositionChild(thisGlobal=true){
		for (let key in this.childs){
			if (this.childs[key].area == null && this.childs[key].areaSolid == false){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			} else if (this.childs[key].area != null && this.childs[key].areaSolid == false){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			} else if (this.childs[key].area != null && this.childs[key].areaSolid == true){
				this.childs[key].globalPosition.x = this.globalPosition.x+this.childs[key].position.x;
				this.childs[key].globalPosition.y = this.globalPosition.y+this.childs[key].position.y;
			}
		}
	}

	#changeRotateChild(corner){
		for (let key in this.childs){
			if (this.childs[key].repeat.rotate == false){
				console.log(this.childs[key].repeat.rotate);
				this.childs[key].rotate -= corner;
			}
		}
	}

	#changeRotatePositionChild(corner){
		for (let key in this.childs){
			if (this.childs[key].repeat.rotatePosition == true){
				this.childs[key].position = rotatePointAnAngle_notUse(corner, this.childs[key].position, center={x:0,y:0})
				//this.childs[key].rotate -= corner;
			}
		}
	}

	#changeScalePositionChild(differenceScale){
		for (let key in this.childs){
			if (this.childs[key].repeat.scalePosition){
				this.childs[key].position.x += this.childs[key].position.x*differenceScale.x;
				this.childs[key].position.y += this.childs[key].position.y*differenceScale.y;
			}
		}
	}

	#changeScaleChild(scale){
		for (let key in this.childs){
			if (this.childs[key].repeat.scale){
				this.childs[key].position.x = this.childs[key].scale.x*scale.x;
				this.childs[key].position.y = this.childs[key].scale.y*scale.y;
			}
		}
	}

	#displayingInformationDeveloper(value=false){
		if (value==true && this.#_values_.modeDevelopment == false){
			if (this.#_values_.color == undefined){this.#_values_.color = randomColor();}
			this.HTML.style.width = '1px';
			this.HTML.style.height = '1px';
			this.HTML.style.backgroundColor = this.#_values_.color;

			this.#_values_.canvas = document.createElement('canvas');
			this.#_values_.canvas.id = 'canvas'+this.id;
			this.HTML.appendChild(this.#_values_.canvas);
			if (this.#_values_.canvas.getContext && this.#_values_.area.length > 0){
				let pS = {x:this.area.left().x,y:this.area.top().y};
				this.#_values_.canvas.style.position = 'absolute';
				this.#_values_.canvas.width = this.area.right().x-pS.x;
				this.#_values_.canvas.height = this.area.bottom().y-pS.y;
				this.#_values_.canvas.style.left = pS.x+"px";
				this.#_values_.canvas.style.top = pS.y+"px";
				let ctx = this.#_values_.canvas.getContext("2d");
				ctx.beginPath();
				ctx.moveTo(this.area[0].x-pS.x,this.area[0].y-pS.y);
				for (let i=1; i<this.#_values_.area.length; i++){
					ctx.lineTo(this.area[i].x-pS.x,this.area[i].y-pS.y);
				}
				if (this.#_values_.area[0].x != this.#_values_.area[this.#_values_.area.length-1].x || this.#_values_.area[0].y != this.#_values_.area[this.#_values_.area.length-1].y){ctx.lineTo(this.area[0].x-pS.x,this.area[0].y-pS.y);}
				ctx.strokeStyle = this.#_values_.color;
				ctx.stroke();
			}
		} else if (value==true && this.#_values_.modeDevelopment == true){
			this.HTML.removeChild(this.#_values_.canvas);
			this.#_values_.canvas = document.createElement('canvas');
			this.#_values_.canvas.id = 'canvas'+this.id;
			this.HTML.appendChild(this.#_values_.canvas);
			if (this.#_values_.canvas.getContext && this.#_values_.area.length > 0){
				let pS = {x:this.area.left().x,y:this.area.top().y};
				this.#_values_.canvas.style.position = 'absolute';
				this.#_values_.canvas.width = this.area.right().x-pS.x;
				this.#_values_.canvas.height = this.area.bottom().y-pS.y;
				this.#_values_.canvas.style.left = pS.x+"px";
				this.#_values_.canvas.style.top = pS.y+"px";
				let ctx = this.#_values_.canvas.getContext("2d");
				ctx.beginPath();
				ctx.moveTo(this.area[0].x-pS.x,this.area[0].y-pS.y);
				for (let i=1; i<this.#_values_.area.length; i++){
					ctx.lineTo(this.area[i].x-pS.x,this.area[i].y-pS.y);
				}
				if (this.#_values_.area[0].x != this.#_values_.area[this.#_values_.area.length-1].x || this.#_values_.area[0].y != this.#_values_.area[this.#_values_.area.length-1].y){ctx.lineTo(this.area[0].x-pS.x,this.area[0].y-pS.y);}
				ctx.strokeStyle = this.#_values_.color;
				ctx.stroke();
			}
		} else if (value==false && this.#_values_.modeDevelopment == false){ 
			null;
		}else {
			this.HTML.style.width = '0px';
			this.HTML.style.height = '0px';
			this.HTML.removeChild(this.#_values_.canvas);
		}
	}

	#updateAreaMode(){
		if (this.#_values_.area != null){
			let array = [];
			for (let i=0; i<this.#_values_.area.length; i++){
				array[i] = {x:null,y:null};
				array[i].x = this.#_values_.area[i].x;
				array[i].y = this.#_values_.area[i].y;
				array[i] = rotatePointAnAngle(this.#_values_.rotate, {x:this.#_values_.area[i].x*this.#_values_.scale.X,y:this.#_values_.area[i].y*this.#_values_.scale.Y}, this.center);
			};
			array.left = this.#_values_.area.left;
			array.top = this.#_values_.area.top;
			array.right = this.#_values_.area.right;
			array.bottom = this.#_values_.area.bottom;
			array.rectangle = this.#_values_.area.rectangle;
			array.center = this.#_values_.area.center;
			array.move = this.#_values_.area.move;
			this.#_values_.areaMode = array;
		} else {this.#_values_.areaMode = null;}
	}

	constructor(config={
		autoConfiguration: true,
		name:"Static_"+Object.keys(OBJECTS.STATIC).length,
		parent:SCENE,
		position:{x:0,y:0},
		size:{x:0,y:0,z:0},
		rotate:0,
		scale:{x:1,y:1},
		useSpeed: false,
		area: undefined,
		areaSolid: false
	}){	

		if (config.autoConfiguration == undefined || config.autoConfiguration == false){
			if(config.name == undefined){config.name = "Static_"+Object.keys(OBJECTS.STATIC).length}; 						//name
			if(config.parent == undefined){config.parent = SCENE};															//parent
			if(config.id != undefined){console.log(error_0[LANGUAGE])};														//id
			if(config.position == undefined){config.position = {x:undefined,y:undefined}};									//position
			if(config.position.x == undefined){config.position.x=(config.x==undefined)?0:config.x;};						//position.x
			if(config.position.y == undefined){config.position.y=(config.y==undefined)?0:config.y;};						//position.y	
			if(config.scale == undefined){config.scale = {x:undefined,y:undefined}};										//scale
			if(config.scale.x == undefined){config.scale.x=1};																//scale.x
			if(config.position.y == undefined){config.scale.y=1;};															//scale.y
			if(config.rotate == undefined){config.rotate = 0};
			try{
				if(config.globalPosition.x!=undefined){config.position.x=config.globalPosition.x-parent.globalPosition.x};	//position.x <- globalPosition.x
				if(config.globalPosition.y!=undefined){config.position.y=config.globalPosition.y-parent.globalPosition.y};	//position.x <- globalPosition.x
			} catch {undefined};
			if(config.size == undefined){config.size = {x:undefined,y:undefined,z:undefined}};								//size
			if(config.size.x==undefined){config.size.x=0};																	//size.x
			if(config.size.y==undefined){config.size.y=0};																	//size.y
			if(config.size.z==undefined){config.size.z=0};																	//size.z
			if(config.useSpeed==undefined){config.useSpeed = false};														//useSpeed
			if(config.area==undefined){config.area = undefined};															//area
			if(config.areaSolid==undefined){config.areaSolid = false};														//areaSolid
			if(config.center != undefined){console.log(error_1[LANGUAGE])};													//center						
			if(config.corner==undefined){config.corner = 0};								
		}

		this.name = config.name; 																							//name
		let id = this.#generationId(); 																						//id
		this.id = id;
		OBJECTS.STATIC[id] = this;
		this.HTML = document.createElement('div');																			//HTML
		this.HTML.setAttribute('id',id);
		this.parent = config.parent;																						//parent
		//config.parent.childs[id] = this;
		//this.parent.HTML.appendChild(this.HTML);
		this.HTML.style.position = "absolute";
		this.position.x = config.position.x;																				//position.x
		this.HTML.style.left = String(config.position.x)+"px";
		this.globalPosition.x = config.position.x+config.parent.globalPosition.x;											//globalPosition.x
		this.position.y = config.position.y;																				//position.y
		this.HTML.style.top = String(config.position.y)+"px";
		this.globalPosition.y = config.position.y+config.parent.globalPosition.y;											//globalPosition.y
		this.size.x = config.size.x;																						//size.x
		this.HTML.style.width = String(this.size.x)+"px";
		this.size.y = config.size.y;																						//size.y
		this.HTML.style.height = String(this.size.y)+"px";
		this.size.z = config.size.z;																						//size.z
		this.HTML.style.zIndex = String(this.size.z);
		this.rotate = config.rotate;																						//rotate
		this.scale = config.scale;																							//scale
		this.useSpeed = config.useSpeed;																					//useSpeed
		this.area = config.area;																							//area
		this.areaSolid = config.areaSolid;																					//areaSolid
		this.corner = config.corner;
	}

	setPosition(x=null,y=null){
		if (this.area == null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.position.X = x;
				this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
				this.HTML.style.left = String(x)+"px";	
			};
			if(y!=null){
				this.#_values_.position.Y = y;
				this.#_values_.globalPosition.Y = this.parent.globalPosition.Y+y;
				this.HTML.style.top = String(y)+"px";	
			}
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.position.X = x;
				this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
				this.HTML.style.left = String(x)+"px";	
			};
			if(y!=null){
				this.#_values_.position.Y = y;
				this.#_values_.globalPosition.Y = this.parent.globalPosition.Y+y;
				this.HTML.style.top = String(y)+"px";	
			}
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == true){
			if(x!=null){
				this.#_values_.position.X = x;
				this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
				this.HTML.style.left = String(x)+"px";	
			};
			if(y!=null){
				this.#_values_.position.Y = y;
				this.#_values_.globalPosition.Y = this.parent.globalPosition.Y+y;
				this.HTML.style.top = String(y)+"px";	
			}
			this.#changeGlobalPositionChild();
		}
	}

	setGlobalPosition(x=null,y=null){
		if (this.area == null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.globalPosition.X = x;
				this.#_values_.position.X = this.#_values_.globalPosition.X-this.parent.globalPosition.x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			}
			if(y!=null){
				this.#_values_.globalPosition.Y = y;
				this.#_values_.position.Y = this.#_values_.globalPosition.Y-this.parent.globalPosition.y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			}
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.globalPosition.X = x;
				this.#_values_.position.X = this.#_values_.globalPosition.X-this.parent.globalPosition.x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			}
			if(y!=null){
				this.#_values_.globalPosition.Y = y;
				this.#_values_.position.Y = this.#_values_.globalPosition.Y-this.parent.globalPosition.y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			}
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == true){
			if(x!=null){
				this.#_values_.globalPosition.X = x;
				this.#_values_.position.X = this.#_values_.globalPosition.X-this.parent.globalPosition.x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			}
			if(y!=null){
				this.#_values_.globalPosition.Y = y;
				this.#_values_.position.Y = this.#_values_.globalPosition.Y-this.parent.globalPosition.y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			}
			this.#changeGlobalPositionChild();
		}
	}

	move(x=null,y=null){
		if (this.area == null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.position.X += x;
				this.#_values_.globalPosition.X += x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			};
			if(y!=null){
				this.#_values_.position.Y += y;
				this.#_values_.globalPosition.Y += y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			};
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == false){
			if(x!=null){
				this.#_values_.position.X += x;
				this.#_values_.globalPosition.X += x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			};
			if(y!=null){
				this.#_values_.position.Y += y;
				this.#_values_.globalPosition.Y += y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			};
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == true){
			if(x!=null){
				this.#_values_.position.X += x;
				this.#_values_.globalPosition.X += x;
				this.HTML.style.left = String(this.#_values_.position.X)+"px";
			};
			if(y!=null){
				this.#_values_.position.Y += y;
				this.#_values_.globalPosition.Y += y;
				this.HTML.style.top = String(this.#_values_.position.Y)+"px";
			};
			this.#changeGlobalPositionChild();
		}
	}

	setSize(x=null,y=null,z=null){
		
	}

	setScale(x=null,y=null){
		let differenceScale = {x:this.#_values_.scale.X, y:this.#_values_.scale.Y};

		if(x!=null){
			differenceScale.x = x-this.#_values_.scale.X;
			this.#_values_.scale.X = x;
			this.#_values_.globalScale.X = x*this.parent.globalScale.x;
		};
		if(y!=null){
			differenceScale.y = y-this.#_values_.scale.Y;
			this.#_values_.scale.Y = y;
			this.#_values_.globalScale.Y = y*this.parent.globalScale.y;
		};

		this.#changeScalePositionChild(differenceScale);
		this.#changeScaleChild({x:this.#_values_.scale.X,y:this.#_values_.scale.Y});
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}

	setGlobalScale(x=null,y=null){
		let differenceScale = {x:this.#_values_.scale.X, y:this.#_values_.scale.Y};

		if(x!=null){
			x = x/this.parent.globalScale.x;
			differenceScale.x = x-this.#_values_.scale.X;
			this.#_values_.scale.X = x;
			this.#_values_.globalScale.X = x*this.parent.globalScale.x;
		};
		if(y!=null){
			y = y/this.parent.globalScale.y;
			differenceScale.y = y-this.#_values_.scale.Y;
			this.#_values_.scale.Y = y;
			this.#_values_.globalScale.Y = y*this.parent.globalScale.y;
		};

		this.#changeScalePositionChild(differenceScale);
		this.#changeScaleChild({x:this.#_values_.scale.X,y:this.#_values_.scale.Y});
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}

	setParent(value){
		this.#_values_.parent = value;
		this.parent.HTML.appendChild(this.HTML);
		this.parent.childs[this.id] = this;
	}

	setRotate(corner, degrees=true){
		//corner = degrees?corner*Math.PI/180:corner;
		if(degrees){
			corner = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
			this.#changeRotateChild(corner-this.#_values_.rotate);
			corner = corner*Math.PI/180; //в радианы
		} else {
			corner_deg = corner*180/Math.PI; //в градусы
			corner_deg = (corner_deg==0)?0:corner_deg%360+(corner_deg-Math.abs(corner_deg))/(2*corner_deg)*360;
			this.#changeRotateChild(corner_deg-this.#_values_.rotate);
		}
		this.HTML.style.transform = 'rotate('+corner+'rad)';

		if (this.area != null && this.areaSolid == false){
			/*for (let i=0; i<this.#_values_.area.length; i++){
				this.#_values_.area[i] = rotatePointAnAngle(corner*180/Math.PI-this.#_values_.rotate, this.#_values_.area[i], this.center);
			}*/
		} else if (this.area != null && this.areaSolid == true){

		}
		corner = corner*180/Math.PI;
		this.#_values_.rotate = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
		corner += this.parent.globalRotate;
		this.#_values_.globalRotate = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}

	setGlobalRotate(corner, degrees=true){
		//corner = degrees?corner*Math.PI/180:corner;
		if(degrees){
			corner -= this.parent.globalRotate;
			corner = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
			this.#changeRotateChild(corner-this.#_values_.rotate);
			corner = corner*Math.PI/180; //в радианы
		} else {
			corner_deg = corner*180/Math.PI; //в градусы
			corner_deg -= this.parent.globalRotate;
			corner_deg = (corner_deg==0)?0:corner_deg%360+(corner_deg-Math.abs(corner_deg))/(2*corner_deg)*360;
			this.#changeRotateChild(corner_deg-this.#_values_.rotate);
		}
		this.HTML.style.transform = 'rotate('+corner+'rad)';

		if (this.area != null && this.areaSolid == false){
			/*for (let i=0; i<this.#_values_.area.length; i++){
				this.#_values_.area[i] = rotatePointAnAngle(corner*180/Math.PI-this.#_values_.rotate, this.#_values_.area[i], this.center);
			}*/
		} else if (this.area != null && this.areaSolid == true){

		}

		corner = corner*180/Math.PI;
		this.#_values_.rotate = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
		corner += this.parent.globalRotate;
		this.#_values_.globalRotate = (corner==0)?0:corner%360+(corner-Math.abs(corner))/(2*corner)*360;
		this.#displayingInformationDeveloper(this.#_values_.modeDevelopment);
	}


	setCenter(x=null, y=null, thisGlobalValue=false){
		
		if (this.area == null && this.areaSolid == false){
			let size = {x:0,y:0};
			if(x!=null){
				size.x = this.#_values_.position.X-x;
				this.#_values_.position.X = x;
				this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
				this.HTML.style.left = String(x)+"px";
			}
			if(y!=null){
				size.y = this.#_values_.position.Y-y;
				this.#_values_.position.Y = y;
				this.#_values_.globalPosition.Y = this.parent.globalPosition.y+y;
				this.HTML.style.top = String(y)+"px";	
			}
			/*for (let key in this.sprites){
				this.sprites[key].setPosition(this.sprites[key].position.x+size.x, this.sprites[key].position.y+size.y);
			}*/
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == false){
			let size = {x:0,y:0};
			if(x!=null){
				size.x = this.#_values_.position.X-x;
				this.#_values_.position.X = x;
				this.#_values_.globalPosition.X = this.parent.globalPosition.x+x;
				this.HTML.style.left = String(x)+"px";
			}
			if(y!=null){
				size.y = this.#_values_.position.Y-y;
				this.#_values_.position.Y = y;
				this.#_values_.globalPosition.Y = this.parent.globalPosition.y+y;
				this.HTML.style.top = String(y)+"px";	
			}
			/*for (let key in this.sprites){
				this.sprites[key].setPosition(this.sprites[key].position.x+size.x, this.sprites[key].position.y+size.y);
			}*/

			this.#_values_.area.move(size.x,size.y);
			this.#changeGlobalPositionChild();
		} else if (this.area != null && this.areaSolid == true){

		}
	}



	setArea(points, breakIfPointUndefined=true){
		if (typeof points != typeof [0,1]){
			console.log(error_2[LANGUAGE]);
			return
		};
		let array = [];
		for (let i=0; i<points.length; i++){
			if ((points[i].x == undefined || points[i].y == undefined) && breakIfPointUndefined){console.log(error_3[LANGUAGE]); return} else {
				array[array.length] = points[i];
				//array[array.length] = rotatePointAnAngle(this.#_values_.rotate, {x:points.x*this.#_values_.scale.x, y:points.y*this.#_values_.scale.y}, points[i]);
			}
		}
		array.top = function(){
			let point = {x:this[0].x,y:this[0].y};
			for (let i=0; i<this.length; i++){
				point = (this[i].y<point.y)?point=this[i]:point;
			}
			return point
		}
		array.bottom = function(){
			let point = {x:this[0].x,y:this[0].y};
			for (let i=0; i<this.length; i++){
				point = (this[i].y>point.y)?point=this[i]:point;
			}
			return point
		}
		array.left = function(){
			let point = {x:this[0].x,y:this[0].y};
			for (let i=0; i<this.length; i++){
				point = (this[i].x<point.x)?point=this[i]:point;
			}
			return point
		}
		array.right = function(){
			let point = {x:this[0].x,y:this[0].y};
			for (let i=0; i<this.length; i++){
				point = (this[i].x>point.x)?point=this[i]:point;
			}
			return point
		}
		array.rectangle = function(){
			let A = this[0];
			let B = this[0];
			for (let i=0; i<this.length; i++){
				A.x = (this[i].x<A.x)?A.x=this[i].x:A.x;
				A.y = (this[i].y<A.y)?A.y=this[i].y:A.y;
				B.x = (this[i].x>B.x)?B.x=this[i].x:B.x;
				B.y = (this[i].y>B.y)?B.y=this[i].y:B.y;
			}
			return [{x:A.x,y:A.y},{x:B.x,y:B.y}]
		}
		array.center = function(){
			let A = {x:this[0].x,y:this[0].y};
			let B = {x:this[0].x,y:this[0].y};
			for (let i=0; i<this.length; i++){
				A.x = (this[i].x<A.x)?this[i].x:A.x;
				A.y = (this[i].y<A.y)?this[i].y:A.y;
				B.x = (this[i].x>B.x)?this[i].x:B.x;
				B.y = (this[i].y>B.y)?this[i].y:B.y;
			}
			return {x:(A.x+B.x)/2,y:(A.y+B.y)/2}
		}

		array.move = function(x=0,y=0){
			for (let i=0; i<this.length; i++){
				this[i].x += x;
				this[i].y += y;
			}
		}

		this.#_values_.area = array;

	}


	setGlobalArea(points, breakIfPointUndefined=true){
		if (typeof points != typeof [0,1]){
			console.log(error_2[LANGUAGE]);
			return
		};
		console.log(typeof points);
		let array = [];
		for (let i=0; i<points.length; i++){
			if ((points[i].x == undefined || points[i].y == undefined) && breakIfPointUndefined){console.log(error_3[LANGUAGE]); return} else {
				points[i].x = points[i].x - this.globalPosition.x;
				points[i].y = points[i].y - this.globalPosition.y;
				array[array.length] = points[i];
			}
		}
		array.top = function(){
			let point = this[0];
			for (let i=0; i<this.length; i++){
				point = (this[i].x<point.x)?point=this[i]:point;
			}
			return point
		}
		array.bottom = function(){
			let point = this[0];
			for (let i=0; i<this.length; i++){
				point = (this[i].x>point.x)?point=this[i]:point;
			}
			return point
		}
		array.left = function(){
			let point = this[0];
			for (let i=0; i<this.length; i++){
				point = (this[i].y<point.y)?point=this[i]:point;
			}
			return point
		}
		array.right = function(){
			let point = this[0];
			for (let i=0; i<this.length; i++){
				point = (this[i].y>point.y)?point=this[i]:point;
			}
			return point
		}
		array.rectangle = function(){
			let A = this[0];
			let B = this[0];
			for (let i=0; i<this.length; i++){
				point = (this[i].x<A.x)?A.x=this[i].x:A.x;
				point = (this[i].y<A.y)?A.y=this[i].y:A.y;
				point = (this[i].x>B.x)?B.x=this[i].x:B.x;
				point = (this[i].y>B.y)?B.y=this[i].y:B.y;
			}
			return [{x:A.x,y:A.y},{x:B.x,y:B.y}]
		}
		array.center = function(){
			let A = this[0];
			let B = this[0];
			for (let i=0; i<this.length; i++){
				A.x = (this[i].x<A.x)?A.x=this[i].x:A.x;
				A.y = (this[i].y<A.y)?A.y=this[i].y:A.y;
				B.x = (this[i].x>B.x)?B.x=this[i].x:B.x;
				B.y = (this[i].y>B.y)?B.y=this[i].y:B.y;
			}
			return {x:(A.x+B.x)/2,y:(A.y+B.y)/2}
		}

		array.move = function(x=0,y=0){
			for (let i=0; i<this.length; i++){
				this[i].x += x;
				this[i].y += y;
			}
		}

		this.#_values_.area = array;
	}

	remove(childParent=null){
		if (childParent == null){
			for (let key in this.childs){
				this.childs[key].remove();
			}
		} else {
			for (let key in this.childs){
				this.childs[key].setParent(childParent);
			};
		}

		delete OBJECTS.STATIC[this.id];
		delete this.parent.childs[this.id];
		this.parent.HTML.removeChild(this.HTML);
		
		delete this.name;
		delete this.id;
		delete this.parent;
		delete this.useSpeed;
		delete this.areaSolid;
		delete this.area;
		delete this.childs;
		delete this.position;
		this.#old_position = undefined;
		delete this.globalPosition;
		this.#old_globalPosition = undefined;
		delete this.size;
		delete this.HTML;
		delete this.speed;
		delete this.globalSpeed;
		delete this.mass;

		delete this.constructor;
		delete this.setPosition;
		delete this.setGlobalPosition;
		delete this.move;
		delete this.setCenter;
	}
}