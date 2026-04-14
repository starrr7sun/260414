let points = 12;      // 增加到 12 個點，大幅增加路徑複雜度
let topY = [];        // 上邊界的 Y 座標
let bottomY = [];     // 下邊界的 Y 座標
let gameState = "START"; // 遊戲狀態: START, PLAYING, WIN, FAIL
let hasEnteredStart = false; // 是否已經移到左側起點
let gameStartTime = 0; 
let finalScoreTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initPath();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPath(); // 視窗縮放時重新產生路徑以符合寬度
}

function initPath() {
  topY = [];
  bottomY = [];
  hasEnteredStart = false;
  
  // 起始高度
  let currentY = random(height * 0.2, height * 0.5);

  for (let i = 0; i < points; i++) {
    // 強迫前兩個點(0, 1)與最後兩個點垂直高度一致，創造水平安全緩衝區
    if (i === 1) {
      topY.push(topY[0]);
      bottomY.push(bottomY[0]);
    } else if (i > 0 && i === points - 1) {
      topY.push(topY[i - 1]);
      bottomY.push(bottomY[i - 1]);
    } else {
      topY.push(currentY);
      // 起點固定寬度 60 確保按鈕在線內，其餘點維持 25-45 增加難度
      let gap = (i === 0) ? 60 : random(25, 45);
      bottomY.push(currentY + gap);
    }
    
    // 僅針對中間的點產生隨機位移，避免起點直接大幅度跳動
    if (i > 0 && i < points - 2) {
      currentY += random(-120, 120);
      currentY = constrain(currentY, 100, height - 150);
    }
  }
}

function draw() {
  drawBackground();

  if (gameState === "START") {
    drawButton();
    fill(255);
    textAlign(CENTER);
    textSize(14);
    noStroke();
    text("請點擊左側綠色區域內的 START 按鈕開始", width / 2, height / 2 - 60);
  } else if (gameState === "PLAYING") {
    drawGamePath();
    handleGameLogic();
    drawCursor();
    drawTimer();
  } else if (gameState === "WIN") {
    showOverlay("MISSION COMPLETE", color(0, 255, 200), finalScoreTime);
  } else if (gameState === "FAIL") {
    showOverlay("CONNECTION LOST", color(255, 50, 50));
  }
}

function drawBackground() {
  background(15, 15, 35); // 深藍黑色背景
  
  // 繪製裝飾網格
  stroke(30, 30, 70);
  strokeWeight(1);
  for (let i = 0; i < width; i += 40) line(i, 0, i, height);
  for (let i = 0; i < height; i += 40) line(0, i, width, i);
}

function drawTimer() {
  let currentTime = hasEnteredStart ? (millis() - gameStartTime) / 1000 : 0;
  fill(255);
  noStroke();
  textAlign(RIGHT, TOP);
  textSize(20);
  textStyle(BOLD);
  text("TIME: " + currentTime.toFixed(2) + "s", width - 20, 20);
  textStyle(NORMAL);
}

function drawCursor() {
  // 繪製玩家位置提示
  noFill();
  stroke(255, 200);
  strokeWeight(1);
  ellipse(mouseX, mouseY, 10, 10);
}

function drawGamePath() {
  // 1. 先繪製路徑內部的填充色 (安全區)
  noStroke();
  fill(0, 150, 255, 30);
  beginShape();
  // 使用 curveVertex 建立平滑區域
  curveVertex(0, topY[0]); // 控制點
  for (let i = 0; i < points; i++) {
    let x = map(i, 0, points - 1, 0, width);
    curveVertex(x, topY[i]);
  }
  curveVertex(width, topY[points - 1]); // 控制點
  
  curveVertex(width, bottomY[points - 1]); // 控制點
  // 倒過來串接下方點以形成封閉區域
  for (let i = points - 1; i >= 0; i--) {
    let x = map(i, 0, points - 1, 0, width);
    curveVertex(x, bottomY[i]);
  }
  curveVertex(0, bottomY[0]); // 控制點
  endShape(CLOSE);

  // 2. 繪製帶有發光效果的線條
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 191, 255);
  stroke(0, 191, 255);
  strokeWeight(4);
  noFill();

  // 使用 curveVertex 繪製平滑上方線條
  beginShape();
  curveVertex(0, topY[0]); 
  for (let i = 0; i < points; i++) {
    let x = map(i, 0, points - 1, 0, width);
    curveVertex(x, topY[i]);
  }
  curveVertex(width, topY[points - 1]);
  endShape();

  // 使用 curveVertex 繪製平滑下方線條
  beginShape();
  curveVertex(0, bottomY[0]);
  for (let i = 0; i < points; i++) {
    let x = map(i, 0, points - 1, 0, width);
    curveVertex(x, bottomY[i]);
  }
  curveVertex(width, bottomY[points - 1]);
  endShape();
  pop();

  // 繪製起始點與結束點標示
  drawingContext.shadowBlur = 0;
  let segWidth = width / (points - 1);
  noStroke();
  fill(0, 255, 100, 60);
  // 起點指示區塊改為與第一個水平段等寬
  rect(0, topY[0], segWidth, bottomY[0] - topY[0]); 
  fill(255, 50, 50, 60);
  rect(width - segWidth, topY[points - 1], segWidth, bottomY[points - 1] - topY[points - 1]);
}

