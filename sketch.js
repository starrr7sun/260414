let nodes = [];
let vinePoints = [];
let displayFrame;
let closeWheel;
let sk8X; // 滑板 X 座標
let sk8Speed = 2; // 滑板移動速度

const weekData = [
  { week: "W1", title: "week1", url: "week1/index.html" },
  { week: "W2", title: "week2", url: "week2/index.html" },
  { week: "W3", title: "week3", url: "week3/index.html" },
  { week: "W4", title: "week4", url: "week4/index.html" },
  { week: "W5", title: "week5", url: "week5/index.html" },
  { week: "W6", title: "week6", url: "week6/index.html" },
  { week: "W7", title: "week7", url: "week7/index.html" },
  { week: "W8", title: "week8", url: "week8/index.html" }
];

function setup() {
  // 建立畫布，寬度預留一部分給左側時間軸
  let canvas = createCanvas(windowWidth, windowHeight);
  
  sk8X = width * 0.5; // 初始化滑板位置

  // 建立 iframe 顯示區域
  displayFrame = createElement('iframe');
  displayFrame.position(width * 0.4, 20);
  displayFrame.size(width * 0.55, height - 40);
  displayFrame.style('border', 'none');
  displayFrame.style('border-radius', '10px');
  displayFrame.style('box-shadow', '0 0 15px rgba(0,0,0,0.1)');
  displayFrame.hide(); // 預設隱藏

  // 建立關閉用的滑板輪按鈕
  closeWheel = createButton('');
  updateCloseWheelPosition();
  // 樣式設定：模擬一顆紅色的滑板輪
  closeWheel.style('width', '40px');
  closeWheel.style('height', '40px');
  closeWheel.style('border-radius', '50%');
  closeWheel.style('background', 'radial-gradient(circle, #555 20%, #ff4d4d 25%, #ff4d4d 100%)');
  closeWheel.style('border', '3px solid #333');
  closeWheel.style('cursor', 'pointer');
  closeWheel.style('box-shadow', '2px 2px 5px rgba(0,0,0,0.3)');
  closeWheel.mousePressed(hideIframe);
  closeWheel.hide(); // 預設隱藏

  // 初始化週次節點 (排列邏輯：最上方 1 個，其餘 2 個一組)
  let maxShelf = 3; // 固定為 4 層架子 (索引 0, 1, 2, 3)
  for (let i = 0; i < weekData.length; i++) {
    // 計算層架索引：i=0,1 為底層(3)；i=6,7 為頂層(0)
    let shelfIndex = maxShelf - Math.floor(i / 2);
    // 水平偏移：偶數索引在左，奇數索引在右
    let xOffset = (i % 2 === 0) ? -40 : 40;

    let y = map(shelfIndex, 0, maxShelf, 100, height - 100);
    nodes.push(new SeedNode(y, weekData[i], xOffset));
  }
}

function draw() {
  background(40, 44, 52); // 深色柏油路質感

  drawCabinet();
  drawGroundSkateboard();

  // 更新滑板位置 (左右來回移動)
  sk8X += sk8Speed;
  if (sk8X > width - 100 || sk8X < 100) {
    sk8Speed *= -1; // 撞到邊界就反彈
  }

  // 更新並顯示所有節點
  for (let node of nodes) {
    node.update();
    node.display();
  }
}

function updateCloseWheelPosition() {
  // 擺放在 iframe 的右上角位置
  closeWheel.position(width * 0.95 - 20, 10);
}

function hideIframe() {
  displayFrame.hide();
  closeWheel.hide();
}

function drawCabinet() {
  let cabX = width * 0.2 - 160; // 再次加寬並調整位置
  let cabW = 320; // 寬度增加到 320，讓旁邊有空間擺輪架
  let topY = 50;
  let botY = height - 50;

  // 繪製櫃子主體 (木質感)
  fill(80, 50, 30);
  stroke(40, 20, 10);
  strokeWeight(4);
  rect(cabX, topY, cabW, botY - topY, 5);

  // 繪製櫃子內層陰影
  fill(40, 25, 15);
  noStroke();
  rect(cabX + 10, topY + 10, cabW - 20, botY - topY - 20);

  // 繪製層架
  stroke(60, 35, 20);
  strokeWeight(3);

  // 根據節點數量動態繪製架子
  let maxShelf = 3; 
  for (let i = 0; i <= maxShelf; i++) {
    let shelfBaseY = map(i, 0, maxShelf, 100, height - 100);
    let shelfLineY = shelfBaseY + 30;
    
    // 繪製層架線條
    line(cabX + 10, shelfLineY, cabX + cabW - 10, shelfLineY);
    
    // 在架子左右兩側擺放輪架 (不再跟隨輪子)
    drawTruck(width * 0.2 - 110, shelfBaseY);
    drawTruck(width * 0.2 + 110, shelfBaseY);
  }
}

