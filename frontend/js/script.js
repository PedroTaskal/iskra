document.addEventListener("DOMContentLoaded", () => {
  // --- Common functionality for both pages ---
  let API_BASE_URL;
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // Ми все ще на локальному сервері, тому тут залишаємо localhost
    API_BASE_URL = "http://localhost:5000";
    console.log("Running in DEVELOPMENT mode. API URL:", API_BASE_URL);
  } else {
    // Ми на реальному хостингу. Формуємо URL динамічно.
    // Припускаємо, що адреса бекенда відрізняється лише заміною "-frontend" на "-backend"
    // (Або будь-якою іншою частиною, яка у вас відрізняється)
    const backendHostname = hostname.replace("-frontend", "-backend");

    API_BASE_URL = `https://${backendHostname}`;
    console.log("Running in PRODUCTION mode. Derived API URL:", API_BASE_URL);
  }

  // Animate elements on scroll using Intersection Observer
  const animateElements = document.querySelectorAll(
    ".animate-fade-in, .animate-slide-up, .animate-scale-in"
  );

  const observerOptions = {
    threshold: 0.1, // When 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // Optional: Stop observing once animated if it's a one-time animation
        // observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach((element) => {
    observer.observe(element);
  });

  setTimeout(() => {
    animateElements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add("is-visible");
      }
    });
  }, 100);

  // --- Protected Data Fetching (for index.html) ---
  // Цей код виконається, тільки якщо ми на головній сторінці
  if (window.location.pathname.includes("index.html")) {
    // Функція для отримання захищених даних
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      // Якщо токена немає, нічого не робимо
      if (!token) {
        console.log("Користувач не увійшов, профіль не завантажується.");
        return;
      }

      try {
        // === ОСЬ КЛЮЧОВИЙ МОМЕНТ ===
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Додаємо наш токен у заголовок
            authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Профіль користувача успішно завантажено:", userData);

          // Тепер ви можете відобразити ці дані на сторінці
          // Наприклад, знайти елемент і вставити email
          const userDisplay = document.getElementById("user-profile-display");
          if (userDisplay) {
            userDisplay.innerHTML = `Вітаємо, <strong>${userData.email}</strong>!`;
          }
        } else {
          // Якщо токен недійсний або прострочений, сервер поверне 401
          if (response.status === 401) {
            console.error("Токен недійсний або прострочений. Виконуємо вихід.");
            alert("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
            // Видаляємо недійсний токен і перенаправляємо на сторінку входу
            localStorage.removeItem("token");
            window.location.href = "/";
          }
        }
      } catch (error) {
        console.error("Помилка при завантаженні профілю:", error);
      }
    };

    // Викликаємо функцію, щоб завантажити дані при відкритті сторінки index.html
    fetchUserProfile();
  }

  // Smooth scrolling for navigation links (only relevant for index.html)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Check if current page is index.html before smooth scrolling
      if (
        window.location.pathname.endsWith("/") ||
        window.location.pathname.endsWith("/index.html")
      ) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Sticky Header Background on Scroll
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      // Changes as soon as scroll starts
      header.style.backgroundColor = "rgba(26, 26, 46, 0.95)";
      header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.5)";
    } else {
      header.style.backgroundColor = "rgba(26, 26, 46, 0.8)";
      header.style.boxShadow = "0 2px 15px rgba(0,0,0,0.4)";
    }
  });

  // --- Reusable Authentication Logic ---
  // This function handles the fetch requests for both login and register
  const handleAuthSubmission = async (
    endpoint,
    formData,
    formType,
    modalInstance = null
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/` + endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        console.log(`${formType} successful:`, data);
        localStorage.setItem("token", data.token); // Store token

        if (modalInstance) {
          // If submitted from a modal, hide it
          modalInstance.hide();
          // Clear the popup timer if it exists and successfully logged in
          if (window.popupTimer) {
            clearInterval(window.popupTimer);
            window.popupTimer = null; // Clear reference
          }
          // Optionally, you might want to reload the page or update UI after successful login
          // window.location.reload();
        } else {
          // If submitted from auth.html, redirect
          window.location.href = "index.html"; // Or a user dashboard page
        }
      } else {
        alert(`Помилка ${formType}: ${data.message || "Невідома помилка"}`);
        console.error(`${formType} error:`, data);
      }
    } catch (error) {
      console.error(`Network error during ${formType}:`, error);
      alert("Помилка підключення до сервера. Будь ласка, спробуйте пізніше.");
    }
  };

  // --- Specific functionality for auth.html page ---
  const authContainer = document.querySelector(".auth-container");
  if (authContainer) {
    // This code block runs ONLY if auth.html is loaded
    const tabButtons = document.querySelectorAll(".auth-container .tab-button");
    const authForms = document.querySelectorAll(".auth-container .auth-form");
    const switchLinks = document.querySelectorAll(
      ".auth-container .switch-link a"
    );

    const switchToForm = (targetTab) => {
      tabButtons.forEach((button) => {
        if (button.dataset.tab === targetTab) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });

      authForms.forEach((form) => {
        if (form.id === `${targetTab}-form`) {
          form.classList.add("active");
        } else {
          form.classList.remove("active");
        }
      });
    };

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        switchToForm(button.dataset.tab);
      });
    });

    switchLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        switchToForm(link.dataset.switchTo);
      });
    });

    // Form submission on auth.html
    document
      .getElementById("login-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        await handleAuthSubmission("login", { email, password }, "входу");
      });

    document
      .getElementById("register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
          alert("Паролі не співпадають!");
          return;
        }
        await handleAuthSubmission(
          "register",
          { email, password },
          "реєстрації"
        );
      });

    // Social login buttons on auth.html (placeholder)
    document.querySelectorAll(".social-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const provider = button.textContent.trim();
        alert(
          `Ви обрали вхід через ${provider}. Для цього потрібна додаткова інтеграція.`
        );
        console.log(`Attempting social login with: ${provider}`);
      });
    });
  }

  // --- Popup Modal Logic (for index.html) ---
  const authModal = document.getElementById("auth-modal");
  // This code block runs ONLY if authModal element exists (i.e., on index.html)
  if (authModal) {
    const closeButton = authModal.querySelector(".close-button");
    const modalTabButtons = authModal.querySelectorAll(".tab-button");
    const modalAuthForms = authModal.querySelectorAll(".auth-form");
    const modalSwitchLinks = authModal.querySelectorAll(".switch-link a");

    const showModal = () => {
      if (!localStorage.getItem("token")) {
        // Show only if user is NOT logged in
        authModal.classList.add("show");
      } else {
        // If user somehow logs in before timer fires, clear it
        if (window.popupTimer) {
          clearInterval(window.popupTimer);
          window.popupTimer = null;
        }
      }
    };

    const hideModal = () => {
      authModal.classList.remove("show");
    };

    // Event listeners for closing modal
    closeButton.addEventListener("click", hideModal);
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) {
        // Clicked on overlay, not content
        hideModal();
      }
    });

    // Toggle between login/register forms within the modal
    const switchModalForm = (targetTab) => {
      modalTabButtons.forEach((button) => {
        if (button.dataset.tab === targetTab) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });

      modalAuthForms.forEach((form) => {
        if (form.id === `${targetTab}-form`) {
          form.classList.add("active");
        } else {
          form.classList.remove("active");
        }
      });
    };

    modalTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        switchModalForm(button.dataset.tab);
      });
    });

    modalSwitchLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        switchModalForm(link.dataset.switchTo);
      });
    });

    // Form submission inside modal
    document
      .getElementById("modal-login-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("modal-login-email").value;
        const password = document.getElementById("modal-login-password").value;
        await handleAuthSubmission("login", { email, password }, "входу", {
          hide: hideModal,
        });
      });

    document
      .getElementById("modal-register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("modal-register-email").value;
        const password = document.getElementById(
          "modal-register-password"
        ).value;
        const confirmPassword = document.getElementById(
          "modal-confirm-password"
        ).value;

        if (password !== confirmPassword) {
          alert("Паролі не співпадають!");
          return;
        }
        await handleAuthSubmission(
          "register",
          { email, password },
          "реєстрації",
          { hide: hideModal }
        );
      });

    // Social login buttons inside modal (placeholder)
    authModal.querySelectorAll(".social-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const provider = button.textContent.trim();
        alert(
          `Ви обрали вхід через ${provider}. Для цього потрібна додаткова інтеграція.`
        );
        console.log(`Attempting social login with: ${provider}`);
      });
    });

    // Timer for popup (only if user is not logged in)
    // Set an initial timeout to avoid showing modal immediately on page load
    // and then set the repeating interval.
    const initialDelay = 5 * 1000; // Show first popup after 5 seconds
    const subsequentInterval = 15 * 1000; // Subsequent popups every 15 seconds

    if (!localStorage.getItem("token")) {
      console.log("User not logged in. Starting popup timer.");
      // Show first modal after initialDelay
      setTimeout(() => {
        showModal();
        // Then set repeating interval for subsequent modals
        window.popupTimer = setInterval(showModal, subsequentInterval);
      }, initialDelay);
    } else {
      console.log("User logged in. Popup timer not started.");
    }
  }
});
