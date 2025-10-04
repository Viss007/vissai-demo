/*
 * JavaScript to handle login validation, conversation logic,
 * and basic voice capture for the Voice Bot demo. The UI allows users
 * to test the bot with a limited number of interactions. When the limit
 * is reached, input controls are disabled. The speak button uses the
 * browser's SpeechRecognition interface when available.
 */

// Immediately invoked function expression to avoid polluting global scope
(function() {
  // Constants for demo credentials
  const DEMO_USERNAME = 'demo';
  const DEMO_PASSWORD = 'demo123';
  const MAX_TRIES = 10;

  // Determine which page we are on by checking for specific elements
  const loginForm = document.getElementById('login-form');
  const conversationDiv = document.getElementById('conversation');

  if (loginForm) {
    // Login page behaviour
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const errorEl = document.getElementById('login-error');
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        // Redirect to the bot page
        window.location.href = 'setup.html';
      } else {
        errorEl.hidden = false;
      }
    });
  }
  // Setup page behaviour
  const setupForm = document.getElementById('setup-form');
  if (setupForm) {
    setupForm.addEventListener('submit', function(event) {
      event.preventDefault();
      // Collect form data
      const businessName = document.getElementById('business-name').value.trim();
      const industry = document.getElementById('industry').value.trim();
      const welcomeMsg = document.getElementById('welcome-msg').value.trim();
      const defaultAction = document.getElementById('default-action').value;
      const config = { businessName, industry, welcomeMsg, defaultAction };
      // Save to localStorage for retrieval on bot page
      localStorage.setItem('agentConfig', JSON.stringify(config));
      window.location.href = 'voicebot.html';
    });
  }

  if (conversationDiv) {
    // Voice bot page behaviour
    const logoutBtn = document.getElementById('logout-btn');
    const userInputEl = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const speakBtn = document.getElementById('speak-btn');
    const triesEl = document.getElementById('tries');
    let remainingTries = MAX_TRIES;

    // Display initial tries
    triesEl.textContent = String(remainingTries);

    // Pull any stored agent config for customisation
    let agentConfig;
    try {
      const cfgString = localStorage.getItem('agentConfig');
      agentConfig = cfgString ? JSON.parse(cfgString) : null;
    } catch (e) {
      agentConfig = null;
    }

    // If a custom welcome message is provided, prepend it to the conversation
    if (agentConfig && agentConfig.welcomeMsg) {
      conversationDiv.innerHTML = '';
      appendMessage('bot', agentConfig.welcomeMsg);
    }

    // Helper to append a message to the conversation
    function appendMessage(sender, text) {
      const msg = document.createElement('div');
      msg.classList.add('message', sender);
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('name');
      nameSpan.textContent = sender === 'user' ? 'You:' : 'Bot:';
      msg.appendChild(nameSpan);
      msg.appendChild(document.createTextNode(' ' + text));
      conversationDiv.appendChild(msg);
      // Scroll to bottom
      conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    // Bot response (simple echo with variation). In real app this would call API.
    function botRespond(userText) {
      // Simulate processing delay
      setTimeout(function() {
        var response;
        var lower = userText.toLowerCase();
        if (lower.includes('booking') || lower.includes('reserve')) {
          response = 'Sure! Please provide the date and time you\'d like to book.';
        } else if (lower.includes('hello') || lower.includes('hi')) {
          response = 'Hello! How can I assist you today?';
        } else if (lower.includes('thank')) {
          response = 'You\'re welcome! Let me know if there\'s anything else I can do.';
        } else if (lower.includes('bye')) {
          response = 'Goodbye! Have a great day.';
        } else {
          // Determine fallback based on chosen default action
          var defaultAction = agentConfig && agentConfig.defaultAction;
          if (defaultAction === 'bookings') {
            response = 'I can help you reserve a time or table. What date and time works for you?';
          } else if (defaultAction === 'faq') {
            response = 'I\'m here to answer any common questions you might have. What would you like to know?';
          } else if (defaultAction === 'support') {
            response = 'How can I assist you with support today?';
          } else {
            response = 'I\'m sorry, I didn\'t quite understand. Could you rephrase?';
          }
        }
        appendMessage('bot', response);
      }, 600);
    }

    // Handle sending a message
    function sendMessage() {
      var text = userInputEl.value.trim();
      if (!text || remainingTries <= 0) return;
      appendMessage('user', text);
      userInputEl.value = '';
      remainingTries -= 1;
      triesEl.textContent = String(remainingTries);
      botRespond(text);
      if (remainingTries <= 0) {
        // Disable inputs
        userInputEl.disabled = true;
        sendBtn.disabled = true;
        speakBtn.disabled = true;
        appendMessage('bot', 'You have reached your free trial limit. Please contact us to continue.');
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInputEl.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    // Logout returns to login page
    logoutBtn.addEventListener('click', function() {
      window.location.href = 'index.html';
    });

    // Speech recognition (when available)
    var recognition;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        userInputEl.value = transcript;
        sendMessage();
      };
      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
      };
    }

    speakBtn.addEventListener('click', function() {
      if (!recognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
      }
      recognition.start();
    });

    // Voice overlay logic
    const overlay = document.getElementById('voice-overlay');
    const overlayMicBtn = document.getElementById('overlay-mic-btn');
    const overlayCloseBtn = document.getElementById('overlay-close-btn');
    if (overlay) {
      // Show overlay on page load
      setTimeout(function() {
        overlay.classList.add('active');
      }, 100);
    }
    if (overlayMicBtn) {
      overlayMicBtn.addEventListener('click', function() {
        if (!recognition) {
          alert('Speech recognition is not supported in this browser.');
          return;
        }
        recognition.start();
      });
    }
    if (overlayCloseBtn) {
      overlayCloseBtn.addEventListener('click', function() {
        if (overlay) {
          overlay.classList.remove('active');
        }
      });
    }
  }
})();
// --- Minimal API wiring for demo: send input to /api/run ---
(function() {
  const conv = document.getElementById('conversation');
  function appendBot(text) {
    const d = document.createElement('div');
    d.className = 'message bot';
    const s = document.createElement('span'); s.className='name'; s.textContent='Bot:';
    d.appendChild(s); d.appendChild(document.createTextNode(' ' + text));
    conv.appendChild(d); conv.scrollTop = conv.scrollHeight;
  }
  const sendBtn2 = document.getElementById('send-btn');
  const userInput2 = document.getElementById('user-input');
  if (sendBtn2 && userInput2) {
    sendBtn2.addEventListener('click', async function() {
      try {
        const payload = { name: 'Demo', reason: userInput2.value, action: 'bookings', lang: 'lt' };
        const r = await fetch('/api/run', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)});
        if (r.ok) {
          const data = await r.json();
          if (data?.drafts?.sms) appendBot(data.drafts.sms);
        }
      } catch(e) { console.warn('API call failed', e); }
    }, { once: false });
  }
})();
