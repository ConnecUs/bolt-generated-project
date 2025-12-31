import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const generateStoryButton = document.getElementById('generate-story');
    const storyOutput = document.getElementById('story-output');
    const homePage = document.getElementById('home-page');
    const settingsPage = document.getElementById('settings-page');
    const navbarLinks = document.querySelectorAll('.navbar-link');
    const promptTemplateSelect = document.getElementById('prompt-template');

    // Settings Page Elements
    const modelSelect = document.getElementById('model-select');
    const geminiSettings = document.getElementById('gemini-settings');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const saveSettingsButton = document.getElementById('save-settings');

    // Function to show a specific page and hide others
    function showPage(pageId) {
        homePage.style.display = 'none';
        settingsPage.style.display = 'none';

        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
        }
    }

    // Add event listeners to navbar links
    navbarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page + '-page');
        });
    });

    // Initially show the home page
    showPage('home-page');

    // Function to handle story generation
    async function generateStory(prompt, model, apiKey = null) {
        let apiUrl = '';
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (model === 'gemini') {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`;
            requestOptions.body = JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            });
        } else {
            apiUrl = 'http://127.0.0.1:11434/api/generate'; // Default to Llama2
            requestOptions.body = JSON.stringify({
                model: 'llama2',
                prompt: prompt,
                stream: false
            });
        }

        try {
            const response = await fetch(apiUrl, requestOptions);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();

            if (model === 'gemini') {
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Invalid Gemini response format');
                }
            } else {
                return data.response;
            }
        } catch (error) {
            console.error('Error generating story:', error);
            throw error;
        }
    }

    if (generateStoryButton) {
        generateStoryButton.addEventListener('click', async () => {
            let prompt = promptInput.value;
            const selectedModel = modelSelect.value;
            const geminiApiKey = geminiApiKeyInput.value;
             // Apply prompt template if selected
            const selectedTemplate = promptTemplateSelect.value;
            if (selectedTemplate === 'template1') {
                prompt = `A story about ${prompt}`;
            } else if (selectedTemplate === 'template2') {
                prompt = `In a world where ${prompt}`;
            }

            try {
                const story = await generateStory(prompt, selectedModel, geminiApiKey);
                storyOutput.textContent = story;
            } catch (error) {
                storyOutput.textContent = `Error generating story: ${error.message}`;
            }
        });
    } else {
        console.error('generateStoryButton not found');
    }

    // Settings Page Logic
    modelSelect.addEventListener('change', () => {
        if (modelSelect.value === 'gemini') {
            geminiSettings.style.display = 'block';
        } else {
            geminiSettings.style.display = 'none';
        }
    });

    // Initially hide Gemini settings
    geminiSettings.style.display = 'none';

    saveSettingsButton.addEventListener('click', () => {
        const selectedModel = modelSelect.value;
        const geminiApiKey = geminiApiKeyInput.value;

        // Save settings to local storage or a server
        console.log('Settings saved:', {
            model: selectedModel,
            geminiApiKey: geminiApiKey
        });
        alert('Settings saved!');
    });
});
