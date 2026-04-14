let gridSize = 40; // 設定方格的大小
let targetX, targetY; // 儲存「正確」格子的座標
let isFound = false; // 紀錄玩家是否已找到目標
let maxDist; // 畫布的最大對角線距離，用於計算比例
let gameState = "START"; // 狀態控制：START, PLAYING, WON
let startTime; // 遊戲開始的時間點
let remainingTime = 60; // 倒數秒數
let finalGrade = ""; // 最終得分等級

function setup() {
  createCanvas(windowWidth, windowHeight);
  maxDist = dist(0, 0, width, height);
  pickTarget();
}

function draw() {
  background(0); // 背景改為黑色

  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAYING") {
    // 更新倒數計時
    let elapsed = (millis() - startTime) / 1000;
    remainingTime = max(0, 60 - elapsed);
    
    // 時間到卻沒找到
    if (remainingTime <= 0) {
      isFound = false;
      finalGrade = "ㄈ";
      gameState = "WON";
    }
    
    drawGameGrid();
  } else if (gameState === "WON") {
    drawGameGrid();
    drawWinOverlay();
  }
}

function drawStartScreen() {
  push();
  textAlign(CENTER, CENTER);
  
  // 炫砲呼吸燈效果
  let pulse = sin(frameCount * 0.1) * 5;
  drawingContext.shadowBlur = 20 + pulse * 2;
  drawingContext.shadowColor = 'rgba(0, 150, 255, 0.8)';
  
  fill(0, 200, 255);
  textSize(48 + pulse);
  textStyle(BOLD);
  text("找格子", width / 2, height / 2 - 50);
  pop();
  
  drawButton("開始遊戲", width / 2, height / 2 + 50, 200, 50);
}

function drawGameGrid() {
  // 顯示右上角計時器
  if (gameState === "PLAYING") {
    textAlign(RIGHT, TOP);
    fill(255);
    textSize(32);
    text(nf(remainingTime, 1, 1) + "s", width - 20, 20);
  }

  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      stroke(60); // 格線調暗，適合黑底
      noFill();
      rect(x, y, gridSize, gridSize);

      // 只有在被找到的情況下，才渲染正確格子的顏色
      if ((isFound || gameState === "WON") && x === targetX && y === targetY) {
        fill(255, 100, 100); // 正確的格子填入紅色
        rect(x, y, gridSize, gridSize);
      } 
      // 當還沒找到時，偵測滑鼠是否在當前格子內，並給予視覺提示
      else if (gameState === "PLAYING" && mouseX > x && mouseX < x + gridSize && mouseY > y && mouseY < y + gridSize) {
        // 計算滑鼠位置與目標中心點的距離
        let d = dist(mouseX, mouseY, targetX + gridSize/2, targetY + gridSize/2);
        
        // 根據距離計算接近程度 (0 到 1 之間，1 代表重合)
        let proximity = constrain(map(d, 0, maxDist * 0.5, 1, 0), 0, 1);
        
        // 藍色系邏輯：越靠近越偏向青色且越明亮
        noStroke();
        fill(0, 150 * proximity, 255, 150 + 105 * proximity);
        let circleSize = map(proximity, 0, 1, 5, gridSize * 0.9);
        ellipse(x + gridSize / 2, y + gridSize / 2, circleSize);
      }
    }
  }
}

function drawWinOverlay() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  push();
  textAlign(CENTER, CENTER);

  // 根據級分決定發光顏色
  let glowColor;
  if (finalGrade === "ㄅ") glowColor = '#FFD700'; // 金色
  else if (finalGrade === "ㄆ") glowColor = '#00FFFF'; // 青色
  else if (finalGrade === "ㄇ") glowColor = '#FF00FF'; // 紫色
  else glowColor = '#FF4500'; // 橘紅色 (ㄈ)

  // 炫砲呼吸燈與發光效果
  let pulse = sin(frameCount * 0.1) * 5;
  drawingContext.shadowBlur = 30 + pulse;
  drawingContext.shadowColor = glowColor;

  fill(255);
  textSize(60 + pulse);
  textStyle(BOLD);

  // 輕微抖動效果增加衝擊感
  let shakeX = random(-1, 1);
  let shakeY = random(-1, 1);
  text(finalGrade + "級分", width / 2 + shakeX, height / 2 - 100 + shakeY);
  pop();
  
  drawButton("再玩一次", width / 2, height / 2, 200, 50);
  drawButton("回首頁", width / 2, height / 2 + 70, 200, 50);
}

function drawButton(txt, x, y, w, h) {
  push(); // 保護樣式不影響外部
  rectMode(CENTER);
  textAlign(CENTER, CENTER); // 確保文字在按鈕正中心
  stroke(0, 150, 255);
  fill(0);
  rect(x, y, w, h, 10);
  noStroke();
  fill(0, 150, 255);
  textSize(20);
  text(txt, x, y);
  pop(); // 還原樣式
}

function mousePressed() {
  if (gameState === "START") {
    if (isMouseInRect(width / 2, height / 2 + 50, 200, 50)) {
      pickTarget(); // 開始新遊戲時重置目標位置與隱藏狀態
      startTime = millis(); // 記錄開始時間
      gameState = "PLAYING";
    }
  } else if (gameState === "PLAYING") {
    let clickedX = floor(mouseX / gridSize) * gridSize;
    let clickedY = floor(mouseY / gridSize) * gridSize;

    if (clickedX === targetX && clickedY === targetY) {
      isFound = true;
      
      // 計算等級
      let timeSpent = (millis() - startTime) / 1000;
      if (timeSpent <= 30) {
        finalGrade = "ㄅ";
      } else if (timeSpent <= 50) {
        finalGrade = "ㄆ";
      } else {
        finalGrade = "ㄇ";
      }
      
      gameState = "WON";
    }
  } else if (gameState === "WON") {
    if (isMouseInRect(width / 2, height / 2, 200, 50)) {
      pickTarget();
      startTime = millis();
      gameState = "PLAYING";
    } else if (isMouseInRect(width / 2, height / 2 + 70, 200, 50)) {
      gameState = "START";
    }
  }
}

function isMouseInRect(x, y, w, h) {
  return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  maxDist = dist(0, 0, width, height);
  pickTarget(); // 視窗縮放時重新計算，避免目標超出邊界
}

function pickTarget() {
  isFound = false; // 重新出題時隱藏目標
  let cols = floor(width / gridSize);
  let rows = floor(height / gridSize);
  targetX = floor(random(cols)) * gridSize;
  targetY = floor(random(rows)) * gridSize;
}
