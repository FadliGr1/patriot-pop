// script.js
const gameContainer = document.querySelector(".game-container");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
const scoreDisplay = document.getElementById("score-display");
const lifeBar = document.getElementById("life-bar");
let intervalId; // Variable untuk menyimpan ID interval
let startTime; // Variable untuk menyimpan waktu mulai permainan
let isPaused = false; // Variable untuk menyimpan status pause game
let score = 0; // Variabel untuk menyimpan poin
let lives = 100; // Jumlah nyawa awal (100%)
let consecutiveMissedBalloons = 0; // Jumlah balon yang mencapai batas atas layar berturut-turut
let lifeBarFill = document.createElement("div");
lifeBarFill.classList.add("life-bar-fill");
lifeBar.appendChild(lifeBarFill);

// Fungsi untuk membuat balon dan mengatur posisi dan warnanya secara acak
function createBalloon() {
  const balloon = document.createElement("div");
  balloon.classList.add("balloon");
  const colors = ["red", "white"]; // Warna balon: merah dan putih
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  balloon.style.backgroundColor = randomColor;
  balloon.style.left = `${20 + Math.random() * 60}%`; // Mengatur posisi horizontal secara acak
  gameContainer.appendChild(balloon);

  // Fungsi untuk menghapus balon ketika berhasil ditembak
  balloon.addEventListener("click", () => {
    balloon.remove();
    createExplosion(balloon.style.left, balloon.style.top, randomColor);
  });

  // Efek tali pada balon
  const string = document.createElement("div");
  string.classList.add("string");
  balloon.appendChild(string);

  // Fungsi untuk menghapus balon ketika mencapai batas atas layar
  function removeBalloon() {
    if (balloon.parentNode === gameContainer) {
      // Balon hanya akan dihapus jika masih berada dalam gameContainer
      consecutiveMissedBalloons++;
      balloon.remove();

      // Mengurangi nyawa ketika balon mencapai batas atas
      if (consecutiveMissedBalloons < 3) {
        // Pengurangan 1-7% ketika balon mencapai batas atas kurang dari 3 kali berturut-turut
        const decreasePercentage = getRandomNumber(1, 7);
        lives = Math.max(0, lives - decreasePercentage);
      } else {
        // Pengurangan 7-12% ketika balon mencapai batas atas 3 kali berturut-turut atau lebih
        const decreasePercentage = getRandomNumber(7, 12);
        lives = Math.max(0, lives - decreasePercentage);
      }

      updateLifeBar();

      createExplosionatas(balloon.style.left, "0px", "gray");

      // Jika nyawa habis, hentikan permainan
      if (lives === 0) {
        clearInterval(intervalId);
        gameContainer.innerHTML = ""; // Hapus semua balon yang ada
        startButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        isPaused = false; // Reset status pause
        pauseButton.textContent = "Pause";
        showGameOverMessage();
      }
    }
  }

  function showGameOverMessage() {
    const gameOverMessage = document.querySelector(".game-over-message");
    gameOverMessage.style.display = "block"; // Tampilkan pesan "Game Over"
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateLifeBar() {
    lifeBarFill.style.width = `${lives}%`;

    // Update warna background pada life-bar-fill sesuai dengan jumlah nyawa
    const greenValue = Math.floor((lives / 100) * 255);
    const redValue = 255 - greenValue;
    const backgroundColor = `rgb(${redValue}, ${greenValue}, 0)`;
    lifeBarFill.style.backgroundColor = backgroundColor;
  }

  // Animasi balon bergerak ke atas
  let posY = 500;
  const speedMultiplier = Math.floor(score / 10) + 0.5; // Penambahan kecepatan berdasarkan kelipatan 10 score
  function moveBalloon() {
    posY -= 1 * speedMultiplier; // Kecepatan balon bergerak ke atas disesuaikan dengan speedMultiplier
    const swayAngle = Math.sin(posY / 30) * 5;
    balloon.style.top = posY + "px";
    balloon.style.transform = `rotate(${swayAngle}deg)`;
    string.style.height = 0 - posY + "px"; // Efek naiknya tali seiring balon bergerak ke atas
    if (posY > 0) {
      requestAnimationFrame(moveBalloon);
    } else {
      removeBalloon();
    }
  }
  requestAnimationFrame(moveBalloon);
}

function countdown(seconds) {
  const countDisplay = document.createElement("div");
  countDisplay.classList.add("countdown");
  gameContainer.appendChild(countDisplay);

  let count = seconds;
  countDisplay.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    countDisplay.textContent = count;

    if (count === 0) {
      clearInterval(countdownInterval);
      countDisplay.remove();
      startGame(); // Memulai permainan setelah hitungan mundur selesai
    }
  }, 1000);
}

