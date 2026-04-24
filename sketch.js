let nodes = [];
let vinePoints = [];
let displayFrame;
let closeWheel;
let sk8X; // 滑板 X 座標
let sk8Speed = 2; // 滑板移動速度
let gameState = 'START'; // 狀態追蹤：'START' 或 'MAIN'
let enterBtn, aboutBtn, backBtn; // 按鈕變數

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

  // 建立開始介面按鈕
  enterBtn = createButton('ENTER / 進入');
  aboutBtn = createButton('ABOUT / 作品介紹');
  styleStartButton(enterBtn, height * 0.45);
  styleStartButton(aboutBtn, height * 0.55);
  
  // 建立左上角返回按鈕
  backBtn = createButton('← BACK');
  styleBackButton(backBtn);
  backBtn.hide(); // 初始隱藏
  
  enterBtn.mousePressed(() => {
    gameState = 'MAIN';
    enterBtn.hide();
    aboutBtn.hide();
    backBtn.show();
  });

  backBtn.mousePressed(() => {
    gameState = 'START';
    backBtn.hide();
    enterBtn.show();
    aboutBtn.show();
    hideIframe(); // 返回主頁時確保關閉所有開啟的作品視窗
  });
  
  aboutBtn.mousePressed(() => {
    // 假設作品介紹在 about.html，或者您可以改為一個特定的 URL
    displayFrame.attribute('src', 'about.html'); 
    displayFrame.show();
    closeWheel.show();
    enterBtn.hide(); // 顯示介紹時先隱藏主按鈕
    aboutBtn.hide();
  });

  // 建立 iframe 顯示區域
  displayFrame = createElement('iframe');
  let frameW = width * 0.8;
  let frameH = height * 0.8;
  displayFrame.size(frameW, frameH);
  displayFrame.position((width - frameW) / 2, (height - frameH) / 2);
  displayFrame.style('border', 'none');
  displayFrame.style('border-radius', '10px');
  displayFrame.style('box-shadow', '0 0 15px rgba(0,0,0,0.1)');
  displayFrame.hide(); // 預設隱藏
  displayFrame.style('z-index', '100'); // 確保在最上層
  displayFrame.style('background', 'white'); // 確保背景不透明

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
  closeWheel.style('z-index', '101'); // 確保比 iframe 更高

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
  if (gameState === 'START') {
    drawStartScreen();
  } else {
    drawMainContent();
  }
}

function drawStartScreen() {
  drawRoad();
  
  // 標題裝飾
  textAlign(CENTER, CENTER);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  fill(255);
  textSize(60);
  textStyle(BOLD);
  text("SKATEBOARD ARCHIVE", width / 2, height * 0.3);
  
  drawingContext.shadowBlur = 0;
  textSize(18);
  fill(150);
  text("Digital Portfolio Collection", width / 2, height * 0.37);
}

function drawMainContent() {
  drawRoad();
  drawCabinet();
  drawGroundSkateboard();

  // 更新滑板位置
  sk8X += sk8Speed;
  if (sk8X > width - 150 || sk8X < 150) {
    sk8Speed *= -1;
  }

  // 更新並顯示所有節點
  for (let node of nodes) {
    node.update();
    node.display();
  }
}

function drawRoad() {
  background(35, 38, 45);
  // 加入柏油路雜點質感
  noStroke();
  fill(255, 10);
  for (let i = 0; i < 500; i++) {
    let rx = (noise(i, frameCount * 0.01) * width);
    let ry = (noise(i + 10, frameCount * 0.01) * height);
    ellipse(rx, ry, 1, 1);
  }
  // 繪製路面邊緣線 (Curb)
  stroke(60);
  strokeWeight(2);
  line(0, height - 80, width, height - 80);
}

function updateCloseWheelPosition() {
  // 計算視窗在中央時的右上角座標
  let frameW = width * 0.8;
  let frameH = height * 0.8;
  let frameX = (width - frameW) / 2;
  let frameY = (height - frameH) / 2;
  closeWheel.position(frameX + frameW - 20, frameY - 20);
}

function hideIframe() {
  displayFrame.attribute('src', ''); // 清空來源以強制停止音樂與程式執行
  displayFrame.hide();
  closeWheel.hide();
  
  // 如果還在開始畫面，關閉視窗後要重新顯示按鈕
  if (gameState === 'START') {
    enterBtn.show();
    aboutBtn.show();
  }
}

function styleStartButton(btn, yPos) {
  btn.position(width / 2 - 100, yPos);
  btn.size(200, 50);
  btn.style('background', 'linear-gradient(145deg, #333, #111)');
  btn.style('color', '#fff');
  btn.style('border', '2px solid #555');
  btn.style('border-radius', '8px');
  btn.style('font-size', '16px');
  btn.style('font-weight', 'bold');
  btn.style('cursor', 'pointer');
  btn.style('letter-spacing', '1px');
}

