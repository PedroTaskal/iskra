document.addEventListener('DOMContentLoaded', () => {
    // --- Common functionality for both pages ---

    // Animate elements on scroll using Intersection Observer
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-scale-in');

    const observerOptions = {
        threshold: 0.1 // When 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animated if it's a one-time animation
                // observerInstance.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });

    setTimeout(() => {
        animateElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('is-visible');
            }
        });
    }, 100);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            header.style.backgroundColor = 'rgba(26, 26, 46, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
            header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.4)';
        }
    });

    // --- Authentication Logic (reusable function) ---
    // This function handles the fetch requests for both login and register
    const handleAuthSubmission = async (endpoint, formData, formType, modalInstance = null) => {
        try {
            const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                console.log(`${formType} successful:`, data);
                localStorage.setItem('token', data.token); // Store token

                if (modalInstance) { // If submitted from a modal, hide it
                    modalInstance.hide();
                    if (window.popupTimer) { // Clear the popup timer if it exists
                        clearInterval(window.popupTimer);
                    }
                    // Optionally, you might want to reload the page or update UI
                    // window.location.reload();
                } else { // If submitted from auth.html, redirect
                    window.location.href = 'index.html'; // Or a user dashboard page
                }
            } else {
                alert(`Помилка ${formType}: ${data.message || 'Невідома помилка'}`);
                console.error(`${formType} error:`, data);
            }
        } catch (error) {
            console.error(`Network error during ${formType}:`, error);
            alert('Помилка підключення до сервера. Будь ласка, спробуйте пізніше.');
        }
    };


    // --- Specific functionality for auth.html ---
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
        const tabButtons = document.querySelectorAll('.auth-container .tab-button');
        const authForms = document.querySelectorAll('.auth-container .auth-form');
        const switchLinks = document.querySelectorAll('.auth-container .switch-link a');

        const switchToForm = (targetTab) => {
            tabButtons.forEach(button => {
                if (button.dataset.tab === targetTab) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            authForms.forEach(form => {
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        };

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchToForm(button.dataset.tab);
            });
        });

        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchToForm(link.dataset.switchTo);
            });
        });

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await handleAuthSubmission('login', { email, password }, 'входу');
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Паролі не співпадають!');
                return;
            }
            await handleAuthSubmission('register', { email, password }, 'реєстрації');
        });

        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = button.textContent.trim();
                alert(`Ви обрали вхід через ${provider}. Для цього потрібна додаткова інтеграція.`);
                console.log(`Attempting social login with: ${provider}`);
            });
        });
    }


    // --- Popup Modal Logic (for index.html) ---
    const authModal = document.getElementById('auth-modal');
    // Ensure we are on the index page and the modal element exists
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        const closeButton = authModal.querySelector('.close-button');
        const modalTabButtons = authModal.querySelectorAll('.tab-button');
        const modalAuthForms = authModal.querySelectorAll('.auth-form');
        const modalSwitchLinks = authModal.querySelectorAll('.switch-link a');

        const showModal = () => {
            if (!localStorage.getItem('token')) { // Show only if user is NOT logged in
                authModal.classList.add('show');
            }
        };

        const hideModal = () => {
            authModal.classList.remove('show');
        };

        // Event listeners for closing modal
        closeButton.addEventListener('click', hideModal);
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) { // Clicked on overlay, not content
                hideModal();
            }
        });

        // Toggle between login/register forms within the modal
        const switchModalForm = (targetTab) => {
            modalTabButtons.forEach(button => {
                if (button.dataset.tab === targetTab) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            modalAuthForms.forEach(form => {
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        };

        modalTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchModalForm(button.dataset.tab);
            });
        });

        modalSwitchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchModalForm(link.dataset.switchTo);
            });
        });

        // Form submission inside modal
        document.getElementById('modal-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('modal-login-email').value;
            const password = document.getElementById('modal-login-password').value;
            await handleAuthSubmission('login', { email, password }, 'входу', { hide: hideModal });
        });

        document.getElementById('modal-register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('modal-register-email').value;
            const password = document.getElementById('modal-register-password').value;
            const confirmPassword = document.getElementById('modal-confirm-password').value;

            if (password !== confirmPassword) {
                alert('Паролі не співпадають!');
                return;
            }
            await handleAuthSubmission('register', { email, password }, 'реєстрації', { hide: hideModal });
        });

        // Social login buttons inside modal (placeholder)
        authModal.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = button.textContent.trim();
                alert(`Ви обрали вхід через ${provider}. Для цього потрібна додаткова інтеграція.`);
                console.log(`Attempting social login with: ${provider}`);
            });
        });


        // Timer for popup (only if user is not logged in)
        if (!localStorage.getItem('token')) {
            const popupInterval = 15 * 1000; // 15 секунд
            window.popupTimer = setInterval(showModal, popupInterval); // Store timer ID globally
        }
    }
});
