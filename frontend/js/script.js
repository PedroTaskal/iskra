document.addEventListener('DOMContentLoaded', () => {
    // --- Common functionality for both pages (index.html & auth.html) ---

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

    // Trigger initial animations for elements in viewport on load
    // A small delay makes it feel smoother
    setTimeout(() => {
        animateElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('is-visible');
            }
        });
    }, 100);

    // Smooth scrolling for navigation links (only relevant for index.html)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if current page is index.html before smooth scrolling
            // This prevents smooth scrolling from auth.html to index.html sections
            if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple sticky header background change (applied to both pages)
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) { // Changes as soon as scroll starts
            header.style.backgroundColor = 'rgba(26, 26, 46, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
            header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.4)';
        }
    });


    // --- Specific functionality for auth.html ---
    // This block of code will only execute if the 'auth-container' element exists on the page.
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const authForms = document.querySelectorAll('.auth-form');
        const switchLinks = document.querySelectorAll('.switch-link a');

        // Function to switch between login and register forms
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

        // Event listeners for tab buttons (Login/Register tabs)
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchToForm(button.dataset.tab);
            });
        });

        // Event listeners for switch links (e.g., "Don't have an account? Register" / "Already have an account? Login")
        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                switchToForm(link.dataset.switchTo);
            });
        });

        // --- Handle form submissions (NOW CONNECTED TO BACKEND) ---

        // Login Form Submission
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission and page reload
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                // Send login request to your Node.js backend
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST', // Use POST method for login
                    headers: {
                        'Content-Type': 'application/json', // Tell the server we are sending JSON
                    },
                    body: JSON.stringify({ email, password }), // Convert data to JSON string
                });

                const data = await response.json(); // Parse the JSON response from the server

                if (response.ok) { // Check if the HTTP status code is 2xx (success)
                    alert(data.message); // Show success message from backend
                    console.log('Login successful:', data);
                    localStorage.setItem('token', data.token); // Store the JWT token
                    // Redirect user to the main page or a user dashboard
                    window.location.href = 'index.html';
                } else { // Handle server-side errors (e.g., 400, 500)
                    alert(`Помилка входу: ${data.message || 'Невідома помилка'}`);
                    console.error('Login error:', data);
                }
            } catch (error) { // Handle network errors (e.g., server not running, no internet)
                console.error('Network error during login:', error);
                alert('Помилка підключення до сервера. Будь ласка, перевірте з\'єднання або спробуйте пізніше.');
            }
        });

        // Registration Form Submission
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission and page reload
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Basic client-side validation: check if passwords match
            if (password !== confirmPassword) {
                alert('Паролі не співпадають!');
                return; // Stop the function if passwords don't match
            }

            try {
                // Send registration request to your Node.js backend
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST', // Use POST method for registration
                    headers: {
                        'Content-Type': 'application/json', // Tell the server we are sending JSON
                    },
                    body: JSON.stringify({ email, password }), // Convert data to JSON string
                });

                const data = await response.json(); // Parse the JSON response from the server

                if (response.ok) { // Check if the HTTP status code is 2xx (success)
                    alert(data.message); // Show success message from backend
                    console.log('Registration successful:', data);
                    localStorage.setItem('token', data.token); // Store the JWT token
                    // Redirect user after successful registration
                    window.location.href = 'index.html'; // Or a user dashboard page
                } else { // Handle server-side errors (e.g., 400, 500)
                    alert(`Помилка реєстрації: ${data.message || 'Невідома помилка'}`);
                    console.error('Registration error:', data);
                }
            } catch (error) { // Handle network errors
                console.error('Network error during registration:', error);
                alert('Помилка підключення до сервера. Будь ласка, перевірте з\'єднання або спробуйте пізніше.');
            }
        });

        // Handle social login buttons (still placeholder, as they require separate OAuth setup)
        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                const provider = button.textContent.trim();
                alert(`Ви обрали вхід через ${provider}. Для цього потрібна додаткова інтеграція з API ${provider}.`);
                console.log(`Attempting social login with: ${provider}`);
                // In a real application, you would redirect the user to the OAuth provider's login page
            });
        });
    }
});