function styleBackButton(btn) {
  btn.position(20, 20);
  btn.size(100, 35);
  btn.style('background', 'rgba(0, 0, 0, 0.6)');
  btn.style('color', '#fff');
  btn.style('border', '1px solid #777');
  btn.style('border-radius', '5px');
  btn.style('font-size', '12px');
  btn.style('font-weight', 'bold');
  btn.style('cursor', 'pointer');
  btn.style('z-index', '10'); // 確保在背景之上
  btn.style('transition', '0.3s');
  btn.mouseOver(() => btn.style('background', 'rgba(80, 80, 80, 0.9)'));
  btn.mouseOut(() => btn.style('background', 'rgba(0, 0, 0, 0.6)'));
}

function drawCabinet() {
  let cabX = width * 0.2 - 160; // 再次加寬並調整位置
  let cabW = 320; // 寬度增加到 320，讓旁邊有空間擺輪架
  let topY = 50;
  let botY = height - 50;

  // 啟用陰影
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0,0,0,0.5)';

  // 繪製櫃子主體 (深木色)
  fill(80, 50, 30);
  stroke(40, 20, 10);
  strokeWeight(4);
  rect(cabX, topY, cabW, botY - topY, 5);

  // 繪製木紋細節
  stroke(95, 65, 45, 80);
  strokeWeight(1);
  for(let i = 5; i < cabW; i += 15) {
    line(cabX + i, topY + 5, cabX + i + random(-5,5), botY - 5);
  }

  // 繪製櫃子內層陰影
  drawingContext.shadowBlur = 0;
  fill(40, 25, 15);
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
    stroke(20, 10, 5, 100);
    line(cabX + 10, shelfLineY + 4, cabX + cabW - 10, shelfLineY + 4); // 增加厚度陰影
    
    // 在架子左右兩側擺放輪架 (不再跟隨輪子)
    drawTruck(width * 0.2 - 110, shelfBaseY);
    drawTruck(width * 0.2 + 110, shelfBaseY);
  }
}

function drawTruck(x, y) {
  push();
  translate(x, y);
  // 輪架主軸 (Axle)
  for(let i = 0; i < 8; i++) {
    stroke(120 + i * 10);
    strokeWeight(1);
    line(-35, -4 + i, 35, -4 + i);
  }
  
  // 輪架底座 (Baseplate)
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'black';
  fill(100);
  stroke(50);
  strokeWeight(1);
  rect(-15, -2, 30, 12, 2);
  
  // 中心避震墊 (Bushings)
  fill(220, 20, 20);
  ellipse(0, 5, 10, 8);
  pop();
}

function drawGroundSkateboard() {
  // 將滑板放在畫布下方中央偏右的位置
  let sk8Y = height - 40;
  
  push();
  translate(sk8X, sk8Y);

  // 滑板地面陰影
  noStroke();
  fill(0, 80);
  ellipse(0, 15, 180, 20);

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
    if (gameState !== 'MAIN') return; // 只在主畫面顯示節點
    
    push();
    translate(this.currentX, this.y);

    // 輪子投影
    drawingContext.shadowBlur = this.isHovered ? 15 : 5;
    drawingContext.shadowColor = 'rgba(0,0,0,0.6)';

    if (this.isHovered) {
      // 繪製摩擦火花或噴漆感 (Sparks/Spray)
      for (let i = 0; i < 12; i++) {
        stroke(255, 200, 0, random(100, 255));
        strokeWeight(random(1, 3));
        line(0, 0, random(-this.size, this.size), random(-this.size, this.size));
      }
    }

    // 繪製滑板輪 (Skate Wheel)
    noStroke();
    
    // 輪子側邊立體感 (利用兩個圓呈現厚度)
    fill(red(this.nodeColor)*0.6, green(this.nodeColor)*0.6, blue(this.nodeColor)*0.6);
    ellipse(3, 3, this.size); 
    
    fill(this.nodeColor);
    ellipse(0, 0, this.size);

    // 輪子表面的光澤弧度
    noFill();
    stroke(255, 100);
    strokeWeight(this.size * 0.1);
    arc(0, 0, this.size * 0.8, this.size * 0.8, PI + QUARTER_PI, TWO_PI - QUARTER_PI);
    
    // 輪胎中心 (Bearing/培林)
    fill(50);
    ellipse(0, 0, this.size * 0.4);
    fill(150);
    ellipse(0, 0, this.size * 0.15);
    
    pop();
    
    // 重置陰影避免影響文字
    drawingContext.shadowBlur = 0;

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
    if (gameState !== 'MAIN') return;
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
  let frameW = width * 0.8;
  let frameH = height * 0.8;
  displayFrame.size(frameW, frameH);
  displayFrame.position((width - frameW) / 2, (height - frameH) / 2);
  updateCloseWheelPosition();
  if (enterBtn && aboutBtn) {
    enterBtn.position(width / 2 - 100, height * 0.45);
    aboutBtn.position(width / 2 - 100, height * 0.55);
  }
  if (backBtn) backBtn.position(20, 20);
}
