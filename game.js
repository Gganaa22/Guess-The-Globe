// Supabase holbolt
const SUPABASE_URL = "https://mgkknnhbsmkhlhahudzq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ijQMQQfZB3jAlKq4KNQu5g_lpiwhHsf";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// HTML elementuudiig barij avah
const questionText = document.getElementById('question-text');
const questionImageBox = document.getElementById('question-image-box');
const questionImage = document.getElementById('question-image');
const optionsContainer = document.getElementById('options-container');
const gameScoreEl = document.getElementById('game-score');
const gameTimerEl = document.getElementById('game-timer');
const gameLivesEl = document.getElementById('game-lives');

//Togloomiin tolov hadgalah huvisagchid 
let countriesData = []; // Supabase-ees ireh buh ulsuud 
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let timer = 15;
let timerInterval = null;
let currentGameMode = localStorage.getItem('gameMode') || 'flag'; // Default ni tug taah
let currentUser = null;

// Huudas achaalagdahad togloomiig ehluulne
window.addEventListener('load', async () => {
    // 1.Hereglegch nevtersen esehiig shalgana
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = session.user; //Nevtersen hereglegchiin medeelliig hadgalj avna
    // 2. Supabase-ees ulsuudiin medeelliig tatah
    await fetchCountries();
});

//Ulsuudiin datag Supabase-ees tatah funkts 
async function fetchCountries() {
    questionText.innerText = "Асуултуудыг бэлдэж байна...";
    
    const { data, error } = await supabaseClient
        .from('countries')
        .select('*');

    if (error || !data || data.length < 4) {
        questionText.innerText = "Өгөгдлийн сангаас дата татахад алдаа гарлаа.";
        return;
    }

    // Ulsuudiig sanamsargui baidlaar holino
    countriesData = data.sort(() => Math.random() - 0.5);

    // Ehnii asuultiig haruulna
    loadQuestion();
}

// Togloom duush funkts
async function endGame() {
    clearInterval(timerInterval);
    optionsContainer.innerHTML = 'Ачаалж байна...';
    questionImageBox.style.display = 'none';
    questionText.innerText = `Тоглоом дууслаа! Оноог хадгалж байна...`;

    //Supabase-iin scores husnegted onoog burtgene 
    const { error } = await supabaseClient
        .from('scores')
        .insert([
            { 
                user_id: currentUser.id, 
                score: score, 
                mode: currentGameMode 
            }
        ]);

    if (error) {
        console.log("Оноо хадгалахад алдаа гарлаа:", error.message);
        questionText.innerText = `Тоглоом дууслаа! Нийт оноо: ${score} (Оноо хадгалагдсангүй)`;
    } else {
        questionText.innerText = `Тоглоом дууслаа! Нийт оноо: ${score} (Амжилттай хадгалагдлаа)`;
    }

    optionsContainer.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.classList.add('btn-primary');
    backBtn.innerText = "Үндсэн цэс рүү буцах";
    backBtn.addEventListener('click', () => window.location.href = 'menu.html');
    optionsContainer.appendChild(backBtn);
}

// Asuult haruulh funkts
function loadQuestion() {
    //Togloom duusah nohtsol 3 ami duusah esvel 40 asuult duusah 
    if (lives <= 0 || currentQuestionIndex >= Math.min(countriesData.length, 40)) {
        endGame();
        return;
    }

    // Odoogiin zov hariult boloh uls
    const correctCountry = countriesData[currentQuestionIndex];
    
    //Buruu 3 songoltiig sanamsarguigeer songoh 
    let wrongOptions = countriesData.filter(c => c.id !== correctCountry.id);
    wrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    
    //zov bolon buruu hariultiig niiluuleed dahin holino 
    let options = [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);

    // Delgetsiig tseverleh
    optionsContainer.innerHTML = '';
    questionImageBox.style.display = 'none';

    // Gorimoos hamaarch asuultiig delgetsend harulna
    if (currentGameMode === 'flag') {
        questionText.innerText = "Энэ ямар улсын туг вэ?";
        questionImage.src = correctCountry.flag_url || correctCountry.flag; // Baganiin nernees hamaarna
        questionImageBox.style.display = 'block';
    } else if (currentGameMode === 'capital') {
        questionText.innerText = `${correctCountry.name} улсын нийслэл аль нь вэ?`;
    } else if (currentGameMode === 'map') {
        questionText.innerText = "Энэ ямар улсын газар нутгийн дүрс вэ?";
        questionImage.src = correctCountry.map_url || correctCountry.map;
        questionImageBox.style.display = 'block';
    }

    // 4 Songoltiin tovchluuruudiig uusgej HTML-d nemne
    options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('btn-menu');
        
        // Gorimoos hamaarch tovchluur deerh textiig haruulna
        if (currentGameMode === 'capital') {
            button.innerText = option.capital;
        } else {
            button.innerText = option.name;
        }

        // Darj hariulh uyiin logic
        button.addEventListener('click', () => handleAnswer(button, option.id === correctCountry.id));
        optionsContainer.appendChild(button);
    });

    // Timer iig ehluulh
    startTimer();
}


// Hariult shalgah funkts
function handleAnswer(selectedButton, isCorrect) {
    clearInterval(timerInterval); // timer iig zogsoono
    
    //Buh tovchluuriig dahin darah bolomjgui bolgono 
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        selectedButton.classList.add('btn-correct');
        score += 10;
        gameScoreEl.innerText = score;
    } else {
        selectedButton.classList.add('btn-wrong');
        lives--;
        updateLivesDisplay();
    }

    // 1.5 secondiin daraa daraagiin asuult ruu shinjine
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1500);
}

// Aminii duns shinechleh funkts
function updateLivesDisplay() {
    let hearts = '';
    for (let i = 0; i < 3; i++) {
        hearts += i < lives ? '❤️' : '🖤';
    }
    gameLivesEl.innerText = hearts;
}

// 15 secondiin timer ajilluulah funkts
function startTimer() {
    clearInterval(timerInterval);
    timer = 15;
    gameTimerEl.innerText = timer;

    timerInterval = setInterval(() => {
        timer--;
        gameTimerEl.innerText = timer;

        if (timer <= 0) {
            clearInterval(timerInterval);
            lives--;
            updateLivesDisplay();
            
            // Hugatsaa duusahad daraagiin asuult ruu shiljine
            questionText.innerText = "Хугацаа дууслаа!";
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 1500);
        }
    }, 1000);
}

