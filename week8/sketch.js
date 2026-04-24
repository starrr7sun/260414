let capture;
let isLoaded = false;
let bubbles = [];
let shutterBtn;
let flashCounter = 0; // 用於拍照閃光效果

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 使用物件方式設定，並明確關閉音訊以減少權限請求
  capture = createCapture({
    video: { facingMode: 'user' },
    audio: false
  }, function() {
    isLoaded = true;
  });
  
  capture.elt.setAttribute('playsinline', '');
  capture.hide();

  // 建立相機快門鍵按鈕
  shutterBtn = createButton('📷');
  shutterBtn.mousePressed(takePhoto);
  styleButton();
}

function styleButton() {
  // 根據當前視窗大小計算按鈕位置（視訊畫面下方）
  let vHeight = height * 0.6;
  let btnSize = 70;
  let x = width / 2 - btnSize / 2;
  // 確保按鈕在視訊下方，且不超出螢幕底部
  let y = min(height / 2 + vHeight / 2 + 40, height - 100);

  shutterBtn.position(x, y);
  shutterBtn.size(btnSize, btnSize);
  
  // 強制設定 CSS 樣式確保顯示在最上層
  shutterBtn.style('display', 'block');
  shutterBtn.style('position', 'absolute');
  shutterBtn.style('z-index', '10000'); 
  shutterBtn.style('background-color', 'white');
  shutterBtn.style('border', '5px solid #555'); // 加深邊框顏色增加辨識度
  shutterBtn.style('border-radius', '50%');
  shutterBtn.style('font-size', '30px');
  shutterBtn.style('cursor', 'pointer');
  shutterBtn.style('box-shadow', '0 4px 10px rgba(0,0,0,0.2)');
  shutterBtn.style('outline', 'none');
}

function windowResized() {
  // 當手機轉向或視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  styleButton(); // 重新計算按鈕位置
}

function mousePressed() {
  // 部分行動瀏覽器需要使用者互動（點擊）後才允許啟動影像
  if (capture) {
    capture.play();
  }
}

function takePhoto() {
  // 擷取目前的畫布內容並儲存為 jpg
  flashCounter = 10; // 啟動閃光效果（持續 10 幀）
  saveCanvas('my_mosaic_capture', 'jpg');
}

function draw() {
  background('#e7c6ff');

  if (isLoaded) {
    let vWidth = width * 0.6;
    let vHeight = height * 0.6;

    // 實作水平鏡面翻轉（鏡像效果）
    push();
    translate(width / 2, height / 2); // 將座標原點移至畫布中心
    scale(-1, 1); // 水平縮放 -1 倍，達成鏡像翻轉

    // 1. 繪製馬賽克黑白視訊影像
    capture.loadPixels();
    let unitSize = 20; // 定義馬賽克單位大小
    if (capture.pixels.length > 0) {
      for (let y = 0; y < vHeight; y += unitSize) {
        for (let x = 0; x < vWidth; x += unitSize) {
          // 將目前畫布上的座標映射回視訊原始像素座標
          let sx = floor(map(x, 0, vWidth, 0, capture.width));
          let sy = floor(map(y, 0, vHeight, 0, capture.height));
          let i = (sx + sy * capture.width) * 4;

          let r = capture.pixels[i];
          let g = capture.pixels[i + 1];
          let b = capture.pixels[i + 2];
          let gray = (r + g + b) / 3; // 依照要求計算平均值作為黑白顏色值

          fill(gray);
          noStroke();
          rect(x - vWidth / 2, y - vHeight / 2, unitSize, unitSize);
        }
      }
    }

    // 2. 直接在視訊畫面上方繪製泡泡效果
    // 產生新泡泡
    if (frameCount % 10 === 0 && bubbles.length < 30) {
      bubbles.push({ 
        x: random(-vWidth / 2, vWidth / 2), 
        y: vHeight / 2 + 20, 
        r: random(10, 40), 
        speed: random(1, 3) 
      });
    }

    // 更新並繪製泡泡
    for (let i = bubbles.length - 1; i >= 0; i--) {
      let b = bubbles[i];
      b.y -= b.speed; // 向上漂浮
      
      stroke(255, 255, 255, 200);
      strokeWeight(2);
      noFill();
      circle(b.x, b.y, b.r);
      
      noStroke();
      fill(255, 255, 255, 180);
      circle(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3);

      // 移除超出視訊畫面的泡泡
      if (b.y < -vHeight / 2 - 50) bubbles.splice(i, 1);
    }
    pop();

    // 3. 在右上角顯示一個即時彩色小預覽
    // 這能讓使用者在看到馬賽克特效的同時，也能預覽真實的拍照構圖與光線
    let pw = 160; // 預覽視窗寬度
    let ph = (pw * capture.height) / capture.width; // 依比例計算高度
    push();
    // 將預覽視窗放在右上角，並同步水平鏡像翻轉
    translate(width - 20, 20);
    scale(-1, 1);
    image(capture, 0, 0, pw, ph);
    pop();

    // 拍照閃光效果處理
    if (flashCounter > 0) {
      fill(255, flashCounter * 25); // 根據剩餘幀數設定透明度
      noStroke();
      rect(0, 0, width, height);
      flashCounter--;
    }
  } else {
    // 已移除提示文字
  }
}
