function setup() {
  createCanvas(400, 400);
  rectMode(CENTER); // 將方塊的繪製模式設定為中心點，方便定位
}

function draw() {
  background(255); // 將背景設定為白色

  // 臉
  noStroke();
  fill(255, 255, 153); // 淡黃色
  ellipse(200, 200, 300, 300); // 直接使用座標 (200, 200) 將圓心置中

  // 臉的邊框 (像素風格)
  fill(0); // 黑色
  for (let i = 0; i < 100; i++) {
    let angle = map(i, 0, 100, 0, TWO_PI);
    let x = 200 + cos(angle) * 150;
    let y = 200 + sin(angle) * 150;
    rect(x, y, 10, 10);
  }

  // 眼睛 (像素點，尺寸變小)
  rect(160, 170, 20, 20); // 左眼
  rect(240, 170, 20, 20); // 右眼

  // 嘴巴 (像素點)
  rect(160, 230, 20, 20); // 左嘴角
  rect(180, 240, 20, 20);
  rect(200, 240, 20, 20);
  rect(220, 240, 20, 20);
  rect(240, 230, 20, 20); // 右嘴角
}
