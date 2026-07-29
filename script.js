/**
 * CHARUSAT Student Portal - Core Javascript Engine
 * Handles Authentication, Access Control Guards, Validation, Dynamic Results, Fees,
 * Interactive Student Corner Modals & Code Sandbox Runner.
 */

// 1. Initial Users Database & Session State Management
function getUsersDB() {
    const defaultUser = {
        name: "Dhruvrajsinh Dodiya",
        username: "25CS009",
        email: "dhruvrajsinhdodiya4208@gmail.com",
        password: "Password123!"
    };
    const stored = localStorage.getItem('portal_users');
    if (!stored) {
        const initialDB = [defaultUser];
        localStorage.setItem('portal_users', JSON.stringify(initialDB));
        return initialDB;
    }
    return JSON.parse(stored);
}

function saveUsersDB(users) {
    localStorage.setItem('portal_users', JSON.stringify(users));
}

function getCurrentUser() {
    const userStr = localStorage.getItem('portal_current_user');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('portal_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('portal_current_user');
    }
}

// 2. Immediate Route Access Protection Guard
(function accessGuard() {
    const path = window.location.pathname;
    const page = path.split('/').pop().toLowerCase() || 'home.html';

    const publicPages = ['home.html', 'login.html', 'signup.html', ''];
    const isProtected = !publicPages.includes(page);
    const currentUser = getCurrentUser();

    if (isProtected && !currentUser) {
        sessionStorage.setItem('auth_redirect_msg', 'Access denied. Please log in to enter the student portal.');
        window.location.href = 'login.html';
    }
})();

// 3. Immediate Theme Check
(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
})();

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Users DB is initialized
    getUsersDB();

    if (document.documentElement.classList.contains('light-theme')) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Check for pending redirect notice
    const redirectMsg = sessionStorage.getItem('auth_redirect_msg');
    if (redirectMsg) {
        sessionStorage.removeItem('auth_redirect_msg');
        setTimeout(() => showToast(redirectMsg, 'error'), 200);
    }

    injectCommonElements();
    setupEventListeners();
    updateThemeToggleIcon();
    syncUserInterfaceData();
});

