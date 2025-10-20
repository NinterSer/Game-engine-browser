
class MathLib {
	/*
	rotatePoint(point, angle, center={x:0,y:0}, type=this.typeCorner.degree){
		// валидация входов
		const px = Number(point?.x), py = Number(point?.y);
		const cx = Number(center?.x), cy = Number(center?.y);
		const ang = Number(angle);
		if (!Number.isFinite(px) || !Number.isFinite(py)) return { x: NaN, y: NaN };
		if (!Number.isFinite(cx) || !Number.isFinite(cy)) return { x: NaN, y: NaN };
		if (!Number.isFinite(ang)) return { x: px, y: py }; // нет угла — возвращаем исходную точку
	  
		// нормализация угла
		const theta = (type === this.typeCorner.degree) ? ang * (Math.PI / 180) : ang;
	  
		// перенос к центру
		const dx = px - cx;
		const dy = py - cy;
	  
		// нулевой радиус
		const r2 = dx*dx + dy*dy;
		if (r2 === 0) return { x: cx, y: cy };
	  
		// конвенция: ось Y, по часовой
		const phi = Math.atan2(dx, dy);
		const np = phi + theta;
		const r = Math.sqrt(r2);
	  
		return { x: Math.sin(np) * r + cx, y: Math.cos(np) * r + cy };
	  }*/

	rotatePoint(
	  point,
	  angle,
	  center = { x: 0, y: 0 },
	  type = this.typeCorner.degree,
	  direction = 'cw'
	) {
	  // ---- валидируем входы -------------------------------------------------
	  const px = Number(point?.x);
	  const py = Number(point?.y);
	  const cx = Number(center?.x);
	  const cy = Number(center?.y);
	  const a  = Number(angle);

	  if (!Number.isFinite(px) || !Number.isFinite(py) ||
	      !Number.isFinite(cx) || !Number.isFinite(cy) ||
	      !Number.isFinite(a)) {
	    return { x: NaN, y: NaN };
	  }

	  // ---- угол в радианах --------------------------------------------------
	  const theta = (type === this.typeCorner.degree ? a * Math.PI / 180 : a) *
	                (direction === 'ccw' ? -1 : 1); // cw → отрицательный в системе y‑вверх

	  // ---- перенос к центру -------------------------------------------------
	  const dx = px - cx;
	  const dy = py - cy;

	  // точка совпала с центром → возвращаем центр
	  if (dx === 0 && dy === 0) return { x: cx, y: cy };

	  // ---- матрица вращения -------------------------------------------------
	  const cos = Math.cos(theta);
	  const sin = Math.sin(theta);

	  const rx = dx * cos - dy * sin;
	  const ry = dx * sin + dy * cos;

	  // ---- возвращаем в глобальные координаты ------------------------------
	  return { x: rx + cx, y: ry + cy };
	}

	/**
	 * Проверяет, пересекаются ли Прямоугольник
	 * @rectangle1: Rectangle
	 * @rectangle2: Rectangle
	 */
	Rectangle2Rectangle(rectangle1, rectangle2){
		for(let point of rectangle1.points()){
			if(rectangle2.point(point)){return true}
		}
		for(let point of rectangle2.points()){
				if(rectangle1.point(point)){return true}
			}
		return false
	}

	/**
	 * Проверяет, пересекаются ли Окружности
	 * @circle1: Circle
	 * @circle2: Circle
	 */
	Circle2Circle(circle1, circle2){
		return Math.sqrt((circle1.point.x-circle2.point.x)**2+(circle1.point.y-circle2.point.y)**2)<=circle1.radius+circle2.radius
	}

