// supabase holbolt
const SUPABASE_URL = "https://mgkknnhbsmkhlhahudzq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ijQMQQfZB3jAlKq4KNQu5g_lpiwhHsf";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// HTML elementuudiig barij avah
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleAuth = document.getElementById('toggle-auth');
const errorMsg = document.getElementById('error-msg');

let isLoginMode = true; // Nevtreh gorim idevhtei baina

// Nevtreh, burtguuleh gorim shiljuuleh
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        formTitle.innerText = "Нэвтрэх";
        submitBtn.innerText = "Нэвтрэх";
        toggleAuth.innerText = "Бүртгүүлэх";
    } else {
        formTitle.innerText = "Бүртгүүлэх";
        submitBtn.innerText = "Бүртгүүлэх";
        toggleAuth.innerText = "Нэвтрэх";
    }
    errorMsg.innerText = "";
});

//Form ilgeeh uyd ajillna
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = "";
    
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isLoginMode) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorMsg.innerText = "Алдаа: " + error.message;
        } else {
            alert("Амжилттай нэвтэрлээ!");
            // Daraa ni menu.html ruu shiljuulne
            window.location.href = "menu.html";
        }
    } else {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            errorMsg.innerText = "Алдаа: " + error.message;
        } else {
            alert("Бүртгэл амжилттай!");
        }
    }
});