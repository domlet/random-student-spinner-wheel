/*
write a p5js app that takes a list of  names (any length) and generates a circle with that number of multicolored slices, with each name written inside a slice with the baseline of the text following a line from the center of the circle to the edge. The last letter of each name should be 6px from the circle's outside edge. put a black triangle pointing at the very top of the circle in the center.
when the user hits any key or clicks on the screen, the circle and names should spin clockwise quickly at first, and then slowly, ultimately stopping with one specific name at the top. there should be a clicking noise that plays every time 5 names pass the black triangle.
*/
// p5.js spinning name wheel with audio ticks and name alignment

// List of student names
let names = [
  "Aaliyah", "Mateo", "Nia", "Kenji", "Zuri", "Amara", "Malik", "Mei",
  "Jamal", "Leilani", "Santiago", "Anaya", "Jabari", "Priya", "Zion",
  "Naomi", "Hassan", "Ayla", "Darius", "Hana", "Luca", "Xiomara", "Kofi",
  "Esme", "Takumi", "Imani", "Diego", "Rina", "Ayesha", "DeShawn", "Chiara",
  "Yusuf", "Noemi", "Kai"
];

let sliceColors = [];

// Wheel settings and animation state
let wheelRadius = 200;
let angle = 0;
let velocity = 0;
let spinning = false;
let spinStartTime = 0;
let spinDuration = 0;
let lastClickIndex = 0;

// Sounds and selected name
let clickSound;
let chimeSound;
let selectedName = "";
let selectedNames = []; // Keeps track of names already selected
let selectedIndexToRemove = -1; // Track index to remove after spin
let showInterface = false;
let approvedWinners = {}; // Tracks which names got the party emoji

function preload() {
  soundFormats('mp3', 'ogg');
  clickSound = loadSound('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  chimeSound = loadSound('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
  correctSound = loadSound('325805__wagna__collect.wav');
  incorrectSound = loadSound('587253__beetlemuse__dats-wrong.wav');
}

function setup() {
  createCanvas(600, 500);
  textAlign(RIGHT, CENTER);
  textSize(14);
  angleMode(RADIANS);
  colorMode(HSL);
  for (let i = 0; i < names.length; i++) {
    sliceColors.push(color(random(360), 80, 70));
  }
  colorMode(RGB);
}

function draw() {
  background(128);

  // Draw title and selected names in the top left corner
  fill(255);
  textSize(14);
  textAlign(CENTER, BOTTOM);
  text("Click to spin wheel", width / 2, height - 20);
  textAlign(LEFT, TOP);
  textSize(16);
  textStyle(BOLD);
  text("For the Glory:", 10, 10);
  textStyle(NORMAL);
  textSize(14);
  let y = 30;
  for (let name of selectedNames) {
    let emoji = approvedWinners[name] ? " 🎉" : "";
    text(name + emoji, 10, y);
    y += 18;
  }

  // Draw and update the spinning wheel
  translate(width / 2, height / 2);
  rotate(angle);
  drawWheel();
  rotate(-angle);
  drawPointer();

  if (spinning) {
    let elapsed = millis() - spinStartTime;
    let t = constrain(elapsed / spinDuration, 0, 1);
    velocity = lerp(0.5, 0, t);
    angle += velocity;

    let currentIndex = floor((TWO_PI - angle % TWO_PI) / (TWO_PI / names.length)) % names.length;
    if (abs(currentIndex - lastClickIndex) >= 5) {
      if (clickSound && clickSound.isLoaded()) clickSound.play();
      lastClickIndex = currentIndex;
    }

    if (t >= 1) {
      velocity = 0;
      spinning = false;
      let normalizedAngle = (TWO_PI - (angle % TWO_PI) + TWO_PI) % TWO_PI;
      let sliceAngle = TWO_PI / names.length;
      let selectedIndex = floor(normalizedAngle / sliceAngle) % names.length;
      selectedName = names[selectedIndex];
      selectedIndexToRemove = selectedIndex;
      if (chimeSound && chimeSound.isLoaded()) chimeSound.play();
      if (!selectedNames.includes(selectedName)) {
        selectedNames.push(selectedName);
      }
      showInterface = true;
    }
  }

  if (!spinning && selectedName !== "") {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("🎉 " + selectedName + " 🎉", 0, 0);
    textSize(12);
    textAlign(CENTER, BOTTOM);

    if (showInterface) {
      textAlign(CENTER, CENTER);
      textSize(24);
      text("❌     ✅", 0, -height / 2 + 40);
    }
  }
}

function drawWheel() {
  let anglePerSlice = TWO_PI / names.length;
  colorMode(HSL);
  for (let i = 0; i < names.length; i++) {
    let startAngle = i * anglePerSlice;
    fill(sliceColors[i % sliceColors.length]);
    stroke('gray');
    strokeWeight(1);
    arc(0, 0, wheelRadius * 2, wheelRadius * 2, startAngle, startAngle + anglePerSlice, PIE);
    push();
    rotate(startAngle + anglePerSlice / 2);
    fill(0);
    noStroke();
    text(names[i], wheelRadius - 56, 0);
    pop();
  }
  colorMode(RGB);
}

function drawPointer() {
  fill(0);
  noStroke();
  push();
  translate(wheelRadius + 30, 0);
  rotate(HALF_PI);
  triangle(-10, -20, 10, -20, 0, 0);
  pop();
}

function keyPressed() {
  if (key === ' ') triggerSpin();
  if (!spinning && showInterface) {
    if (key === '1') {
      approvedWinners[selectedName] = true;
      showInterface = false;
      correctSound.play()
    } else if (key === '0') {
      showInterface = false;
      incorrectSound.play()
    }
  }
}

function mousePressed() {
  if (!spinning && showInterface) {
    if (mouseY > 0 && mouseY < 60) {
      // Define the hitbox for ❌ and ✅ areas
      let centerX = width / 2;
      if (mouseX > centerX - 60 && mouseX < centerX - 10) {
        // ❌ clicked
        showInterface = false;
      } else if (mouseX > centerX + 10 && mouseX < centerX + 60) {
        // ✅ clicked
        approvedWinners[selectedName] = true;
        showInterface = false;
      }
    }
  } else {
    triggerSpin();
  }
}

function triggerSpin() {
  if (!spinning && names.length > 0) {
    if (selectedIndexToRemove !== -1 && selectedIndexToRemove < names.length) {
      names.splice(selectedIndexToRemove, 1);
      sliceColors.splice(selectedIndexToRemove, 1);
      selectedIndexToRemove = -1;
    }
    spinning = true;
    showInterface = false;
    spinStartTime = millis();
    spinDuration = 4000 + random(0, 1000);
    velocity = 0.5;
    lastClickIndex = floor((TWO_PI - angle % TWO_PI) / (TWO_PI / names.length)) % names.length;
    selectedName = "";
  }
}