	/**
	* Проверяет, находится ли точка pt внутри многоугольника poly.
	* @poly: массив точек [{x, y}, {x, y}, ...] (не обязательно выпуклый, порядок вершин по часовой или против часовой стрелки)
	* Возвращает true если внутри или на границе, иначе false
	*/
	pointInPolygon(pt, poly) {
		if (!Array.isArray(poly) || poly.length < 3) return false;
		const EPS = 1e-12;
		const px = pt.x, py = pt.y;

		// Помощь: проверка, лежит ли точка на сегменте (a,b)
		function isPointOnSegment(p, a, b) {
		    // векторное произведение (b - a) x (p - a) должно быть близко к нулю
			const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
			if (Math.abs(cross) > EPS) return false;

		    // проектируем p на сегмент и проверяем, находится ли в пределах отрезка
			const dot = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
			if (dot < -EPS) return false;
			const len2 = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
			if (dot - len2 > EPS) return false;
		return true;
		}
		  // Сначала проверить попадание на ребро
		for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			if (isPointOnSegment(pt, poly[i], poly[j])) return true;
		}

		  // Луч вправо: подсчитать пересечения с неориентированными ребрами
		let inside = false;
		for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			const xi = poly[i].x, yi = poly[i].y;
			const xj = poly[j].x, yj = poly[j].y;

			const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);

			if (intersect) inside = !inside;
		}

		return inside;
	}

	// Функция для нахождения точки пересечения двух отрезков
	segmentIntersect(s1, s2) {
    	const p1 = s1[0], p2 = s1[1];
    	const q1 = s2[0], q2 = s2[1];

	    const o1 = this.orientation(p1, p2, q1);
	    const o2 = this.orientation(p1, p2, q2);
	    const o3 = this.orientation(q1, q2, p1);
	    const o4 = this.orientation(q1, q2, p2);

	    if (o1 !== o2 && o3 !== o4) {
	        const x1 = p1.x, y1 = p1.y;
	        const x2 = p2.x, y2 = p2.y;
	        const x3 = q1.x, y3 = q1.y;
	        const x4 = q2.x, y4 = q2.y;

	        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	        if (denom === 0) return null;

	        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
	        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

	        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
	            return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
	        }
	    }
	    return null;
	}

	// Функция определения ориентации
	orientation(p, q, r) {
	    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
	    return val === 0 ? 0 : (val > 0 ? 1 : 2);
	}

	// Функция для нахождения точек пересечения отрезка с полигоном
	segmentPolygonIntersection(segment, polygon) {
	    const intersections = [];
	    const n = polygon.length;

	    for (let i = 0; i < n; i++) {
	        const edge = [polygon[i], polygon[(i + 1) % n]];
	        const intersection = this.segmentIntersect(segment, edge);
	        if (intersection) {
	            intersections.push(intersection);
	        }
	    }

	    return intersections;
	}
	//Алгоритм нахождения точек пересечения отрезка и окружности
	findIntersections(circle, segment) {
		const xc = circle.point.x, yc = circle.point.y, radius = circle.radius;
	    const x1 = segment.start.x, y1 = segment.start.y, x2 = segment.end.x, y2 = segment.end.y;
	    
	    // Вычисляем векторы
	    const vx = x2 - x1;
	    const vy = y2 - y1;
	    const wx = x1 - xc;
	    const wy = y1 - yc;
	    
	    // Коэффициенты квадратного уравнения
	    const a = vx * vx + vy * vy;
	    const b = 2 * (wx * vx + wy * vy);
	    const c = wx * wx + wy * wy - radius * radius;
	    
	    // Дискриминант
	    const discriminant = b * b - 4 * a * c;
	    
	    if (discriminant < 0) {
	        return []; // Нет пересечений
	    }
	    
	    const sqrtD = Math.sqrt(discriminant);
	    const t1 = (-b + sqrtD) / (2 * a);
	    const t2 = (-b - sqrtD) / (2 * a);
	    
	    const result = [];
	    
	    // Проверяем первую точку
	    if (t1 >= 0 && t1 <= 1) {
	        const x = x1 + t1 * vx;
	        const y = y1 + t1 * vy;
	        result.push({ x, y });
	    }
	    
	    // Проверяем вторую точку
	    if (t2 >= 0 && t2 <= 1) {
	        const x = x1 + t2 * vx;
	        const y = y1 + t2 * vy;
	        result.push({ x, y });
	    }
	    
	    return result;
	}

	calculateAngle(center, point1, point2, typeCorner=0) {
	    // Вычисляем векторы
	    const vector1 = {
	        x: point1.x - center.x,
	        y: point1.y - center.y
	    };
	    
	    const vector2 = {
	        x: point2.x - center.x,
	        y: point2.y - center.y
	    };
	    
	    // Скалярное произведение векторов
	    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
	    
	    // Длины векторов
	    const length1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
	    const length2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
	    
	    // Вычисляем косинус угла
	    const cosAlpha = dotProduct / (length1 * length2);
	    
	    // Корректируем значение для арккосинуса
	    const clampedCos = Math.max(-1, Math.min(1, cosAlpha));
	    
	    // Возвращаем угол в радианах
	    switch(typeCorner){
	    case 0:
	    	return Math.acos(clampedCos)*(180 / Math.PI);
	    	break
	    case 1:
	    	return Math.acos(clampedCos);
	    	break
	    }
	   
	}
	
	typeCorner = {
		degree: 0,
		radian: 1,
		fullDegree: 360,
		fullRadian: 360/(180/Math.PI),
		normalization(corner, type=1){
			switch(type){
			case this.degree:
				return (corner%this.fullDegree+this.fullDegree)%this.fullDegree
				break
			case this.radian:
				return (corner%this.fullRadian+this.fullRadian)%this.fullRadian
				break
			}
		}
	}

	typeArea = {
		polygon: 0,
		rectangle: 1,
		circle: 2,
		line: 3,
	}

}