function handleGameLogic() {
  let segWidth = width / (points - 1);
  if (!hasEnteredStart) {
    if (mouseX >= 0 && mouseX < segWidth && mouseY > topY[0] && mouseY < bottomY[0]) hasEnteredStart = true;
    return; 
  }

  let currentTop, currentBottom;

  // 建立出入口安全緩衝區 (矩形判定，不再受曲線斜率影響)
  if (mouseX < segWidth) {
    currentTop = topY[0];
    currentBottom = bottomY[0];
  } else if (mouseX > width - segWidth) {
    currentTop = topY[points - 1];
    currentBottom = bottomY[points - 1];
  } else {
    // 中間路徑採用樣條曲線插值 (Spline Interpolation)
    let idx = constrain(floor(mouseX / segWidth), 0, points - 2);
    let t = (mouseX - idx * segWidth) / segWidth;
    
    // 使用 p5 內建的 curvePoint 計算曲線上的精確 Y 座標
    // 參數分別為：(前控制點, 起點, 終點, 後控制點, 插值比例)
    currentTop = calculateCurveY(topY, idx, t);
    currentBottom = calculateCurveY(bottomY, idx, t);
  }

  // 減小寬限值 (從 6 降到 3)，讓邊界判定更嚴格
  let margin = 3; 

  // 碰撞偵測：不能碰到上下線條或是移到線外
  if (mouseY < currentTop + margin || mouseY > currentBottom - margin) {
    gameState = "FAIL";
  }

  // 成功判定：必須精確進入右側紅色出入口
  if (mouseX >= width - segWidth && mouseY > topY[points - 1] && mouseY < bottomY[points - 1]) {
    finalScoreTime = (millis() - gameStartTime) / 1000;
    gameState = "WIN";
  }
}

// 輔助函式：處理 curvePoint 的邊界索引
function calculateCurveY(arr, idx, t) {
  let p0 = arr[max(0, idx - 1)];
  let p1 = arr[idx];
  let p2 = arr[idx + 1];
  let p3 = arr[min(points - 1, idx + 2)];
  return curvePoint(p0, p1, p2, p3, t);
}

function drawButton() {
  // 固定按鈕尺寸
  let btnH = 34; 
  let btnW = 80; 
  let centerY = (topY[0] + bottomY[0]) / 2;
  let startX = 10; 

  // 按鈕外框發光
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(0, 255, 150);
  fill(0, 40, 30);
  stroke(0, 255, 150);
  strokeWeight(2);
  rect(startX, centerY - btnH / 2, btnW, btnH, 5);
  
  fill(0, 255, 150);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16); // 調整字體大小以適應更大的按鈕
  text("START", startX + btnW / 2, centerY);
}

function showOverlay(msg, col, timeTaken = null) {
  drawingContext.shadowBlur = 0;
  fill(0, 200);
  rect(0, 0, width, height);
  
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = col;
  fill(col);
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, height / 2 - 40);

  if (timeTaken !== null) {
    textSize(20);
    fill(255);
    text("TIME: " + timeTaken.toFixed(2) + "s", width / 2, height / 2 + 10);
    
    // 繪製星星評價
    let stars = 1;
    if (timeTaken < 30) stars = 3; // 再延長至 30 秒
    else if (timeTaken < 50) stars = 2; // 再延長至 50 秒

    textSize(30);
    for (let i = 0; i < 3; i++) {
      fill(i < stars ? color(255, 215, 0) : color(100)); // 金色或灰色
      text("★", width / 2 - 40 + i * 40, height / 2 + 50);
    }
  }
  
  textStyle(NORMAL);
  drawingContext.shadowBlur = 0;
  fill(255);
  textSize(16);
  text("CLICK TO REBOOT SYSTEM", width / 2, height / 2 + 100);
}

function mousePressed() {
  if (gameState === "START") {
    // 檢查是否點擊到位於路徑入口的開始按鈕
    let btnH = 34; 
    let btnW = 80; 
    let centerY = (topY[0] + bottomY[0]) / 2;
    let startX = 10;
    if (mouseX > startX && mouseX < startX + btnW && mouseY > centerY - btnH / 2 && mouseY < centerY + btnH / 2) {
      gameStartTime = millis();
      gameState = "PLAYING";
      hasEnteredStart = true; // 點擊按鈕後立即標記為已進入，確保體驗連貫
    }
  } else if (gameState === "WIN" || gameState === "FAIL") {
    initPath();
    gameState = "START";
  }
}
