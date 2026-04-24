/* ============================================
   PIXELSEARCH — VOICE / CONVERSATIONAL ASSISTANT
   ============================================ */

function renderAssistantScreen() {
  const convo = AssistantData.conversations[0].messages;

  return `
    <div class="screen assistant-screen" id="screen-assistant">
      <div style="padding:var(--space-4) 0 var(--space-2);">
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);">
          <span class="text-gradient">AI Assistant</span>
        </h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">Chat with your photo gallery using natural language</p>
      </div>

      <div class="chat-container" id="chat-container">
        ${convo.map(msg => renderChatMessage(msg)).join('')}
      </div>

      <div class="chat-input-bar" id="chat-input-bar">
        <input type="text" placeholder="Ask about your photos…" id="chat-input" />
        <button class="search-bar__mic mic-pulse" id="chat-mic" style="width:40px;height:40px;" onclick="toggleMicAnimation()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
        <button class="btn btn-primary btn-icon" onclick="sendChatMessage()" id="chat-send" style="width:40px;height:40px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </button>
      </div>

      <!-- Floating Mic -->
      <button class="floating-mic mic-pulse" id="floating-mic" onclick="toggleMicAnimation()" style="display:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </button>
    </div>
  `;
}

function renderChatMessage(msg) {
  const isUser = msg.role === 'user';
  const photos = msg.hasPhotos ? msg.photoIndices.map(i => PhotoData.photos[i]).filter(Boolean) : [];

  return `
    <div class="chat-msg chat-msg--${msg.role}">
      <div class="chat-msg__avatar">
        ${isUser ? '👤' : '✨'}
      </div>
      <div>
        <div class="chat-msg__bubble">${msg.text}</div>
        ${photos.length > 0 ? `
          <div class="chat-photos" style="margin-top:var(--space-2);">
            ${photos.map(p => `
              <img src="${p.src}" alt="${p.title}" onclick="openPhotoModal(${p.id})" style="cursor:pointer;" />
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const container = document.getElementById('chat-container');
  if (!input || !container || !input.value.trim()) return;

  const userText = input.value.trim();
  input.value = '';

  // Add user message
  container.insertAdjacentHTML('beforeend', renderChatMessage({ role: 'user', text: userText }));

  // Add typing indicator
  container.insertAdjacentHTML('beforeend', `
    <div class="chat-msg chat-msg--ai" id="typing-indicator">
      <div class="chat-msg__avatar">✨</div>
      <div class="chat-msg__bubble">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `);

  container.scrollTop = container.scrollHeight;

  // Simulate AI response
  setTimeout(() => {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    // Generate a mock response
    const responses = [
      { text: `I found <strong>${Math.floor(Math.random() * 40 + 10)} photos</strong> matching "${userText}". Here are the top results:`, hasPhotos: true, photoIndices: getRandomPhotoIndices(3) },
      { text: `Great question! Let me search through your gallery for "${userText}"… Found <strong>${Math.floor(Math.random() * 25 + 5)} matches</strong>!`, hasPhotos: true, photoIndices: getRandomPhotoIndices(4) },
      { text: `Searching for "${userText}"… I found some great matches! Here\'s what I discovered:`, hasPhotos: true, photoIndices: getRandomPhotoIndices(3) },
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    response.role = 'ai';

    container.insertAdjacentHTML('beforeend', renderChatMessage(response));
    container.scrollTop = container.scrollHeight;
  }, 1500);
}

function getRandomPhotoIndices(count) {
  const indices = [];
  const max = PhotoData.photos.length;
  while (indices.length < count) {
    const r = Math.floor(Math.random() * max);
    if (!indices.includes(r)) indices.push(r);
  }
  return indices;
}

function toggleMicAnimation() {
  const mics = document.querySelectorAll('.mic-pulse');
  mics.forEach(mic => {
    mic.classList.toggle('active');
    setTimeout(() => mic.classList.remove('active'), 3000);
  });
}

function initAssistant() {
  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }
}