class Matrix {
	/**
	 * @param {number} rows
	 * @param {number} rows
	 * @param {Array} rows
	 * */
	constructor(rows, cols, array){
		if (rows <= 0 || cols <= 0) {throw new Error('Размеры матрицы должны быть > 0');}
	    this.rows = rows;
	    this.cols = cols;
	    this._data = new Array(rows);
	    for (let r=0; r<rows; r++){
	    	this._data[r] = new Array(cols);
	    	for (let c=0; c<cols; c++){
	    		this._data[r][c] = array[r*cols+c];
	    	}
	    }
	}

	get(row, col=undefined){
		if(col==undefined){return this._data[row]}
		return this._data[row][col]
	}
	set(row, col, value){
		this._data[row][col] = value;
	}

	*[Symbol.iterator]() {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++){
				yield this._data[r][c];       
			}	    	
		}
	}

	*rowIter(){
		for (let r=0; r<this.rows; r++){
			yield this._data[r]
		}
	}

	*colIter(){
		for (let c=0; c<this.cols; c++){
			let array = new Array(this.rows);
			for (let r=0; r<this.rows; r++){
				array[r] = this._data[r][c]
			}
			yield array
		}
	}
}

class Line {

	get length(){return this.getLength()}

	constructor(start, end){
		start = typeof start == 'object'?start:{x:0,y:0};
		start.x = start.x==undefined?0:start.x;
		start.y = start.y==undefined?0:start.y;

		end = typeof end == 'object'?end:{x:0,y:0};
		end.x = end.x==undefined?0:end.x;
		end.y = end.y==undefined?0:end.y;

		this.start = start;
		this.end = end;
		this.k = (start.y-end.y)/(start.x-end.x);
		this.b = start.y-start.x*this.k;
		this.type = mathLib.typeArea.line;
	}

	point(point, limitSegment=false){
		switch(limitSegment){
		case false:
			if(this.start.x==this.end.x){
				if(this.start.x==point.x)return true
			} else {
				if(point.y == this.k*point.x+this.b)return true
			}
			break
		case true:
			if(this.start.x==this.end.x){
				if(this.start.x==point.x && ((this.start.y-point.y)*(this.end.y-point.y)<=0))return true
			} else {
				if(point.y == this.k*point.x+this.b && (this.start.x-point.x)*(this.end.x-point.x)<=0 && ((this.start.y-point.y)*(this.end.y-point.y)<=0))return true
			}
			break
		}
		return false
	}

