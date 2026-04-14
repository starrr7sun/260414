function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}

function draw() {
	colorMode(HSB) //色相:0-360，飽和度0-100，亮度 0-100
	for(var i =0;i<width;i+=mouseX/5+5){
		var h = map(i,0,width,0,360)		
		for(var j=0;j<height;j+=mouseY/5+5){
			//加入frameCount*5讓顏色隨著frameCount增加而動作，/2主要是怕顏色太花
			var clr=color((random(-50,50)+h+j+frameCount*5)/2%360,mouseY/5,mouseX/5)//
			clr.setAlpha(0.5)//設定透明度0~1間的值
			fill(clr) 
		  ellipse(i,j,30)
		}
	}
}
