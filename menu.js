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
    // window.location.href = 'game.html';
    alert(mode + " горим сонгогдлоо. Тоглоомын хуудас одоогоор бэлэн болоогүй байна.");
}

// Systemees garah (Log Out)
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});