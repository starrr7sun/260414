let nodes = [];
let vinePoints = [];
let displayFrame;

const weekData = [
  { week: "W1", title: "week1", url: "week1/index.html" },
  { week: "W2", title: "week2", url: "week2/index.html" },
  { week: "W3", title: "week3", url: "week3/index.html" },
  { week: "W4", title: "week4", url: "week4/index.html" },
  { week: "W5", title: "week5", url: "week5/index.html" },
  { week: "W6", title: "week6", url: "week6/index.html" },
  { week: "W7", title: "week7", url: "week7/index.html" }
];

function setup() {
  // 建立畫布，寬度預留一部分給左側時間軸
  let canvas = createCanvas(windowWidth, windowHeight);
  
  // 建立 iframe 顯示區域 (佔據右側 60% 空間)
  displayFrame = createImg('https://p5js.org/assets/img/p5js-logo.svg', 'p5js logo'); // 初始占位圖
  displayFrame = createElement('iframe');
  displayFrame.position(width * 0.4, 20);
  displayFrame.size(width * 0.55, height - 40);
  displayFrame.style('border', 'none');
  displayFrame.style('border-radius', '10px');
  displayFrame.style('box-shadow', '0 0 15px rgba(0,0,0,0.1)');

  // 初始化週次節點
  for (let i = 0; i < weekData.length; i++) {
    // 節點沿著 y 軸分佈，從下往上生長
    let y = map(i, 0, weekData.length - 1, height - 100, 100);
    nodes.push(new SeedNode(y, weekData[i]));
  }
}

function draw() {
  background(245, 250, 240); // 淺綠色背景，營造自然感

  drawVine();

  // 更新並顯示所有節點
  for (let node of nodes) {
    node.update();
    node.display();
  }
}

function drawVine() {
  noFill();
  stroke(34, 139, 34, 150); // 森林綠，帶透明度
  strokeWeight(6);
  
  beginShape();
  // 從地底（畫布底部）開始繪製 vertex
  for (let y = height; y > 50; y -= 5) {
    // 利用 sin 讓藤蔓產生波浪擺動感
    let xOffset = sin(y * 0.01 + frameCount * 0.02) * 30;
    let x = width * 0.2 + xOffset;
    vertex(x, y);
  }
  endShape();
}

class SeedNode {
  constructor(y, data) {
    this.y = y;
    this.data = data;
    this.baseX = width * 0.2;
    this.currentX = this.baseX;
    this.size = 20;
    this.isHovered = false;
    this.targetSize = 20;
  }

  update() {
    // 同步藤蔓的擺動位置
    this.currentX = this.baseX + sin(this.y * 0.01 + frameCount * 0.02) * 30;

    // 偵測滑鼠懸停 (簡單的距離檢測)
    let d = dist(mouseX, mouseY, this.currentX, this.y);
    if (d < this.size) {
      this.isHovered = true;
      this.targetSize = 45; // 懸停時變大 (開花效果)
    } else {
      this.isHovered = false;
      this.targetSize = 20;
    }
    this.size = lerp(this.size, this.targetSize, 0.1);
  }

  display() {
    fill(this.isHovered ? color(255, 105, 180) : color(144, 238, 144));
    stroke(255);
    strokeWeight(2);
    ellipse(this.currentX, this.y, this.size);

    if (this.isHovered) {
      fill(50);
      noStroke();
      textAlign(RIGHT, CENTER);
      text(`${this.data.week}: ${this.data.title}`, this.currentX - 30, this.y);
    }
  }

  clicked() {
    let d = dist(mouseX, mouseY, this.currentX, this.y);
    if (d < this.size) {
      displayFrame.attribute('src', this.data.url);
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
  // 這裡可以視需求重新調整節點位置或 iframe 大小
}
