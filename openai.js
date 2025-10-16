/**
 * OpenAI ChatKit Integration Script
 * 
 * IMPORTANT: Place this file in your public/ folder
 * Update OPENAI_API_KEY and WORKFLOW_ID below before using
 */

// ============================================
// Initialize ChatKit
// ============================================
(function () {
    'use strict';

    let sessionSecret = null;
    let isCreatingSession = false;
    let sessionPromise = null;

    // Create session with OpenAI API
    async function createSession() {
        if (isCreatingSession && sessionPromise) {
            return sessionPromise;
        }

        isCreatingSession = true;

        sessionPromise = (async () => {
            try {
                console.log('🔄 Creating ChatKit session...');
                console.log('API Key format:', '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'.substring(0, 8) + '...');
                console.log('Workflow ID:', 'wf_68e627beb3008190ae5204d8ab71c16c0c33a45c233669ed');

                const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer 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`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'chatkit_beta=v1'
                    },
                    body: JSON.stringify({
                        workflow: {
                            id: 'wf_68e627beb3008190ae5204d8ab71c16c0c33a45c233669ed'
                        },
                        user: `user_${Date.now()}`
                    })
                });

                const responseText = await response.text();

                if (!response.ok) {
                    let errorMessage;
                    let errorDetails;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error?.message || response.statusText;
                        errorDetails = errorData.error;
                    } catch {
                        errorMessage = responseText || response.statusText;
                    }

                    console.error('❌ Session creation failed');
                    console.error('Status:', response.status, response.statusText);
                    console.error('Error:', errorMessage);

                    if (response.status === 401) {
                        console.error('\n🔴 401 UNAUTHORIZED - Possible causes:');
                        console.error('1. Invalid API key - Check it starts with sk-proj- or sk-');
                        console.error('2. API key doesn\'t have ChatKit access enabled');
                        console.error('3. Check your API key at: https://platform.openai.com/api-keys');
                    } else if (response.status === 404) {
                        console.error('\n🔴 404 NOT FOUND - Possible causes:');
                        console.error('1. Invalid Workflow ID - Check it starts with wf_');
                        console.error('2. Workflow doesn\'t exist or was deleted');
                        console.error('3. Check your workflows at: https://platform.openai.com/agent-builder');
                    }

                    if (errorDetails) {
                        console.error('Full error details:', errorDetails);
                    }

                    throw new Error(`Session failed (${response.status}): ${errorMessage}`);
                }

                const data = JSON.parse(responseText);
                sessionSecret = data.client_secret;

                console.log('✅ Session created successfully');
                console.log('Session ID:', data.id);
                console.log('Client secret length:', sessionSecret?.length);

                return sessionSecret;
            } catch (error) {
                console.error('❌ Error creating session:', error);
                throw error;
            } finally {
                isCreatingSession = false;
            }
        })();

        return sessionPromise;
    }

    // Get client secret function that ChatKit will call
    async function getClientSecret(existingSecret) {
        console.log('📞 ChatKit requesting client secret');
        console.log('Existing secret provided:', !!existingSecret);

        // If we have a cached secret and it matches the existing one, return it
        if (sessionSecret && existingSecret === sessionSecret) {
            console.log('✅ Returning cached secret');
            return sessionSecret;
        }

        // Create new session
        console.log('🔄 Creating new session...');
        const secret = await createSession();
        console.log('✅ Returning new secret to ChatKit');
        return secret;
    }

    // Create slide-in panel UI
    function createPanelUI() {
        console.log('🎨 Creating panel UI...');

        // Remove any existing chatkit containers first
        const existingContainers = document.querySelectorAll('#chatkit-container');
        existingContainers.forEach(container => {
            console.log('🗑️ Removing existing container:', container);
            container.remove();
        });

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'chatkit-toggle-btn';
        toggleBtn.innerHTML = 'Chat';
        toggleBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 6px;
      z-index: 10000;
      transition: right 0.3s ease-in-out, background 0.2s;
    `;
        toggleBtn.onmouseover = () => toggleBtn.style.background = '#2563eb';
        toggleBtn.onmouseout = () => toggleBtn.style.background = '#3b82f6';

        // Create panel - OPEN BY DEFAULT for testing
        const panel = document.createElement('div');
        panel.id = 'chatkit-panel';
        panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: ${window.innerHeight}px;
      background: #f0f0f0;
      border-left: 1px solid #d1d5db;
      z-index: 9999;
      transition: right 0.3s ease-in-out;
    `;

        // Create container inside panel
        const container = document.createElement('div');
        container.id = 'chatkit-container';
        container.style.cssText = `
      width: 100%;
      height: ${window.innerHeight}px;
      overflow: hidden;
    `;

        panel.appendChild(container);
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);

        // Force reflow to ensure dimensions are calculated
        container.offsetHeight;

        console.log('✅ Panel UI created');
        console.log('Panel element:', panel);
        console.log('Container element:', container);
        console.log('Toggle button element:', toggleBtn);

        // Add transition to body for squeeze effect
        document.body.style.transition = 'margin-right 0.3s ease-in-out';

        // Toggle functionality
        let isOpen = true; // START OPEN
        document.body.style.marginRight = '400px'; // START WITH MARGIN
        toggleBtn.style.right = `calc(20px + 400px)`; // START WITH BUTTON MOVED

        toggleBtn.addEventListener('click', () => {
            isOpen = !isOpen;
            console.log('🔘 Toggle clicked, isOpen:', isOpen);
            if (isOpen) {
                panel.style.right = '0';
                document.body.style.marginRight = '400px';
                toggleBtn.style.right = `calc(20px + 400px)`;
            } else {
                panel.style.right = `-400px`;
                document.body.style.marginRight = '0';
                toggleBtn.style.right = '20px';
            }
        });
    }

    // Initialize ChatKit element
    async function initializeChatKit() {
        try {
            console.log('🚀 Initializing ChatKit...');
            console.log('Config:', {
                workflow: 'wf_68e627beb3008190ae5204d8ab71c16c0c33a45c233669ed',
                container: 'chatkit-container',
                position: 'inline'
            });

            // Create panel UI FIRST before anything else
            createPanelUI();
            console.log('✅ Panel UI created first');

            // Wait for custom element to be defined
            if (typeof customElements === 'undefined') {
                throw new Error('customElements not available. ChatKit CDN script may not be loaded.');
            }

            console.log('⏳ Waiting for openai-chatkit element...');
            await customElements.whenDefined('openai-chatkit');
            console.log('✅ openai-chatkit element defined');

            // Get container (now inside panel)
            const container = document.getElementById('chatkit-container');
            if (!container) {
                throw new Error('Container not found after creating panel UI');
            }
            console.log('✅ Container found:', container);

            // Create ChatKit element
            console.log('🎨 Creating ChatKit element...');
            const chatkit = document.createElement('openai-chatkit');
            chatkit.style.width = '100%';
            chatkit.style.height = window.innerHeight + 'px';
            chatkit.style.minHeight = '600px';
            chatkit.style.display = 'block';

            // Set up event listeners
            chatkit.addEventListener('chatkit.ready', () => {
                console.log('🎉 ChatKit is ready!');

                // Force visibility of shadow DOM content
                setTimeout(() => {
                    const shadowRoot = chatkit.shadowRoot;
                    if (shadowRoot) {
                        const wrapper = shadowRoot.querySelector('.ck-wrapper');
                        if (wrapper) {
                            wrapper.style.opacity = '1';
                            console.log('✅ Forced ChatKit wrapper visibility');
                        }
                    }
                }, 100);
            });

            chatkit.addEventListener('chatkit.error', (event) => {
                console.error('❌ ChatKit error:', event.detail);
            });

            // Configure ChatKit - THIS IS THE KEY PART
            console.log('⚙️ Configuring ChatKit options...');
            const options = {
                api: {
                    getClientSecret: getClientSecret
                }
            };

            chatkit.setOptions(options);

            // Add to DOM
            container.appendChild(chatkit);
            console.log('✅ ChatKit element added to container');
            console.log('ChatKit element:', chatkit);
            console.log('ChatKit dimensions:', {
                width: chatkit.style.width,
                height: chatkit.style.height,
                offsetWidth: chatkit.offsetWidth,
                offsetHeight: chatkit.offsetHeight
            });
            console.log('Container dimensions:', {
                offsetWidth: container.offsetWidth,
                offsetHeight: container.offsetHeight
            });
            console.log('✅ ChatKit initialization complete');
            console.log('⏳ ChatKit will now request client secret...');

        } catch (error) {
            console.error('❌ Failed to initialize ChatKit:', error);

            // Show error in UI
            const container = document.getElementById('chatkit-container');
            if (container) {
                container.innerHTML = `
          <div style="padding: 20px; background: #fee2e2; border: 2px solid #fca5a5; border-radius: 8px; color: #991b1b; font-family: system-ui, -apple-system, sans-serif;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">⚠️ ChatKit Initialization Failed</div>
            <div style="font-size: 14px; margin-bottom: 12px;">${error.message}</div>
            <div style="font-size: 12px; color: #7f1d1d;">Check the browser console (F12) for details.</div>
          </div>
        `;
            }

            throw error;
        }
    }

    // Auto-initialize when ready
    function autoInit() {
        console.log('🏁 Starting auto-initialization...');
        initializeChatKit().catch(error => {
            console.error('❌ Auto-init failed:', error);
        });
    }

    // Wait for DOM and ChatKit CDN
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // Export for manual use
    window.initChatKit = initializeChatKit;

})();
