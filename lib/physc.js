class Impulse {

	constructor(Fthrust=0, Fresistance=1, mass=1){
		this.mass = mass;
		this.Fthrust = Fthrust;
		this.Fresistance = Fresistance;
		this.again = true;
	}

	do(F){
		F = this.again?F:this.Fthrust;
		//this.again = this.again?false:false;
		this.again = false;
		this.Fthrust = F-this.Fresistance;
		this.Fthrust = this.Fthrust<0?0:this.Fthrust;
		return this.Fthrust
	}
}