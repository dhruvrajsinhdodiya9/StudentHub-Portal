/**
 * CHARUSAT Student Portal - Core Javascript
 * Manages Dynamic Navbar, Theme Toggling, Page Transitions, and Interactive CHARUSAT mock systems.
 */

// 1. Immediate Theme Check (Run as soon as script parses)
(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Sync body class with html class just to be sure styles apply perfectly
    if (document.documentElement.classList.contains('light-theme')) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    injectCommonElements();
    setupEventListeners();
    updateThemeToggleIcon();
});

// 2. Global Toast Notification Helper
function showToast(message, type = 'success') {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '14px 24px',
        borderRadius: '10px',
        backgroundColor: type === 'success' ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)',
        color: '#ffffff',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// 3. Theme Toggle Functionality
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
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
        const isLight = document.body.classList.contains('light-theme');
        btn.innerHTML = isLight ? '🌙' : '☀️';
    }
}

// 4. Inject Dynamic Navbar & Footer
function injectCommonElements() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'home.html';

    const isAuthPage = page === 'login.html' || page === 'signup.html';
    const isHomePage = page === 'home.html' || page === '';

    // A. Inject Theme Toggle on auth pages (login, signup)
    if (isAuthPage) {
        const authCard = document.querySelector('.auth-card');
        if (authCard && !document.querySelector('.theme-toggle-btn')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.position = 'absolute';
            actionsDiv.style.top = '20px';
            actionsDiv.style.right = '20px';
            actionsDiv.innerHTML = `<button class="theme-toggle-btn" aria-label="Toggle Theme">☀️</button>`;
            document.body.appendChild(actionsDiv);
            document.querySelector('.theme-toggle-btn').addEventListener('click', toggleTheme);
        }
    }

    // B. Inject Header/Navbar on other pages
    if (!isAuthPage && !document.querySelector('.navbar-container')) {
        const header = document.createElement('header');
        header.className = 'navbar-container';

        let navLinksHTML = '';
        if (isHomePage) {
            navLinksHTML = `
                <li><a href="home.html" class="active">Home</a></li>
                <li><a href="login.html">Login</a></li>
                <li><a href="signup.html">Sign Up</a></li>
            `;
        } else {
            navLinksHTML = `
                <li><a href="home.html" class="${page === 'home.html' ? 'active' : ''}">Home</a></li>
                <li><a href="dashboard.html" class="${page === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="profile.html" class="${page === 'profile.html' ? 'active' : ''}">Profile</a></li>
                <li><a href="attendence.html" class="${page === 'attendence.html' ? 'active' : ''}">Attendance</a></li>
                <li><a href="course.html" class="${page === 'course.html' ? 'active' : ''}">Courses</a></li>
                <li><a href="schedule.html" class="${page === 'schedule.html' ? 'active' : ''}">Schedule</a></li>
                <li><a href="grades.html" class="${page === 'grades.html' ? 'active' : ''}">Grades</a></li>
                <li><a href="fees.html" class="${page === 'fees.html' ? 'active' : ''}">Fees</a></li>
                <li><a href="announcements.html" class="${page === 'announcements.html' ? 'active' : ''}">Announcements</a></li>
                <li><a href="studentcorner.html" class="${page === 'studentcorner.html' ? 'active' : ''}">Corner</a></li>
                <li><a href="settings.html" class="${page === 'settings.html' ? 'active' : ''}">Settings</a></li>
            `;
        }

        header.innerHTML = `
            <div class="navbar">
                <a href="home.html" class="nav-brand">CHARUSAT Portal</a>
                <ul class="nav-links">
                    ${navLinksHTML}
                </ul>
                <div class="nav-actions">
                    <button class="theme-toggle-btn" aria-label="Toggle Theme">☀️</button>
                    ${!isHomePage ? '<a href="login.html" class="logout-btn" title="Logout">🚪</a>' : ''}
                </div>
            </div>
        `;

        document.body.insertBefore(header, document.body.firstChild);
        document.querySelector('.theme-toggle-btn').addEventListener('click', toggleTheme);
    }

    // C. Inject Footer
    if (!document.querySelector('footer')) {
        const footer = document.createElement('footer');
        footer.innerHTML = `
            <p>&copy; 2026 Charotar University of Science and Technology (CHARUSAT). All Rights Reserved.</p>
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

// 5. Link Transitions and Event Handlers
function setupEventListeners() {
    // Smooth Page Exit Transition on Nav Links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            // Intercept local .html transitions
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
                }, 200);
            }
        }
    });

    // Form submission handlers
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            // General form interceptor
            const title = document.title.toLowerCase();
            if (title.includes('login') || title.includes('sign up')) {
                e.preventDefault();
            }

            if (title.includes('login')) {
                showToast('Login successful! Welcome to CHARUSAT Portal.');
                setTimeout(() => {
                    document.querySelector('.auth-card').classList.add('page-exit');
                    setTimeout(() => window.location.href = 'dashboard.html', 200);
                }, 1000);
            } else if (title.includes('sign up')) {
                showToast('CHARUSAT Student Account created! Redirecting...');
                setTimeout(() => {
                    document.querySelector('.auth-card').classList.add('page-exit');
                    setTimeout(() => window.location.href = 'login.html', 200);
                }, 1000);
            } else if (title.includes('settings') && e.submitter && e.submitter.type === 'submit') {
                e.preventDefault();
                showToast('CHARUSAT profile preferences updated!');
            }
        });
    }

    // Settings Profile and Password buttons
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showToast('Editing profile credentials unlocked.');
        });
    }

    const updatePwdBtn = document.querySelector('.update-password-btn');
    if (updatePwdBtn) {
        updatePwdBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const inputs = document.querySelectorAll('input[type="password"]');
            let filled = true;
            inputs.forEach(input => {
                if (!input.value) filled = false;
            });
            if (filled) {
                showToast('Password updated successfully!');
                inputs.forEach(input => input.value = '');
            } else {
                showToast('Please fill out all password fields.', 'error');
            }
        });
    }

    // Interactive CHARUSAT Result Search Engine (grades.html)
    const resultSearchBtn = document.getElementById('btnSearchResult');
    if (resultSearchBtn) {
        resultSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const enrollmentInput = document.getElementById('txtEnrNo');
            const resultPanel = document.getElementById('resultDetailsPanel');
            const placeholderPanel = document.getElementById('resultPlaceholderPanel');

            if (!enrollmentInput.value.trim()) {
                showToast('Please enter your CHARUSAT Student ID / Enrollment No.', 'error');
                return;
            }

            resultSearchBtn.value = 'Processing...';
            resultSearchBtn.disabled = true;

            setTimeout(() => {
                resultSearchBtn.value = 'Show Result';
                resultSearchBtn.disabled = false;

                // Show dynamic card and hide placeholder
                if (placeholderPanel) placeholderPanel.style.display = 'none';
                if (resultPanel) {
                    resultPanel.style.display = 'block';
                    resultPanel.scrollIntoView({ behavior: 'smooth' });
                }
                showToast(`Grades Loaded for Student: ${enrollmentInput.value.trim()}`);
            }, 800);
        });
    }

    // Interactive CHARUSAT Fees Search & Pay (fees.html)
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
            }, 700);
        });
    }

    // Mock Pay Fees Processing
    const payFeesBtn = document.getElementById('btnPayDues');
    if (payFeesBtn) {
        payFeesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedMode = document.querySelector('input[name="paymentMode"]:checked');
            if (!selectedMode) {
                showToast('Please select a payment mode (UPI, Card, NetBanking).', 'error');
                return;
            }

            payFeesBtn.innerText = 'Processing Gateway...';
            payFeesBtn.disabled = true;

            setTimeout(() => {
                payFeesBtn.innerText = 'Pay Outstanding Dues';
                payFeesBtn.disabled = false;

                const unpaidRow = document.getElementById('unpaidFeesRow');
                const clearedRow = document.getElementById('clearedFeesRow');
                const ledgerTable = document.getElementById('ledgerTableBody');

                if (unpaidRow) {
                    unpaidRow.remove();
                    showToast('Payment processing successful! Receipt generated.');

                    // Add new cleared transaction to table
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

                    // Update header totals
                    const clearedDuesVal = document.getElementById('clearedDuesVal');
                    const pendingDuesVal = document.getElementById('pendingDuesVal');
                    if (clearedDuesVal) clearedDuesVal.innerText = '₹1,50,000';
                    if (pendingDuesVal) {
                        pendingDuesVal.innerText = '₹0';
                        pendingDuesVal.style.color = 'var(--text-secondary)';
                    }
                    localStorage.setItem('feesPaid', 'true');
                } else {
                    showToast('No pending dues found for this account.');
                }
            }, 1200);
        });
    }

    // Fees receipt download button
    const downloadReceiptBtn = document.querySelector('.download-receipt-btn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', () => {
            showToast('Downloading fee receipt REC10235.pdf...');
            const link = document.createElement('a');
            link.style.display = 'none';
            const blob = new Blob(['CHARUSAT Fee Receipt - Paid ₹75,000'], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
            link.download = 'Receipt_REC10235.pdf';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                link.remove();
            }, 100);
        });
    }

    // Course continue learning buttons
    const continueLearningBtns = document.querySelectorAll('.continue-learning-btn');
    continueLearningBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const courseName = btn.closest('.card').querySelector('h2').innerText;
            showToast(`Resuming classroom: ${courseName}`);
        });
    });

    // Student corner resources
    const resourceBtns = document.querySelectorAll('.resource-btn');
    resourceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.closest('.card').querySelector('h2').innerText;
            showToast(`Redirecting to CHARUSAT ${title} Portal...`);
        });
    });

    // Settings Theme Dropdown Select Sync
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = document.body.classList.contains('light-theme') ? 'light' : 'dark';

        themeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'light') {
                document.body.classList.add('light-theme');
                document.documentElement.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                document.documentElement.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
            }
            updateThemeToggleIcon();
            showToast(`${val === 'light' ? 'Light' : 'Dark'} theme activated!`);
        });
    }
}