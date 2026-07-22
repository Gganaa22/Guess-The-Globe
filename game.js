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

// Huudas achaalagdahad togloomiig ehluulne
window.addEventListener('load', async () => {
    // 1.Hereglegch nevtersen esehiig shalgana
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

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
}