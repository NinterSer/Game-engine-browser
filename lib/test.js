function comparisonSpeedFunction(func1, func2){
	let result1 = 0;
	let result2 = 0;
	let time = performance.now();
	func1();
	result1 = performance.now()-time;
	let time1 = performance.now();
	func2();
	result2 = performance.now()-time1;

	console.log(result1, result2);
	return `${result1>result2?'Вторая':'Первая'} функция быстрее на ${Math.abs(result1-result2)}`;
}

function measureTime(func, ...arg) {
    var start = performance.now();
    
    func(...arg);
    
    var end = performance.now();
    var time = end - start;
    console.log('Время выполнения: ' + time + ' мс');
}