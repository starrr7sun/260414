let weeds = [];
let fishes = [];
let bubbles = [];
let popSound;
let soundEnabled = false;

function preload() {
  popSound = loadSound('pop.mp3');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'absolute');
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透 Canvas 到達 iframe，使網頁可操作
  cnv.style('z-index', '2'); // 將畫布層級提高，置於 iframe 之上

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'absolute');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '1'); // 將 iframe 層級設為 1，確保顯示但位於畫布下方
  
  let colors = ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'];

  for (let i = 0; i < 80; i++) {
    let xBase = map(i, 0, 80, -200, width + 200); // 計算平均分佈的基礎位置
    weeds.push({
      x: xBase + random(-30, 30), // 在基礎位置上加入小幅隨機偏移，保持自然感但不出大空隙
      h: random(height * 0.2, height * 0.45), // 高度 20%~45%
      w: random(40, 50), // 粗細 40~50
      c: random(colors), // 隨機顏色
      speed: random(0.005, 0.02), // 搖晃速度不一樣
      noiseOffset: random(1000) // 讓每一條的搖晃起始點不同
    });
  }
  
  // 初始化魚群
  for (let i = 0; i < 10; i++) {
    fishes.push(new Fish());
  }
}

function draw() {
  clear(); // 關鍵修正：每一幀先清除畫布，避免透明背景無限疊加變成不透明
  background('rgba(202, 240, 248, 0.3)'); // 背景改為半透明 (0.3)，讓後方網頁顯示
  blendMode(BLEND); // 依照指示設定混合模式
  noStroke();

  let segments = 30; // 分段數量

  for (let weed of weeds) {
    let c = color(weed.c); // 將顏色字串轉為 p5 Color 物件
    c.setAlpha(150); // 設定透明度 (0-255)，產生半透明重疊效果
    fill(c);
    beginShape();
    // 繪製水草左側 (從底部往上)
    for (let i = 0; i <= segments; i++) {
      drawWeedVertex(i, segments, weed, -1);
    }
    // 繪製水草右側 (從頂部往下，閉合形狀)
    for (let i = segments; i >= 0; i--) {
      drawWeedVertex(i, segments, weed, 1);
    }
    endShape(CLOSE);
  }

  // 繪製魚
  for (let f of fishes) {
    f.update();
    f.display();
  }

  // 繪製氣泡
  if (random() < 0.03) bubbles.push(new Bubble()); // 隨機產生氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].finished) {
      bubbles.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      userStartAudio();
    }
  }
}

function drawWeedVertex(i, segments, weed, side) {
  let p = i / segments; // 進度 0.0 (底) -> 1.0 (頂)
  let y = height - p * weed.h;
  // 利用 noise 產生波動，使用個別的速度 (weed.speed) 和偏移 (weed.noiseOffset)
  let n = noise(p * 2 - frameCount * weed.speed + weed.noiseOffset, frameCount * weed.speed);
  // 利用 map 將 noise 值映射到擺動範圍，並隨高度 (p) 增加擺動幅度
  let xOffset = map(n, 0, 1, -140, 140) * (p * p);
  // 海草形狀：增加寬度並加入波浪狀邊緣 (利用 sin)
  let wave = sin(p * 20 - frameCount * 0.05) * 6;
  let w = map(p, 0, 1, weed.w, 5) + wave;
  
  curveVertex(weed.x + xOffset + (w * side), y);
}

class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(30, 60);
    this.speed = random(1, 3);
    this.c = color(random(100, 255), random(100, 200), random(100, 255));
  }

  update() {
    this.x -= this.speed;
    // 超出左邊界後從右邊出現
    if (this.x < -100) this.x = width + 100;
  }

  display() {
    push();
    translate(this.x, this.y);
    fill(this.c);
    ellipse(0, 0, this.size, this.size * 0.6); // 身體
    triangle(this.size * 0.4, 0, this.size * 0.7, -this.size * 0.2, this.size * 0.7, this.size * 0.2); // 尾巴
    fill(255);
    circle(-this.size * 0.2, -this.size * 0.1, 5); // 眼白
    fill(0);
    circle(-this.size * 0.2, -this.size * 0.1, 2); // 眼珠
    pop();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.size = random(10, 20);
    this.speed = random(1, 3);
    this.popY = random(height * 0.2, height * 0.8); // 破掉的高度
    this.popped = false;
    this.timer = 10; // 破掉動畫持續時間
    this.finished = false;
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      if (this.y < this.popY) {
        this.popped = true;
        if (soundEnabled) popSound.play();
      }
    } else {
      this.timer--;
      if (this.timer <= 0) this.finished = true;
    }
  }

  display() {
    push();
    if (!this.popped) {
      noStroke();
      fill(255, 127); // 白色，透明度 0.5 (127/255)
      circle(this.x, this.y, this.size);
      fill(255, 204); // 高光，透明度 0.8 (204/255)
      circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
    } else {
      // 破掉效果
      noFill();
      stroke(255);
      strokeWeight(2);
      let r = this.size + (10 - this.timer) * 2; // 隨時間擴大
      circle(this.x, this.y, r);
    }
    pop();
  }
}