function drawTruck(x, y) {
  push();
  translate(x, y);
  // 輪架主軸 (Axle)
  stroke(160);
  strokeWeight(8);
  line(-35, 0, 35, 0);
  // 輪架底座 (Baseplate)
  fill(120);
  noStroke();
  rect(-12, -5, 24, 15, 2);
  // 中心避震墊 (Bushings)
  fill(200, 50, 50);
  ellipse(0, 5, 10, 8);
  pop();
}

function drawGroundSkateboard() {
  // 將滑板放在畫布下方中央偏右的位置
  let sk8Y = height - 40;
  
  push();
  translate(sk8X, sk8Y);

  // 1. 繪製輪子 (四顆輪子，側面看只會看到兩對的前方)
  fill(220);
  noStroke();
  ellipse(-60, 10, 22, 22); // 後輪
  ellipse(60, 10, 22, 22);  // 前輪
  fill(80);
  ellipse(-60, 10, 8, 8);   // 培林
  ellipse(60, 10, 8, 8);

  // 2. 繪製輪架 (Trucks) - 側視圖
  fill(160);
  rect(-65, 0, 10, 10);
  rect(55, 0, 10, 10);
  
  // 3. 繪製板身側影 (Deck Side View)
  // 楓木層感
  strokeWeight(1);
  for (let i = 0; i < 6; i++) {
    stroke(120 - i * 10, 90 - i * 10, 60 - i * 10);
    line(-80, -5 + i, 80, -5 + i);
  }

  // 板頭與板尾的翹起 (Nose & Tail)
  noFill();
  stroke(80, 60, 40);
  strokeWeight(5);
  // 使用弧線繪製翹起的曲線
  arc(-90, -12, 30, 25, 0.4, PI - 0.8); // Tail
  arc(90, -12, 30, 25, 0.8, PI - 0.4);  // Nose

  // 砂紙面 (Griptape)
  stroke(20);
  strokeWeight(2);
  line(-80, -6, 80, -6);

  pop();
}

class SeedNode {
  constructor(y, data, offsetX = 0) {
    this.y = y;
    this.data = data;
    this.baseX = width * 0.2 + offsetX;
    this.currentX = this.baseX;
    this.size = 40; // 基礎尺寸變大
    this.isHovered = false;
    this.targetSize = 40;
    this.nodeColor = color(random(100, 255), random(100, 255), random(100, 255)); // 每顆隨機顏色
  }

  update() {
    // 移除擺動邏輯，固定在櫃子中心
    this.currentX = this.baseX;

    // 偵測滑鼠懸停 (簡單的距離檢測)
    let d = dist(mouseX, mouseY, this.currentX, this.y);
    if (d < this.size / 2 + 5) { // 稍微優化判斷範圍
      this.isHovered = true;
      this.targetSize = 70; // 懸停時變更大
    } else {
      this.isHovered = false;
      this.targetSize = 40;
    }
    this.size = lerp(this.size, this.targetSize, 0.1);
  }

  display() {
    push();
    translate(this.currentX, this.y);

    if (this.isHovered) {
      // 繪製摩擦火花或噴漆感 (Sparks/Spray)
      for (let i = 0; i < 8; i++) {
        stroke(255, 200, 0, random(100, 255));
        strokeWeight(2);
        line(0, 0, random(-this.size, this.size), random(-this.size, this.size));
      }
    }

    // 繪製滑板輪 (Skate Wheel)
    noStroke();
    // 輪子本體
    fill(this.nodeColor); 
    ellipse(0, 0, this.size);
    
    // 輪胎中心 (Bearing/培林)
    fill(50);
    ellipse(0, 0, this.size * 0.4);
    fill(150);
    ellipse(0, 0, this.size * 0.15);
    
    pop();

    if (this.isHovered) {
      fill(255);
      textSize(16);
      textStyle(BOLD);
      noStroke();
      textAlign(CENTER, BOTTOM);
      text(`[${this.data.week}] ${this.data.title.toUpperCase()}`, this.currentX, this.y - 45); // 配合尺寸上移文字
    }
  }

  clicked() {
    let d = dist(mouseX, mouseY, this.currentX, this.y);
    if (d < this.size) {
      displayFrame.attribute('src', this.data.url);
      displayFrame.show();
      closeWheel.show();
    }
  }
}

function mousePressed() {
  for (let node of nodes) {
    node.clicked();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  displayFrame.position(width * 0.4, 20);
  displayFrame.size(width * 0.55, height - 40);
  updateCloseWheelPosition();
}
