let time = 0;
let grasses = [];
let bubbles = [];
let ifrm;
const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

function setup() {
  // Create a full-screen canvas
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '1');
  canvas.style('pointer-events', 'none'); // 關鍵：允許滑鼠事件穿過畫布操作底層網頁

  // 建立 iframe 並設置屬性使其充滿視窗
  ifrm = createElement('iframe');
  ifrm.attribute('src', 'https://www.et.tku.edu.tw');
  ifrm.position(0, 0);
  ifrm.size(windowWidth, windowHeight);
  ifrm.style('z-index', '-1'); // 置於畫布後方
  ifrm.style('border', 'none');
  
  // 初始化 50 根水草
  for (let i = 0; i < 50; i++) {
    let grassColor = color(random(colors));
    // 設定隨機透明度 (100-180)，讓重疊時的深淺變化更自然
    grassColor.setAlpha(random(100, 180)); 

    grasses.push({
      xPos: map(i, 0, 49, 0.05, 0.95), // 橫向位置百分比
      color: grassColor,
      thickness: random(15, 35),      // 調整為更細的粗細
      maxHeight: random(0.2, 0.45),   // 縮短高度百分比
      swayFreq: random(0.2, 0.5),     // 降低搖晃頻率範圍，讓動作更緩慢
      noiseSeed: random(1000)         // 隨機雜訊起點，確保動態不重疊
    });
  }
}

function draw() {
  // 清除每一幀的畫布並設定半透明背景 (#90e0ef 的 RGB 為 144, 224, 239)
  // 0.2 的透明度對應 alpha 值約為 51 (255 * 0.2)
  clear();
  background(144, 224, 239, 51);

  // 設定混合模式為一般透明疊加 (BLEND)
  // 這會讓透明的顏色在重疊處產生層次感
  blendMode(BLEND);

  noFill();
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // --- 氣泡邏輯 (Bubble Logic) ---
  // 偶爾產生新氣泡
  if (frameCount % 15 === 0) {
    bubbles.push({
      x: random(width),
      y: height + 20,
      size: random(10, 30),
      speed: random(1, 3),
      popY: random(height * 0.1, height * 0.8), // 到達此高度後破掉
      isPopping: false,
      popScale: 1.0,
      popAlpha: 255
    });
  }

  // 更新與繪製氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (!b.isPopping) {
      b.y -= b.speed;
      b.x += sin(frameCount * 0.05 + b.y * 0.1) * 0.5; // 輕微左右晃動
      if (b.y < b.popY) b.isPopping = true;

      // 繪製氣泡本體 (白色，透明度 0.5)
      noStroke();
      fill(255, 127); 
      circle(b.x, b.y, b.size);
      
      // 繪製上方反光圓圈 (白色，透明度 0.7)
      fill(255, 178); 
      circle(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.3);
    } else {
      // 破裂效果：擴張的圓環
      noFill();
      stroke(255, b.popAlpha);
      strokeWeight(1.5);
      circle(b.x, b.y, b.size * b.popScale);
      b.popScale += 0.2;
      b.popAlpha -= 15;
      if (b.popAlpha <= 0) bubbles.splice(i, 1);
    }
  }
  noFill(); // Reset fill for seagrass

  for (let g of grasses) {
    stroke(g.color);
    strokeWeight(g.thickness);
    
    let baseX = g.xPos * width;
    let baseY = height;
    let seagrassLength = height * g.maxHeight;

    beginShape();
    let lastX, lastY;
    for (let i = 0; i <= seagrassLength; i += 10) {
      let y = baseY - i;
      
      // 使用專屬的 swayFreq 與 noiseSeed 控制搖晃
      let n = noise(time * g.swayFreq + g.noiseSeed, i * 0.01);
      
      // 搖晃範圍設定為 200，讓畫面充滿動態感
      let maxSway = map(i, 0, seagrassLength, 0, 200); 
      let x = baseX + map(n, 0, 1, -maxSway, maxSway);

      if (i === 0) curveVertex(x, y);
      curveVertex(x, y);
      lastX = x;
      lastY = y;
    }
    curveVertex(lastX, lastY);
    endShape();
  }

  // Increment time to drive the noise animation
  time += 0.005; // 減慢全域時間增量，進一步平滑化動態
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ifrm.size(windowWidth, windowHeight);
}