// 4. Global Glassmorphic Toast Notification Helper
function showToast(message, type = 'success', customTitle = null) {
    let container = document.querySelector('.glass-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'glass-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `glass-toast glass-toast-${type}`;

    let iconSVG = '';
    let titleText = customTitle;

    if (type === 'success') {
        if (!titleText) titleText = 'Success';
        iconSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
        if (!titleText) titleText = 'Attention Required';
        iconSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        if (!titleText) titleText = 'Information';
        iconSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="glass-toast-icon">${iconSVG}</div>
        <div class="glass-toast-content">
            <div class="glass-toast-title">${titleText}</div>
            <div class="glass-toast-message">${message}</div>
        </div>
        <button class="glass-toast-close" aria-label="Close notification">&times;</button>
        <div class="glass-toast-progress"></div>
    `;

    container.appendChild(toast);

    // Trigger Entrance Animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Smooth Progress Bar Animation
    const progressBar = toast.querySelector('.glass-toast-progress');
    if (progressBar) {
        progressBar.style.transition = 'transform 3.5s linear';
        progressBar.style.transform = 'scaleX(1)';
        setTimeout(() => {
            progressBar.style.transform = 'scaleX(0)';
        }, 50);
    }

    // Dismiss Logic
    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.remove('show');
        toast.style.transform = 'translateX(100px) scale(0.85)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 400);
    };

    const closeBtn = toast.querySelector('.glass-toast-close');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    setTimeout(dismiss, 3600);
}

// 5. Theme Toggle Functionality
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    if (isLight) {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeToggleIcon();
    showToast(`${isLight ? 'Light' : 'Dark'} theme activated!`);
}

function updateThemeToggleIcon() {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    const isLight = document.body.classList.contains('light-theme');
    btns.forEach(btn => {
        btn.innerHTML = isLight ? '🌙' : '☀️';
    });
}

// 6. Sync UI Data for Logged-In User
function syncUserInterfaceData() {
    const currentUser = getCurrentUser();

    // Settings Page sync
    const dispName = document.getElementById('settingDispName');
    const dispUser = document.getElementById('settingDispUser');
    const dispEmail = document.getElementById('settingDispEmail');
    if (currentUser && dispName && dispEmail) {
        dispName.innerText = currentUser.name;
        if (dispUser) dispUser.innerText = currentUser.username;
        dispEmail.innerText = currentUser.email;
    }

    // Profile Page sync
    const profileInitials = document.getElementById('profileInitials');
    const profileName = document.getElementById('profileName');
    const profileStudentId = document.getElementById('profileStudentId');
    const profileEmail = document.getElementById('profileEmail');

    if (currentUser && profileName && profileEmail) {
        profileName.innerText = currentUser.name;
        if (profileStudentId) profileStudentId.innerText = currentUser.username;
        profileEmail.innerText = currentUser.email;

        if (profileInitials) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            profileInitials.innerText = initials || 'SH';
        }
    }

    // Dashboard Header sync
    const dashWelcome = document.querySelector('.page-header p');
    const pageTitle = document.title.toLowerCase();
    if (currentUser && dashWelcome && pageTitle.includes('dashboard')) {
        dashWelcome.innerText = `Welcome back, ${currentUser.name} (Student ID: ${currentUser.username} | Institute: CSPIT)`;
    }
}

// 7. Inject Dynamic Navbar & Footer
function injectCommonElements() {
    const path = window.location.pathname;
    const page = path.split('/').pop().toLowerCase() || 'home.html';
    const currentUser = getCurrentUser();

    const isAuthPage = page === 'login.html' || page === 'signup.html';
    const isHomePage = page === 'home.html' || page === '';

    // A. Inject Theme Toggle on auth pages
    if (isAuthPage && !document.querySelector('.auth-theme-box')) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'auth-theme-box';
        actionsDiv.style.position = 'absolute';
        actionsDiv.style.top = '20px';
        actionsDiv.style.right = '20px';
        actionsDiv.innerHTML = `<button class="theme-toggle-btn" aria-label="Toggle Theme">☀️</button>`;
        document.body.appendChild(actionsDiv);
        actionsDiv.querySelector('.theme-toggle-btn').addEventListener('click', toggleTheme);
    }

    // B. Inject Header/Navbar on pages
    if (!isAuthPage && !document.querySelector('.navbar-container')) {
        const header = document.createElement('header');
        header.className = 'navbar-container';

        let navLinksHTML = '';
        if (!currentUser) {
            navLinksHTML = `
                <li><a href="home.html" class="${isHomePage ? 'active' : ''}">Home</a></li>
                <li><a href="login.html" class="${page === 'login.html' ? 'active' : ''}">Login</a></li>
                <li><a href="signup.html" class="${page === 'signup.html' ? 'active' : ''}">Sign Up</a></li>
            `;
        } else {
            navLinksHTML = `
                <li><a href="home.html" class="${page === 'home.html' ? 'active' : ''}">Home</a></li>
                <li><a href="dashboard.html" class="${page === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="profile.html" class="${page === 'profile.html' ? 'active' : ''}">Profile</a></li>
                <li><a href="attendance.html" class="${page === 'attendance.html' ? 'active' : ''}">Attendance</a></li>
                <li><a href="course.html" class="${page === 'course.html' ? 'active' : ''}">Courses</a></li>
                <li><a href="schedule.html" class="${page === 'schedule.html' ? 'active' : ''}">Schedule</a></li>
                <li><a href="grades.html" class="${page === 'grades.html' ? 'active' : ''}">Grades</a></li>
                <li><a href="fees.html" class="${page === 'fees.html' ? 'active' : ''}">Fees</a></li>
                <li><a href="announcements.html" class="${page === 'announcements.html' ? 'active' : ''}">Announcements</a></li>
                <li><a href="studentcorner.html" class="${page === 'studentcorner.html' ? 'active' : ''}">Corner</a></li>
                <li><a href="settings.html" class="${page === 'settings.html' ? 'active' : ''}">Settings</a></li>
            `;
        }

        const userBadgeHTML = currentUser ? `
            <div class="user-nav-badge" title="Logged in as ${currentUser.name}">
                <span>👤 ${currentUser.username}</span>
            </div>
            <button id="navLogoutBtn" class="logout-btn" title="Log Out">🚪</button>
        ` : '';

        header.innerHTML = `
            <div class="navbar">
                <a href="home.html" class="nav-brand">
                    <img src="charusat-logo.jpg" alt="CHARUSAT Logo" class="nav-logo-img">
                    <span>CHARUSAT Portal</span>
                </a>
                <ul class="nav-links">
                    ${navLinksHTML}
                </ul>
                <div class="nav-actions">
                    <button class="theme-toggle-btn" aria-label="Toggle Theme">☀️</button>
                    ${userBadgeHTML}
                </div>
            </div>
        `;

        document.body.insertBefore(header, document.body.firstChild);
        header.querySelector('.theme-toggle-btn').addEventListener('click', toggleTheme);

        const logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                setCurrentUser(null);
                showToast('Successfully logged out.');
                setTimeout(() => window.location.href = 'login.html', 400);
            });
        }
    }

    // C. Inject Footer
    if (!document.querySelector('footer')) {
        const footer = document.createElement('footer');
        footer.innerHTML = `
            <p><img src="charusat-logo.jpg" alt="CHARUSAT Logo" class="footer-logo-img"> &copy; 2026 Charotar University of Science and Technology (CHARUSAT). All Rights Reserved.</p>
            <p>Accredited NAAC A+ Grade | Changa, Gujarat, India</p>
        `;
        document.body.appendChild(footer);
    }

    // D. Apply Entry Animations
    const mainBlock = document.querySelector('.main-content') || document.querySelector('.auth-card') || document.querySelector('.hero');
    if (mainBlock) {
        mainBlock.classList.add('page-transition');
    }
}

// 8. Password Strength Evaluator Helper
function evaluatePasswordStrength(password) {
    if (!password) return { level: 'empty', score: 0, msg: 'Password required' };

    let score = 0;
    const len = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (len >= 8) score += 2;
    else if (len >= 6) score += 1;

    if (hasLower && hasUpper) score += 1;
    if (hasDigit) score += 1;
    if (hasSpecial) score += 1;

    if (len < 8 || score < 3) {
        return {
            level: 'weak',
            score,
            msg: 'Weak: Min 8 characters with uppercase, lowercase, number & symbol required.'
        };
    } else if (score === 3 || score === 4) {
        return {
            level: 'medium',
            score,
            msg: 'Medium: Valid password strength.'
        };
    } else {
        return {
            level: 'strong',
            score,
            msg: 'Strong: Excellent password security!'
        };
    }
}

// 9. Setup Event Listeners & Interactive Handlers
function setupEventListeners() {
    // Smooth Page Exit Transition on Nav Links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('#')) {
                e.preventDefault();
                const mainBlock = document.querySelector('.main-content') || document.querySelector('.auth-card') || document.querySelector('.hero');
                if (mainBlock) {
                    mainBlock.classList.add('page-exit');
                } else {
                    document.body.classList.add('page-exit');
                }

                setTimeout(() => {
                    window.location.href = href;
                }, 180);
            }
        }
    });

    // --- A. SIGNUP VALIDATION & SUBMISSION ---
    const signupForm = document.getElementById('signupForm');
    const signupPwdInput = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (signupPwdInput && strengthBar && strengthText) {
        signupPwdInput.addEventListener('input', () => {
            const val = signupPwdInput.value;
            const evalRes = evaluatePasswordStrength(val);

            strengthBar.className = 'strength-bar-fill';
            if (val.length === 0) {
                strengthBar.style.width = '0%';
                strengthText.innerText = 'Password requirements: Min 8 chars, uppercase, lowercase & numbers';
                strengthText.style.color = 'var(--text-secondary)';
            } else if (evalRes.level === 'weak') {
                strengthBar.classList.add('strength-weak');
                strengthText.innerText = evalRes.msg;
                strengthText.style.color = 'var(--danger)';
            } else if (evalRes.level === 'medium') {
                strengthBar.classList.add('strength-medium');
                strengthText.innerText = evalRes.msg;
                strengthText.style.color = 'var(--warning)';
            } else {
                strengthBar.classList.add('strength-strong');
                strengthText.innerText = evalRes.msg;
                strengthText.style.color = 'var(--success)';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const username = document.getElementById('signupUsername').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = signupPwdInput ? signupPwdInput.value : '';

            // Gmail validation (must end with @gmail.com)
            const isGmail = email.toLowerCase().endsWith('@gmail.com') && /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
            if (!isGmail) {
                showToast('Please enter a valid Gmail address (must end with @gmail.com)', 'error');
                return;
            }

            // Username validation
            if (!username || username.length < 3) {
                showToast('Username must be at least 3 characters long', 'error');
                return;
            }

            // Password strength check (Must be Medium or Strong)
            const pwdEval = evaluatePasswordStrength(password);
            if (pwdEval.level === 'weak') {
                showToast('Password is too weak. Must be medium or strong (min 8 chars, mixed case, numbers/symbols).', 'error');
                return;
            }

            const users = getUsersDB();
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());

            if (existingUser) {
                showToast('An account with this Gmail or Username already exists.', 'error');
                return;
            }

            const newUser = { name, username, email, password };
            users.push(newUser);
            saveUsersDB(users);

            showToast('Account created successfully! Redirecting to sign in...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);
        });
    }

    // --- B. LOGIN SUBMISSION & AUTHENTICATION ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!identifier || !password) {
                showToast('Please enter your Gmail/username and password.', 'error');
                return;
            }

            const users = getUsersDB();
            const foundUser = users.find(u =>
                (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) &&
                u.password === password
            );

            if (foundUser) {
                setCurrentUser(foundUser);
                showToast(`Welcome back, ${foundUser.name}! Logging in...`);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                showToast('Invalid Gmail/username or password. Please try again.', 'error');
            }
        });
    }

    // Forgot password demo action
    const forgotPwdLink = document.getElementById('forgotPasswordLink');
    if (forgotPwdLink) {
        forgotPwdLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Password recovery instructions sent to your registered Gmail address.');
        });
    }

    // --- C. PASSWORD UPDATE IN SETTINGS ---
    const btnUpdatePassword = document.getElementById('btnUpdatePassword');
    if (btnUpdatePassword) {
        btnUpdatePassword.addEventListener('click', (e) => {
            e.preventDefault();
            const currPwd = document.getElementById('curr-pwd').value;
            const newPwd = document.getElementById('new-pwd').value;
            const confirmPwd = document.getElementById('confirm-pwd').value;

            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Please log in first.', 'error');
                return;
            }

            if (!currPwd || !newPwd || !confirmPwd) {
                showToast('Please fill out all password fields.', 'error');
                return;
            }

            if (currPwd !== currentUser.password) {
                showToast('Current password does not match our records.', 'error');
                return;
            }

            if (newPwd !== confirmPwd) {
                showToast('New password and Confirm password do not match.', 'error');
                return;
            }

            const evalRes = evaluatePasswordStrength(newPwd);
            if (evalRes.level === 'weak') {
                showToast('New password must be Medium to Strong level (min 8 chars, uppercase, lowercase & numbers).', 'error');
                return;
            }

            // Update password in DB and current session
            const users = getUsersDB();
            const userIndex = users.findIndex(u => u.username === currentUser.username || u.email === currentUser.email);

            if (userIndex !== -1) {
                users[userIndex].password = newPwd;
                saveUsersDB(users);

                currentUser.password = newPwd;
                setCurrentUser(currentUser);

                showToast('Password updated successfully! Next login requires your new password.');
                document.getElementById('curr-pwd').value = '';
                document.getElementById('new-pwd').value = '';
                document.getElementById('confirm-pwd').value = '';
            } else {
                showToast('User record error. Please re-login.', 'error');
            }
        });
    }

    // Edit Profile Info Button
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', (e) => {
            if (editProfileBtn.tagName === 'BUTTON') {
                e.preventDefault();
                showToast('Profile editing unlocked in Portal Settings!');
                setTimeout(() => window.location.href = 'settings.html', 500);
            }
        });
    }

    // --- D. EXAMINATION RESULTS SEARCH (SEM 1 vs SEM 2 DIFFERENTIATION) ---
    const resultSearchBtn = document.getElementById('btnSearchResult');
    if (resultSearchBtn) {
        const renderResults = () => {
            const semSelect = document.getElementById('ddlSem');
            const chosenSem = semSelect ? semSelect.value : '1';
            const enrollmentInput = document.getElementById('txtEnrNo');
            const currentUser = getCurrentUser();
            const studentName = currentUser ? currentUser.name : 'Dhruvrajsinh Dodiya';
            const studentId = enrollmentInput && enrollmentInput.value.trim() ? enrollmentInput.value.trim() : (currentUser ? currentUser.username : '25CS009');

            const resultDetailsPanel = document.getElementById('resultDetailsPanel');
            if (!resultDetailsPanel) return;

            // Semester 1 vs Semester 2 Datasets
            const semData = {
                '1': {
                    title: `Scorecard: ${studentName} (Semester 1)`,
                    info: `<strong>Enrollment Number:</strong> ${studentId} | <strong>Institute:</strong> CSPIT | <strong>Program:</strong> B.Tech CSE (Sem 1)`,
                    sgpa: '8.75',
                    cgpa: '8.75',
                    credits: '18 Credits',
                    percentage: '87.0%',
                    subjects: [
                        { name: 'OOP in C++', score: '89', grade: 'A+', status: 'Pass' },
                        { name: 'Digital Electronics', score: '85', grade: 'A', status: 'Pass' },
                        { name: 'Engineering Maths-I', score: '81', grade: 'A', status: 'Pass' },
                        { name: 'Python Programming', score: '92', grade: 'O', status: 'Pass' },
                        { name: 'Communication Skills', score: '88', grade: 'A+', status: 'Pass' }
                    ]
                },
                '2': {
                    title: `Scorecard: ${studentName} (Semester 2)`,
                    info: `<strong>Enrollment Number:</strong> ${studentId} | <strong>Institute:</strong> CSPIT | <strong>Program:</strong> B.Tech CSE (Sem 2)`,
                    sgpa: '8.94',
                    cgpa: '8.85',
                    credits: '20 Credits',
                    percentage: '89.2%',
                    subjects: [
                        { name: 'Data Structures & Algorithms', score: '91', grade: 'O', status: 'Pass' },
                        { name: 'Computer Org & Architecture', score: '88', grade: 'A+', status: 'Pass' },
                        { name: 'Engineering Maths-II', score: '84', grade: 'A', status: 'Pass' },
                        { name: 'Web Tech & Frameworks', score: '94', grade: 'O', status: 'Pass' },
                        { name: 'Environmental Science', score: '87', grade: 'A+', status: 'Pass' }
                    ]
                }
            };

            const data = semData[chosenSem] || semData['1'];

            // Update Panel HTML
            let subjectsRows = '';
            data.subjects.forEach(sub => {
                subjectsRows += `
                    <tr>
                        <td style="font-weight: 600; color: var(--text-primary);">${sub.name}</td>
                        <td>${sub.score}</td>
                        <td style="font-weight: 700; color: var(--accent-color);">${sub.grade}</td>
                        <td><span class="badge badge-success">${sub.status}</span></td>
                    </tr>
                `;
            });

            resultDetailsPanel.innerHTML = `
                <div class="card" style="margin-bottom: 24px; border-left: 5px solid var(--accent-color);">
                    <h2 style="margin-bottom: 4px;">${data.title}</h2>
                    <p>${data.info}</p>
                </div>

                <section class="grid-3">
                    <div class="card">
                        <h2>Semester SGPA</h2>
                        <div class="stat-value">${data.sgpa}</div>
                        <p>Grade Point Average (Sem ${chosenSem})</p>
                    </div>
                    <div class="card">
                        <h2>Cumulative CGPA</h2>
                        <div class="stat-value">${data.cgpa}</div>
                        <p>Cumulative Index</p>
                    </div>
                    <div class="card">
                        <h2>Exam Status</h2>
                        <div class="stat-value" style="color: var(--success);">PASS</div>
                        <p>All credits earned</p>
                    </div>
                </section>

                <div class="grid-3" style="grid-template-columns: 2fr 1fr; margin-top: 8px;">
                    <div class="card">
                        <h2>Subject Wise Grades (Semester ${chosenSem})</h2>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Score (100)</th>
                                        <th>Letter Grade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subjectsRows}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <h2>Grade Ledger Summary</h2>
                        <ul style="list-style: none; padding-top: 12px; display: flex; flex-direction: column; gap: 12px;">
                            <li style="font-size: 14px; color: var(--text-secondary);">Total Subjects: <span style="font-weight: 600; color: var(--text-primary);">${data.subjects.length}</span></li>
                            <li style="font-size: 14px; color: var(--text-secondary);">Passed Credits: <span style="font-weight: 600; color: var(--success);">${data.credits}</span></li>
                            <li style="font-size: 14px; color: var(--text-secondary);">Failed: <span style="font-weight: 600; color: var(--danger);">0</span></li>
                            <li style="font-size: 14px; color: var(--text-secondary);">Percentage: <span style="font-weight: 600; color: var(--text-primary);">${data.percentage}</span></li>
                        </ul>
                    </div>
                </div>
            `;
        };

        const resultSearchForm = document.getElementById('resultSearchForm');
        if (resultSearchForm) {
            resultSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const enrollmentInput = document.getElementById('txtEnrNo');
                const placeholderPanel = document.getElementById('resultPlaceholderPanel');
                const resultPanel = document.getElementById('resultDetailsPanel');

                if (!enrollmentInput.value.trim()) {
                    showToast('Please enter your CHARUSAT Student ID.', 'error');
                    return;
                }

                resultSearchBtn.value = 'Processing...';
                resultSearchBtn.disabled = true;

                setTimeout(() => {
                    resultSearchBtn.value = 'Show Result';
                    resultSearchBtn.disabled = false;

                    if (placeholderPanel) placeholderPanel.style.display = 'none';
                    if (resultPanel) {
                        resultPanel.style.display = 'block';
                        renderResults();
                        resultPanel.scrollIntoView({ behavior: 'smooth' });
                    }
                    showToast(`Loaded Grade Record for Semester ${document.getElementById('ddlSem').value}`);
                }, 600);
            });
        }
    }

    // --- E. FEES PAYMENT SEARCH & PROCESSING ---
    const feesSearchBtn = document.getElementById('btnFeesSearch');
    if (feesSearchBtn) {
        feesSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const enrollmentInput = document.getElementById('txtFeesEnrNo');
            const feesPanel = document.getElementById('feesDetailsPanel');
            const placeholderPanel = document.getElementById('feesPlaceholderPanel');

            if (!enrollmentInput.value.trim()) {
                showToast('Please enter your CHARUSAT Student ID.', 'error');
                return;
            }

            feesSearchBtn.value = 'Searching...';
            feesSearchBtn.disabled = true;

            setTimeout(() => {
                feesSearchBtn.value = 'Search';
                feesSearchBtn.disabled = false;

                if (placeholderPanel) placeholderPanel.style.display = 'none';
                if (feesPanel) {
                    feesPanel.style.display = 'block';
                    feesPanel.scrollIntoView({ behavior: 'smooth' });
                }
                showToast(`Financial ledger retrieved for: ${enrollmentInput.value.trim()}`);
            }, 600);
        });
    }

    const payFeesBtn = document.getElementById('btnPayDues');
    if (payFeesBtn) {
        payFeesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedMode = document.querySelector('input[name="paymentMode"]:checked');
            if (!selectedMode) {
                showToast('Please select a payment gateway mode (UPI, Card, NetBanking).', 'error');
                return;
            }

            payFeesBtn.innerText = 'Processing Gateway...';
            payFeesBtn.disabled = true;

            setTimeout(() => {
                payFeesBtn.innerText = 'Pay Outstanding Dues';
                payFeesBtn.disabled = false;

                const unpaidRow = document.getElementById('unpaidFeesRow');
                const ledgerTable = document.getElementById('ledgerTableBody');

                if (unpaidRow) {
                    unpaidRow.innerHTML = `
                        <td style="font-weight: 600; color: var(--text-primary);">Semester 2 Tuition Fees</td>
                        <td>₹75,000</td>
                        <td><span class="badge badge-success">Cleared</span></td>
                        <td style="color: var(--success); font-weight: 500;">Paid (Today)</td>
                    `;
                    showToast('Payment successful! Semester 2 dues cleared.');

                    if (ledgerTable) {
                        const newTr = document.createElement('tr');
                        newTr.innerHTML = `
                            <td style="font-weight: 700; color: var(--text-primary);">REC10236</td>
                            <td>${selectedMode.value} Transfer</td>
                            <td>₹75,000</td>
                            <td><span class="badge badge-success">Successful</span></td>
                        `;
                        ledgerTable.insertBefore(newTr, ledgerTable.firstChild);
                    }

                    const clearedDuesVal = document.getElementById('clearedDuesVal');
                    const pendingDuesVal = document.getElementById('pendingDuesVal');
                    if (clearedDuesVal) clearedDuesVal.innerText = '₹1,50,000';
                    if (pendingDuesVal) {
                        pendingDuesVal.innerText = '₹0';
                        pendingDuesVal.style.color = 'var(--success)';
                    }
                    localStorage.setItem('feesPaid', 'true');
                } else {
                    showToast('All semester dues are already cleared.');
                }
            }, 1000);
        });
    }

    const downloadReceiptBtn = document.querySelector('.download-receipt-btn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', () => {
            showToast('Downloading fee receipt REC10235.pdf...');
            const link = document.createElement('a');
            link.style.display = 'none';
            const blob = new Blob(['CHARUSAT Fee Receipt - Semester 1 & 2 Paid Dues'], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
            link.download = 'CHARUSAT_Fee_Receipt_REC10235.pdf';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                link.remove();
            }, 100);
        });
    }

    // --- F. STUDENT CORNER MODAL INTERACTIVITY ---
    const modalFiles = document.getElementById('modalFiles');
    const modalAssignments = document.getElementById('modalAssignments');
    const modalSandbox = document.getElementById('modalSandbox');
    const modalInfo = document.getElementById('modalInfo');

    const btnAccessFiles = document.getElementById('btnAccessFiles');
    const btnOpenAssignments = document.getElementById('btnOpenAssignments');
    const btnStartSandbox = document.getElementById('btnStartSandbox');

    const openModal = (modal) => {
        if (modal) modal.classList.add('active');
    };

    const closeModal = (modal) => {
        if (modal) modal.classList.remove('active');
    };

    // Close buttons logic
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    if (btnAccessFiles) {
        btnAccessFiles.addEventListener('click', () => openModal(modalFiles));
    }
    if (btnOpenAssignments) {
        btnOpenAssignments.addEventListener('click', () => openModal(modalAssignments));
    }
    if (btnStartSandbox) {
        btnStartSandbox.addEventListener('click', () => openModal(modalSandbox));
    }

    // Download resource file buttons in modal
    document.querySelectorAll('.download-file-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fileName = btn.getAttribute('data-filename') || 'CHARUSAT_Resource.pdf';
            showToast(`Downloading: ${fileName}`);
            const link = document.createElement('a');
            link.style.display = 'none';
            const blob = new Blob([`CHARUSAT Academic Resource Content for ${fileName}`], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                link.remove();
            }, 100);
        });
    });

    // Submit assignment buttons in modal
    document.querySelectorAll('.submit-assignment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const assignId = btn.getAttribute('data-id');
            const statusSpan = document.getElementById(`status-assign-${assignId}`);

            btn.innerText = 'Uploading...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerText = 'Uploaded';
                btn.className = 'btn btn-secondary';

                if (statusSpan) {
                    statusSpan.className = 'badge badge-success';
                    statusSpan.innerText = 'Submitted';
                }
                showToast('Assignment uploaded successfully to CHARUSAT LMS!');
            }, 800);
        });
    });

    // Code Sandbox Runner logic
    const btnRunSandboxCode = document.getElementById('btnRunSandboxCode');
    const sandboxCodeEditor = document.getElementById('sandboxCodeEditor');
    const sandboxTerminal = document.getElementById('sandboxTerminal');
    const sandboxLang = document.getElementById('sandboxLang');

    if (sandboxLang && sandboxCodeEditor) {
        sandboxLang.addEventListener('change', (e) => {
            const lang = e.target.value;
            if (lang === 'python') {
                sandboxCodeEditor.value = `# CHARUSAT Python Sandbox
def calculate_grades(scores):
    avg = sum(scores) / len(scores)
    print(f"Calculated Student Average: {avg:.2f}")
    return "A+" if avg >= 85 else "A"

scores = [89, 92, 85, 94, 88]
grade = calculate_grades(scores)
print(f"Resulting Grade: {grade}")
`;
            } else {
                sandboxCodeEditor.value = `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to CHARUSAT Programming Sandbox!" << endl;
    cout << "Student Enrollment: 25CS009" << endl;
    
    int a = 15, b = 25;
    cout << "Sum calculation: " << (a + b) << endl;
    return 0;
}`;
            }
        });
    }

    if (btnRunSandboxCode && sandboxTerminal && sandboxCodeEditor) {
        btnRunSandboxCode.addEventListener('click', () => {
            const lang = sandboxLang ? sandboxLang.value : 'cpp';
            const code = sandboxCodeEditor.value;

            sandboxTerminal.innerText = 'Compiling and executing code in CHARUSAT cloud container...';

            setTimeout(() => {
                if (lang === 'cpp') {
                    sandboxTerminal.innerText = `[Compilation Success: g++ -O3 main.cpp -o main]
Running ./main ...

Welcome to CHARUSAT Programming Sandbox!
Student Enrollment: 25CS009
Sum calculation: 40

[Process completed with exit code 0]`;
                } else {
                    sandboxTerminal.innerText = `[Execution Success: python3 main.py]

Calculated Student Average: 89.60
Resulting Grade: A+

[Process completed with exit code 0]`;
                }
                showToast('Code executed successfully in sandbox!');
            }, 700);
        });
    }

    // Administrative Service Buttons & Guidelines Links
    const adminServicesData = {
        'egov': { title: 'CHARUSAT e-Governance Portal', body: '<p style="line-height: 1.6;">Welcome to the official CHARUSAT e-Governance portal. Integrated single sign-on system active for student records, timetable sync, and exam registration.</p>' },
        'verify': { title: 'Academic Record Verification', body: '<p style="line-height: 1.6;">Official QR Verification Desk: All grade sheets and degree certificates issued by CHARUSAT are digitally verified and signed by the Registrar.</p>' },
        'transcript': { title: 'Transcript & Migration Application', body: '<p style="line-height: 1.6;">Submit transcript applications for higher studies abroad or migration certificates directly to the examination department.</p>' },
        'digilocker': { title: 'DigiLocker NAD Academic Repository', body: '<p style="line-height: 1.6;">CHARUSAT academic awards and degree marksheets are synced with National Academic Depository (NAD) via DigiLocker.</p>' },
        'papers': { title: 'Semester Exam Question Paper Archive', body: '<p style="line-height: 1.6;">Access previous 5 years of university question papers for CSPIT, DEPSTAR, and CMPICA engineering and technology courses.</p>' }
    };

    const guidelinesData = {
        'promotion': { title: 'Promotion & Detention Regulations', body: '<p style="line-height: 1.6;">Students must maintain minimum 75% classroom attendance per course and pass minimum 60% credits to promote to the subsequent academic year.</p>' },
        'conduct': { title: 'Student Code of Conduct', body: '<p style="line-height: 1.6;">CHARUSAT strictly enforces zero tolerance for ragging, academic dishonesty, or misconduct. Campus is 100% ragging-free.</p>' },
        'refund': { title: 'Student Fee Refund Policy', body: '<p style="line-height: 1.6;">Fee refund requests submitted before commencement of academic session are eligible for 100% refund as per UGC guidelines.</p>' },
        'wellness': { title: 'Student Wellness Program', body: '<p style="line-height: 1.6;">24/7 Student Health & Counseling Cell available at campus health center with free medical consultation.</p>' }
    };

    document.querySelectorAll('.admin-service-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceKey = btn.getAttribute('data-service');
            const data = adminServicesData[serviceKey] || { title: 'Portal Service', body: '<p>CHARUSAT e-Governance Desk.</p>' };

            const modalInfoTitle = document.getElementById('modalInfoTitle');
            const modalInfoBody = document.getElementById('modalInfoBody');
            if (modalInfoTitle && modalInfoBody) {
                modalInfoTitle.innerText = data.title;
                modalInfoBody.innerHTML = data.body;
                openModal(modalInfo);
            }
        });
    });

    document.querySelectorAll('.guideline-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const policyKey = link.getAttribute('data-policy');
            const data = guidelinesData[policyKey] || { title: 'Academic Policy', body: '<p>CHARUSAT Academic Regulations.</p>' };

            const modalInfoTitle = document.getElementById('modalInfoTitle');
            const modalInfoBody = document.getElementById('modalInfoBody');
            if (modalInfoTitle && modalInfoBody) {
                modalInfoTitle.innerText = data.title;
                modalInfoBody.innerHTML = data.body;
                openModal(modalInfo);
            }
        });
    });
}