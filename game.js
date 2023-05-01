var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

// Herni objekty
var player = {
  x: width / 2,
  y: height / 2,
  size: 80,
  speed: 10,
  color: "blue",
  weapon: new Image(),
  image: new Image(),
  weaponX: 0,
  weaponY: 0,
  draw: function() {
    ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.drawImage(this.weapon, this.weaponX, this.weaponY);
  },
  update: function() {
    if (keys["ArrowLeft"]) {
      this.x -= this.speed;
    }
    if (keys["ArrowRight"]) {
      this.x += this.speed;
    }
    if (keys["ArrowUp"]) {
      this.y -= this.speed;
    }
    if (keys["ArrowDown"]) {
      this.y += this.speed;
    }
    if (keys["Space"]) {
      this.shoot();
    }

    this.weaponX = this.x - this.weapon.width / 2;
    this.weaponY = this.y - this.weapon.height / 2;
    player.image.src = "imgs/telo.png";
  },



  shoot: function() {
    var bullet = {
      x: this.x,
      y: this.y,
      size: 5,
      speed: 10,
      color: "black",
      draw: function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      },
      update: function() {
        this.x += this.speed;
      }
    };
    bullets.push(bullet);
    ammo--;
    playGunshotSound();
  }
};


player.weapon.onload = function() {
  loop();
};
player.weapon.src = "imgs/zbran3.png";

var enemies = [];
var bullets = [];

function spawnEnemy() {
  var enemy = {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 30,
    speed: 2,
    color: "red",
    draw: function() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    },
    update: function() {
      var dx = player.x - this.x;
      var dy = player.y - this.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.size / 2 + this.size / 2) {
        alert("Prohrál jsi!");
        location.reload();
      }
      this.x += dx / dist * this.speed;
      this.y += dy / dist * this.speed;
    }
  };
  enemies.push(enemy);
}

setInterval(spawnEnemy, 1000);

var keys = {};

document.addEventListener("keydown", function(event) {
  keys[event.code] = true;
});

document.addEventListener("keyup", function(event) {
  keys[event.code] = false;
});

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;



var audioContext = new AudioContext();


var soundUrls = [  "music/gunshot3.wav"];


var soundBuffers = [];
var numSoundsLoaded = 0;
for (var i = 0; i < soundUrls.length; i++) {
  var request = new XMLHttpRequest();
  request.open("GET", soundUrls[i], true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      soundBuffers.push(buffer);
      numSoundsLoaded++;
    });
  };
  request.send();
}

var score = 0;
var ammo = 30;
var reloading = false;

function update() {
  player.update();
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].update();
    for (var j = 0; j < bullets.length; j++) {
      var dx = bullets[j].x - enemies[i].x;
      var dy = bullets[j].y - enemies[i].y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bullets[j].size / 2 + enemies[i].size / 2) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        var audio = new Audio('music/gunshot3.mp3');
        audio.play();
        score += 1;
        i--;
        break;
      }
    }
  }
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].update();
    if (bullets[i].x > width) {
      bullets.splice(i, 1);
      i--;
    }
  }
}


function render() {
  ctx.clearRect(0, 0, width, height);
  player.draw();
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw();
  }
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].draw();
  }
  ctx.font = "60px Arial";
  ctx.fillStyle = "#EC0D0D";
  ctx.fillText("Skore: " + score, 10, 50);
  ctx.fillText("Náboje: " + ammo, 10, 100);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}


// Vybere nahodny zvuk vystrelu
function playGunshotSound() {
  if (numSoundsLoaded === soundUrls.length) {
    var index = Math.floor(Math.random() * soundBuffers.length);
    var source = audioContext.createBufferSource();
    source.buffer = soundBuffers[index];
    source.connect(audioContext.destination);
    source.start(0);
  }
}

// Vystreli naboj
canvas.addEventListener("mousedown", function(event) {
  if (ammo > 0 && !reloading) {
    var bullet = new Bullet(player.x, player.y);
    bullets.push(bullet);
  }
});


var shootSound = new Audio("music/gunshot.wav");

// Prebijeni
document.addEventListener("keydown", function(event) {
  if (event.key === "r" && ammo < 30 && !reloading) {
    reloading = true;
    setTimeout(function() {
      ammo = 30;
      reloading = false;
    }, 1000);
  } else if (event.key === " " && !gameOver) {
    shoot();
  }
});

function shoot() {
  if (ammo > 0 && !reloading) {
    // Play the shoot sound
    shootSound.play();

    // Loop through all enemies and check for collisions
    for (var i = 0; i < enemies.length; i++) {
      if (collision(player, enemies[i])) {
        score += 10; // Increase score by 10 when enemy is hit
        enemies.splice(i, 1);
      }
    }
    
    
    ammo--;
  }
}


var music = new Audio("music/test.mp3");


music.loop = true;

// Zapne hudbu do pozadí
music.play();


// Zapne hru
loop();