	line(line, limitSegment=false){
		let denom, x, y = 0
		switch(limitSegment){
		case false:
			denom = (this.start.x-this.end.x)*(line.start.y-line.end.y) - (this.start.y-this.end.y)*(line.start.x-line.end.x);
		    if (denom === 0) return null; // Прямые параллельны
		    x = ((this.start.x*this.end.y-this.start.y*this.end.x)*(line.start.x-line.end.x) - (this.start.x-this.end.x)*(line.start.x*line.end.y-line.start.y*line.end.x)) / denom;
		    y = ((this.start.x*this.end.y-this.start.y*this.end.x)*(line.start.y-line.end.y) - (this.start.y-this.end.y)*(line.start.x*line.end.y-line.start.y*line.end.x)) / denom;
		    return {x, y};
			break
		case true:
			denom = (this.start.x-this.end.x)*(line.start.y-line.end.y) - (this.start.y-this.end.y)*(line.start.x-line.end.x);
		    if (denom === 0) return null; // Прямые параллельны
		    x = ((this.start.x*this.end.y-this.start.y*this.end.x)*(line.start.x-line.end.x) - (this.start.x-this.end.x)*(line.start.x*line.end.y-line.start.y*line.end.x)) / denom;
		    y = ((this.start.x*this.end.y-this.start.y*this.end.x)*(line.start.y-line.end.y) - (this.start.y-this.end.y)*(line.start.x*line.end.y-line.start.y*line.end.x)) / denom;

		    if(this.point({x,y},true))return {x,y}
		    return null
			break
		}
	}

	getLength(){return Math.sqrt((this.start.x-this.end.x)**2+(this.start.y-this.end.y)**2)}
}

class Rectangle {

	get square(){return this.getSquare()}
	get perimeter(){return this.getPerimeter()}

	constructor(start, end){
		start = typeof start == 'object'?start:{x:0,y:0};
		start.x = start.x==undefined?0:start.x;
		start.y = start.y==undefined?0:start.y;

		end = typeof end == 'object'?end:{x:0,y:0};
		end.x = end.x==undefined?0:end.x;
		end.y = end.y==undefined?0:end.y;

		this.start = start;
		this.end = end;
		this.type = mathLib.typeArea.rectangle;
		this.pointsArray = [{x:start.x, y:start.y},{x:end.x, y:start.y},{x:end.x, y:end.y},{x:start.x, y:end.y}]
	}

	*points(){
		for(let point of this.pointsArray){
			yield point
		}
	}

	getSquare(){
		return (Math.abs(this.start.x)+Math.abs(this.end.x))*(Math.abs(this.start.y)+Math.abs(this.end.y))
	}

	getPerimeter(){
		return 2*Math.abs(this.start.x)+Math.abs(this.end.x)+2*Math.abs(this.start.y)+Math.abs(this.end.y)
	}

	point(point){
		if((this.start.x-point.x)*(this.end.x-point.x)>0)return false
		if((this.start.y-point.y)*(this.end.y-point.y)>0)return false
		return true
	}
}

class Circle {
	get square(){return this.getSquare()};
	get perimetr(){return this.getPerimeter()};
	get length(){return this.getLength()};
	get diameter(){return this.getDiameter()};

	constructor(radius, point=undefined){
		point = typeof point == 'object'?point:{x:0,y:0};
		point.x = point.x==undefined?0:point.x;
		point.y = point.y==undefined?0:point.y;

		this.point = point;
		this.radius = radius;
	}

	getSquare(){
		return Math.PI*this.radius**2
	}

	getPerimeter(){
		return 2*Math.PI*this.radius
	}

	getLength(){
		return 2*Math.PI*this.radius
	}

	getDiameter(){
		return 2*this.radius
	}
}

window.mathLib = new MathLib();

//export default {mathLib, Circle, Rectangle, Line, Matrix, MathLib}