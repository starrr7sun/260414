let input;
let slider;
let button;
let isJumping = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  input = createInput('淡江大學🎶😎');
  input.position(20, 20);       // 設定輸入框位置
  input.size(200, 30);          // 設定輸入框寬高
  input.style('font-size', '20px'); // 設定輸入框內的文字大小
  input.style('background-color', '#f2e8cf'); // 設定輸入框背景顏色
  input.style('color', '#219ebc');            // 設定輸入框文字顏色
  input.style('border-radius', '10px');       // 設定輸入框圓角
  input.style('font-weight', 'bold');         // 設定輸入框文字為粗體

  slider = createSlider(15, 80, 30); // 建立滑桿 (最小值, 最大值, 預設值)
  slider.position(input.x + input.width + 50, 20); // 定位在文字方塊右側 50px 處

  button = createButton('跳動'); // 建立按鈕
  button.position(slider.x + slider.width + 50, 20); // 按鈕位置在滑桿右側 50px
  button.size(150, 50); // 按鈕寬度 150，高度 50
  button.style('font-size', '20px'); // 按鈕文字大小 20px
  button.mousePressed(() => isJumping = !isJumping); // 按下後切換跳動狀態
  button.style('border-radius', '10px'); // 設定按鈕圓角

  let div = createDiv();
  div.position(200, 50); // 調整 Div 位置，讓上方距離縮短為 50px
  div.size(windowWidth - 400, windowHeight - 100); // 調整 Div 高度，讓上下距離各為 50px
  div.style('opacity', '0.95'); // 設定透明度
  div.style('border-radius', '10px'); // 設定視窗圓角
  div.style('overflow', 'hidden'); // 確保內容不超出圓角
  let iframe = createElement('iframe'); // 建立 iframe 元素
  iframe.attribute('src', 'https://www.tku.edu.tw'); // 設定 iframe 網址
  iframe.style('width', '100%'); // iframe 寬度填滿 div
  iframe.style('height', '100%'); // iframe 高度填滿 div
  iframe.parent(div); // 將 iframe 放入 div 中

  let sel = createSelect(); // 建立下拉式選單
  sel.position(button.x + button.width + 50, 20); // 定位在按鈕右側 50px
  sel.size(100, 30); // 設定選單大小
  sel.style('font-size', '14px'); // 設定選單文字大小
  sel.style('border-radius', '10px'); // 設定選單圓角
  sel.option('淡江大學'); // 新增選項
  sel.option('教科系');   // 新增選項
  sel.changed(function() {
    if (sel.value() === '淡江大學') {
      iframe.attribute('src', 'https://www.tku.edu.tw');
      input.value('淡江大學🎶😎'); // 更新輸入框文字
    } else if (sel.value() === '教科系') {
      iframe.attribute('src', 'https://www.et.tku.edu.tw');
      input.value('教科系🎶😎');   // 更新輸入框文字
    }
  });

  textAlign(LEFT, CENTER);      // 設定文字垂直置中
}

function draw() {
  background('#e4f2fc');
  let txt = input.value();      // 動態取得輸入內容
  textSize(slider.value());     // 從滑桿取得數值並設定文字大小
  textStyle(BOLD);              // 設定文字為粗體
  let w = textWidth(txt);       // 計算文字寬度

  let colors = ['#1b263b', '#778da9', '#0081a7', '#0f4c5c', '#1e6091']; // 色票陣列

  if (txt.length > 0) {
    // 利用雙重迴圈，將文字排滿整個視窗
    for (let y = 100; y < height; y += slider.value() * 1.5) {
      let count = 0; // 每一行開始時重置計數器
      for (let x = 0; x < width; x += w + 30) {
        fill(colors[count % colors.length]); // 依序取出顏色
        if (isJumping) {
          text(txt, x, y + sin(frameCount * 0.05 + x * 0.02) * 10); // 溫和波浪效果
        } else {
          text(txt, x, y);
        }
        count++; // 增加計數
      }
    }
  }
}