function playExplosionSound() {
  const explosionSound = document.getElementById("explosionSound");
  explosionSound.play();
}

// meledak batas layar atas
function createExplosionatas(x, y, color) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  explosion.style.left = x;
  explosion.style.top = y;
  explosion.style.backgroundColor = color;
  gameContainer.appendChild(explosion);

  setTimeout(() => {
    explosion.remove();
  }, 1000);

  playExplosionSound();
}
// Fungsi untuk membuat efek meledak saat balon dihapus
function createExplosion(x, y, color) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  explosion.style.left = x;
  explosion.style.top = y;
  explosion.style.backgroundColor = color;
  gameContainer.appendChild(explosion);

  // Membuat elemen untuk menampilkan angka jumlah poin
  const scoreText = document.createElement("div");
  scoreText.classList.add("score-text");
  scoreText.textContent = `+1`; // Atur angka sesuai dengan poin yang ingin ditambahkan (misalnya: +10)
  explosion.appendChild(scoreText);

  setTimeout(() => {
    explosion.remove();
  }, 1000);

  playExplosionSound();
  score++;
  scoreDisplay.textContent = `Score: ${score}`;
}

// Fungsi untuk memulai game dengan mengulangi pembuatan balon setiap beberapa detik
function startGame() {
  clearInterval(intervalId); // Hentikan interval jika sudah ada

  // Mengatur intervalTime berdasarkan waktu berlalu dan nilai score
  let intervalTime = 1000 - Math.min(900, Math.floor(Date.now() / 1000 - startTime) * 50);

  // Menambahkan kecepatan berdasarkan nilai score
  const speedMultiplier = Math.floor(score / 10) + 1; // Penambahan kecepatan berdasarkan kelipatan 10 score
  intervalTime -= speedMultiplier * 100; // Setiap kelipatan 10 score, tambahkan kecepatan sebesar 100ms

  intervalId = setInterval(createBalloon, intervalTime); // Mengatur interval penampilan balon
  startButton.disabled = true;
  pauseButton.disabled = false;
  stopButton.disabled = false;
  score = 0; // Reset nilai poin
  scoreDisplay.textContent = "Score: 0"; // Reset tampilan poin
  lives = 100; // Reset nyawa saat memulai permainan
  consecutiveMissedBalloons = 0;
  lifeBarFill.style.width = "100%";
  lifeBarFill.style.backgroundColor = "#4CAF50";

  updateLifeBar();
}

// Fungsi untuk menghentikan game dan mengembalikan keadaan awal
function stopGame() {
  clearInterval(intervalId);
  gameContainer.innerHTML = ""; // Hapus semua balon yang ada
  startButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;
  isPaused = false; // Reset status pause
  pauseButton.textContent = "Pause"; // Ubah tombol "Resume" menjadi "Pause" lagi
  showGameOverMessage();
}

// Fungsi untuk menghentikan sementara game (pause)
function pauseGame() {
  if (isPaused) {
    intervalId = setInterval(createBalloon, 1000); // Lanjutkan pembuatan balon
    pauseButton.textContent = "Pause";
  } else {
    clearInterval(intervalId); // Hentikan pembuatan balon sementara
    pauseButton.textContent = "Resume";
  }
  isPaused = !isPaused;
}

// Fungsi untuk memulai game ketika tombol "Start Game" diklik
function onButtonClick() {
  startButton.disabled = true;
  pauseButton.disabled = false;
  stopButton.disabled = false;
  startTime = Math.floor(Date.now() / 1000); // Waktu mulai permainan
  countdown(3); // Memulai hitungan mundur sebelum game dimulai
  const gameOverMessage = document.getElementById("game-over-message");
  gameOverMessage.style.display = "none";
}

// Tambahkan event listener untuk tombol "Start Game"
startButton.addEventListener("click", onButtonClick);

// Tambahkan event listener untuk tombol "Pause"
pauseButton.addEventListener("click", pauseGame);

// Tambahkan event listener untuk tombol "Stop Game"
stopButton.addEventListener("click", stopGame);

// Memulai game ketika halaman dimuat
window.onload = () => {
  startButton.disabled = false; // Aktifkan tombol "Start Game" setelah halaman dimuat
};
