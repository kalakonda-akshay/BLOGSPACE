/* Blog App – front-end only. localStorage stands in for a backend until Module 2. */

const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const SEED_POSTS = [
  { id: 1, title: "Getting Started with HTML", category: "HTML", author: "Asha",
    body: "HTML gives your page structure. Learn headings, paragraphs, links, images and semantic tags like header, main and footer.",
    date: "2026-10-01" },
  { id: 2, title: "CSS Flexbox in 10 Minutes", category: "CSS", author: "Ravi",
    body: "Flexbox makes one-dimensional layouts easy. Master justify-content, align-items and gap to build navbars and card rows.",
    date: "2026-10-05" },
  { id: 3, title: "JavaScript DOM Basics", category: "JavaScript", author: "Meera",
    body: "Use querySelector, addEventListener and classList to make pages interactive without any framework.",
    date: "2026-10-09" }
];

function getPosts() {
  const posts = store.get("posts", null);
  if (posts) return posts;
  store.set("posts", SEED_POSTS);
  return SEED_POSTS;
}
const getUsers = () => store.get("users", []);
const getSession = () => store.get("session", null);

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------- Navbar ---------- */
function renderNav() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;
  const page = location.pathname.split("/").pop() || "index.html";
  const user = getSession();
  const link = (href, label) =>
    `<li><a href="${href}" class="${page === href ? "active" : ""}">${label}</a></li>`;

  nav.innerHTML = link("index.html", "Home") + (user
    ? link("dashboard.html", "Dashboard") + link("create-blog.html", "Create Blog") +
      `<li><a href="#" id="logout">Logout (${escapeHTML(user.name.split(" ")[0])})</a></li>`
    : link("login.html", "Login") +
      `<li><a class="btn" href="register.html">Register</a></li>`);

  const out = document.getElementById("logout");
  if (out) out.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("session");
    location.href = "index.html";
  });

  const toggle = document.getElementById("nav-toggle");
  toggle.onclick = () => nav.classList.toggle("open");
}

/* ---------- Route guard ---------- */
function requireLogin() {
  if (!getSession()) location.href = "login.html";
}

/* ---------- Alerts / field errors ---------- */
function showAlert(el, msg, type) {
  el.textContent = msg;
  el.className = "alert show " + type;
}
function setError(input, msg) {
  input.parentElement.querySelector(".error").textContent = msg;
}

/* ---------- Home ---------- */
function initHome() {
  const grid = document.getElementById("posts");
  const posts = [...getPosts()].sort((a, b) => b.date.localeCompare(a.date));
  grid.innerHTML = posts.map(p => `
    <article class="card">
      <span class="tag">${escapeHTML(p.category)}</span>
      <h3>${escapeHTML(p.title)}</h3>
      <p>${escapeHTML(p.body.length > 120 ? p.body.slice(0, 120) + "…" : p.body)}</p>
      <div class="meta">By ${escapeHTML(p.author)} · ${p.date}</div>
    </article>`).join("");
}

/* ---------- Register ---------- */
function initRegister() {
  const form = document.getElementById("register-form");
  const alertBox = document.getElementById("alert");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name, email = form.email, pw = form.password, pw2 = form.confirm;
    [name, email, pw, pw2].forEach(i => setError(i, ""));
    let ok = true;
    if (name.value.trim().length < 2) { setError(name, "Enter your full name."); ok = false; }
    if (!/^\S+@\S+\.\S+$/.test(email.value)) { setError(email, "Enter a valid email."); ok = false; }
    if (pw.value.length < 6) { setError(pw, "Use at least 6 characters."); ok = false; }
    if (pw.value !== pw2.value) { setError(pw2, "Passwords do not match."); ok = false; }
    if (!ok) return;

    const users = getUsers();
    if (users.some(u => u.email === email.value.toLowerCase())) {
      showAlert(alertBox, "That email is already registered.", "err");
      return;
    }
    users.push({ name: name.value.trim(), email: email.value.toLowerCase(), password: pw.value });
    store.set("users", users);
    showAlert(alertBox, "Account created! Redirecting to login…", "ok");
    setTimeout(() => (location.href = "login.html"), 900);
  });
}

/* ---------- Login ---------- */
function initLogin() {
  const form = document.getElementById("login-form");
  const alertBox = document.getElementById("alert");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = form.email, pw = form.password;
    [email, pw].forEach(i => setError(i, ""));
    if (!email.value) return setError(email, "Email is required.");
    if (!pw.value) return setError(pw, "Password is required.");

    const user = getUsers().find(u => u.email === email.value.toLowerCase() && u.password === pw.value);
    if (!user) return showAlert(alertBox, "Invalid email or password.", "err");
    store.set("session", { name: user.name, email: user.email });
    location.href = "dashboard.html";
  });
}

/* ---------- Dashboard ---------- */
function initDashboard() {
  requireLogin();
  const user = getSession();
  document.getElementById("welcome").textContent = `Welcome, ${user.name}`;
  const body = document.getElementById("my-posts");

  function render() {
    const mine = getPosts().filter(p => p.email === user.email);
    document.getElementById("stat-posts").textContent = mine.length;
    document.getElementById("stat-cats").textContent = new Set(mine.map(p => p.category)).size;
    document.getElementById("stat-words").textContent =
      mine.reduce((n, p) => n + p.body.split(/\s+/).filter(Boolean).length, 0);

    body.innerHTML = mine.length ? mine.map(p => `
      <tr>
        <td>${escapeHTML(p.title)}</td>
        <td>${escapeHTML(p.category)}</td>
        <td>${p.date}</td>
        <td><button class="btn btn-danger" data-id="${p.id}">Delete</button></td>
      </tr>`).join("")
      : `<tr><td colspan="4" class="empty">You haven't written anything yet. <a href="create-blog.html">Create your first blog</a>.</td></tr>`;
  }

  body.addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id || !confirm("Delete this blog post?")) return;
    store.set("posts", getPosts().filter(p => String(p.id) !== id));
    render();
  });
  render();
}

/* ---------- Create Blog ---------- */
function initCreate() {
  requireLogin();
  const user = getSession();
  const form = document.getElementById("blog-form");
  const alertBox = document.getElementById("alert");
  const counter = document.getElementById("count");
  form.body.addEventListener("input", () => (counter.textContent = form.body.value.length));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const { title, category, body } = form;
    [title, category, body].forEach(i => setError(i, ""));
    let ok = true;
    if (title.value.trim().length < 5) { setError(title, "Title needs at least 5 characters."); ok = false; }
    if (!category.value) { setError(category, "Pick a category."); ok = false; }
    if (body.value.trim().length < 30) { setError(body, "Write at least 30 characters."); ok = false; }
    if (!ok) return;

    const posts = getPosts();
    posts.push({
      id: Date.now(),
      title: title.value.trim(),
      category: category.value,
      body: body.value.trim(),
      author: user.name,
      email: user.email,
      date: new Date().toISOString().slice(0, 10)
    });
    store.set("posts", posts);
    showAlert(alertBox, "Published! Taking you to your dashboard…", "ok");
    setTimeout(() => (location.href = "dashboard.html"), 800);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  const init = { home: initHome, register: initRegister, login: initLogin,
                 dashboard: initDashboard, create: initCreate }[document.body.dataset.page];
  if (init) init();
});
