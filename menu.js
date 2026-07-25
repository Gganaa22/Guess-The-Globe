const SUPABASE_URL = "https://mgkknnhbsmkhlhahudzq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ijQMQQfZB3jAlKq4KNQu5g_lpiwhHsf";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const nicknameSection = document.getElementById('nickname-section');
const mainMenu = document.getElementById('main-menu');
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.getElementById('nickname-input');
const userDisplayName = document.getElementById('user-display-name');
const nickError = document.getElementById('nick-error');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;

// Huudas achaalagdahad hereglegch nevtersen esehiig shalgana 
window.addEventListener('load', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // Nevtreegui baival index.html ruu butsaana
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = session.user;
    checkNickname();

    await loadLeaderboard();
});

// hereglegchid nickname baigaa esehiig profiles husnegtees shalgana
async function checkNickname() {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('nickname')
        .eq('id', currentUser.id)
        .single();

    if (error || !data) {
        // Herev nickname baihgui bol ner asuuh hesgiig haruulna
        nicknameSection.style.display = 'block';
        mainMenu.style.display = 'none';
    } else {
        //Nickname baival shuud undsen tsesiig haruulna
        userDisplayName.innerText = data.nickname;
        nicknameSection.style.display = 'none';
        mainMenu.style.display = 'block';
    }
}

// Shine nickname hadgalah
nicknameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    nickError.innerText = "";
    const nickname = nicknameInput.value.trim();

    if (nickname.length === 0 || nickname.length > 15) {
        nickError.innerText = "Нэр 1-15 тэмдэгтийн хооронд байх ёстой.";
        return;
    }

    //Supabase iin profiles husnegted hadgalna
    const { error } = await supabaseClient
        .from('profiles')
        .insert([{ id: currentUser.id, nickname: nickname }]);

    if (error) {
        if (error.code === '23505') { // Unique constraint violation aldaanii code
            nickError.innerText = "Энэ нэр ашиглагдсан байна. Өөр нэр сонгоно уу.";
        } else {
            nickError.innerText = "Алдаа гарлаа: " + error.message;
        }
    } else {
        //Amjilttai hadgalagdval tses ruu shiljine 
        checkNickname();
    }
});

// Togloom ehluuleh funkts 
function startGame(mode) {
    localStorage.setItem('gameMode', mode);
    window.location.href = 'game.html';
   
}

// Systemees garah (Log Out)
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
});

// Supabase-ees top 5 toglogchiin onoog tataj haruulah funkts
async function loadLeaderboard() {
    const listContainer = document.getElementById('leaderboard-list');
    
    // scores husnegtees onoogoor ni jagsaaj, profiles husnegtiin nickname- iig hamt tatna
    const { data, error } = await supabaseClient
        .from('scores')
        .select(`
            score,
            mode,
            profiles:user_id ( nickname )
        `)
        .order('score', { ascending: false })
        .limit(5);

    if (error) {
        console.log("Жагсаалт татахад алдаа гарлаа:", error.message);
        listContainer.innerHTML = '<div class="loading-text">Жагсаалтыг ачаалахад алдаа гарлаа.</div>';
        return;
    }

    if (!data || data.length === 0) {
        listContainer.innerHTML = '<div class="loading-text">Одоогоор тоглосон тоглогч байхгүй байна.</div>';
        return;
    }

    listContainer.innerHTML = ''; // Loading textiig arilgah 

    // Gorimuudiig mongol hel ruu horvuuleh jijig obiekt 
    const modeNames = { 'flag': 'Туг', 'capital': 'Нийслэл', 'map': 'Газар нутаг' };

    data.forEach((row, index) => {
        
        const nickname = row.profiles ? row.profiles.nickname : 'Тоглогч';
        const mode = modeNames[row.mode] || row.mode;

        const item = document.createElement('div');
        item.classList.add('leaderboard-item');
        item.innerHTML = `
            <span>${index + 1}. <strong>${nickname}</strong> (${mode})</span>
            <span><strong>${row.score}</strong> орон</span>
        `;
        listContainer.appendChild(item);
    });
}