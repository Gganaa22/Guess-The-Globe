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
}

