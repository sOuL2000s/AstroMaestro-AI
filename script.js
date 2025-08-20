// Global variables for chat state and DOM elements (declared here for global access)
let currentChatSession = null;
let conversationHistory = []; // This will store the messages for the UI, synced with Gemini API history
let lastGeneratedReportInfo = null; // Stores an object with report type and content

// DOM elements - declared here, assigned inside DOMContentLoaded
let astrologyForm, numerologyForm, dailyHoroscopeForm, tarotForm;
let astrologyReportOutput, numerologyReportOutput, dailyHoroscopeOutput, tarotOutput;
let chatBubble, floatingChatModal, closeChatModalBtn, floatingChatMessages, floatingChatInput, floatingChatForm;


// Function to render messages to the UI from the conversationHistory array
function renderChatMessages() {
    // Ensure floatingChatMessages is available before trying to use it
    if (!floatingChatMessages) {
        console.error("floatingChatMessages element not found or not initialized.");
        return;
    }

    // Capture current scroll position if user has scrolled up
    const isScrolledToBottom = floatingChatMessages.scrollHeight - floatingChatMessages.clientHeight <= floatingChatMessages.scrollTop + 1; // +1 for buffer

    floatingChatMessages.innerHTML = ''; // Clear existing messages
    conversationHistory.forEach(msg => {
        // Ensure msg.parts[0].text exists and handle markdown parsing for bot messages
        const messageText = msg.parts && msg.parts.length > 0 && msg.parts[0].text ? msg.parts[0].text : '';
        const msgDiv = document.createElement('div');
        // Determine if it's a user or bot message
        msgDiv.classList.add('message', msg.role === 'user' ? 'user-message' : 'bot-message');
        msgDiv.innerHTML = marked.parse(messageText); // Parse markdown here
        floatingChatMessages.appendChild(msgDiv);
    });
    // Scroll to the bottom of the chat ONLY if user was already at the bottom or it's a new message
    if (isScrolledToBottom) {
        floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
    }
}

// Function to initialize/get chat session (Gemini API context)
async function getChatSession() {
    if (!currentChatSession) {
        // Initialize chat session with an EMPTY history.
        // We will manage the initial bot greeting and context separately.
        currentChatSession = window.model.startChat({ history: [] });
        conversationHistory = []; // Ensure local history is also empty
    }
    return currentChatSession;
}


document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements once the document is ready
    astrologyForm = document.getElementById('astrology-form');
    numerologyForm = document.getElementById('numerology-form');
    dailyHoroscopeForm = document.getElementById('daily-horoscope-form');
    tarotForm = document.getElementById('tarot-form');

    astrologyReportOutput = document.getElementById('astrology-report-output');
    numerologyReportOutput = document.getElementById('numerology-report-output');
    dailyHoroscopeOutput = document.getElementById('daily-horoscope-output');
    tarotOutput = document.getElementById('tarot-output');

    chatBubble = document.getElementById('chat-bubble');
    floatingChatModal = document.getElementById('floating-chat-modal');
    closeChatModalBtn = document.getElementById('close-chat-modal-btn');
    floatingChatMessages = document.getElementById('floating-chat-messages');
    floatingChatInput = document.getElementById('floating-chat-input');
    floatingChatForm = document.getElementById('floating-chat-form');


    // Function to switch sections and highlight nav button
    window.showSection = (sectionId, clickedButton) => {
        // Deactivate all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        // Deactivate all nav buttons
        document.querySelectorAll('.nav-button').forEach(button => {
            button.classList.remove('active');
        });

        // Activate the selected section
        document.getElementById(sectionId).classList.add('active');
        // Activate the clicked nav button
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    };

    // Initialize the first section as active and its button
    showSection('astrology-section', document.getElementById('nav-astrology'));

    // Pre-load the logo image to ensure html2canvas can access it
    const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log(`Logo image '${src}' preloaded successfully.`);
                resolve();
            };
            img.onerror = (err) => {
                console.error(`Error preloading logo image '${src}':`, err);
                reject(err);
            };
            img.src = src;
        });
    };

    // Preload the logo when the DOM content is loaded
    preloadImage('logo.png').catch(() => {
        console.warn("PDF generation might fail because the logo image could not be preloaded.");
    });


    // --- Astrology Report Generation ---
    astrologyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('astro-name').value;
        const dob = document.getElementById('astro-dob').value;
        const tob = document.getElementById('astro-tob').value;
        const place = document.getElementById('astro-place').value;
        const astroSystem = document.getElementById('astro-system').value; // Get the selected system

        const reportContentDiv = astrologyReportOutput.querySelector('.report-content');
        reportContentDiv.innerHTML = '<p>Generating your cosmic revelation... Please wait.</p>';
        astrologyReportOutput.classList.add('active');
        astrologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden'); // Hide download button during generation

        try {
            let astrologyPrompt;

            if (astroSystem === 'Vedic') {
                astrologyPrompt = `Generate a highly detailed and comprehensive Vedic (Indian) astrology birth chart report for a person named "${name}", born on ${dob} at ${tob} in ${place}. All astrological interpretations should strictly adhere to Vedic principles, including the use of **Lahiri Ayanamsa**.

                **Crucial Instruction for AI:** As an AI, you are not performing real-time astronomical calculations. Instead, you are tasked with generating a detailed *interpretive report*. Please proceed by inferring or stating the most probable **Sidereal Sun Sign, Sidereal Moon Sign (Rashi), and Ascendant (Lagna) Sign & Degree** based on typical Lahiri Ayanamsa conventions and general astrological correlations for the provided birth details. Then, provide the comprehensive interpretations for each section as if these initial chart facts were accurately calculated.

                Include the following sections with rich, insightful detail, using Markdown for clear formatting:

                ## 🕉️ Basic Astrological Details
                - **Personal Information:** Name, Date of Birth, Time of Birth, Place of Birth.
                - **Core Vedic Data (Inferred/Stated for Interpretation):**
                    - **Sidereal Sun Sign:** (Infer the Sun's sidereal sign and degree, e.g., "Sun in Scorpio at 5°")
                    - **Sidereal Moon Sign (Rashi):** (Infer the Moon's sidereal sign and degree, e.g., "Moon in Virgo at 8°")
                    - **Ascendant (Lagna) Sign:** (Infer the Lagna sign and degree, e.g., "Scorpio Ascendant at 12°")
                    - **Nakshatra & Pada:** For the inferred Moon sign, state its Nakshatra and Pada (e.g., "Moon in Uttaraphalguni Nakshatra, Pada 3").
                    - **Tithi, Karana, Yoga, Day of Birth, Ayanamsa used (Lahiri).**
                    - **Avkahada Chakra Points:** Include brief interpretations for Paya, Varna, Yoni, Gana, Vasya, Nadi, as often found in comprehensive Vedic reports.
                    - **Favourable/Ghatak Points:** List and briefly interpret lucky numbers, good/evil numbers, lucky days, good planets, friendly signs, lucky metal, lucky stone, and malefics (bad day, bad karan, bad lagna, bad month, bad nakshatra, bad rasi, bad tithi, bad yoga, bad planets).

                ## 🏡 Lagna Kundali (Birth Chart - Textual Overview)
                - Describe the Lagna (Ascendant) house (e.g., "Scorpio Ascendant").
                - Provide a textual representation of the Lagna chart. For each house, list the sign it represents and any planets placed within it. This is a textual description, **not a graphical chart**.
                - **Example Format for Lagna Kundali textual representation:**
                    - **House 1 (Ascendant):** [Inferred Lagna Sign] (e.g., Scorpio). Planets: [Planet A] ([Degree]), [Planet B] ([Degree])
                    - **House 2:** [Sign] (e.g., Sagittarius). Planets: [Planet C] ([Degree])
                    - ... continue for all 12 houses.

                ## 🌌 Planetary Interpretations (Navagrahas)
                For each of the **Navagrahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)**, based on their inferred placements:
                - State its sign and house placement in the Lagna chart.
                - Provide a **detailed interpretation** of its influence on personality, life events, strengths, challenges, and specific life areas.
                - Mention any significant aspects (drishti) it makes to other planets or houses, and their likely effects.

                ## ✨ Major Yogas (Planetary Combinations)
                - Identify and explain any prominent beneficial or challenging Yogas (e.g., Raja Yoga, Dhana Yoga, Kemadruma Yoga, Neecha Bhanga Raja Yoga, Gaja Kesari Yoga, etc.) inferred to be present in the chart.
                - Describe their implications for the native's destiny and life path.
                - If no major yogas are identified, state that.

                ## ⏱️ Vimshottari Dasha Predictions
                - State the **current ongoing Mahadasha** (major planetary period) based on the inferred Moon's Nakshatra.
                - Provide a **comprehensive overview** of the likely effects and major themes of this Mahadasha period.
                - List the **current Antardasha** (sub-period) and provide its general predictions, including potential challenges and opportunities within this shorter timeframe.
                - Suggest relevant remedies to optimize the dasha's influence if needed.

                ## 🪐 Sade Sati (Saturn's 7.5 Year Transit) Analysis
                - Based on the **inferred Moon Sign (Rashi)**, determine if Sade Sati is currently active or upcoming, and specify which phase (Rising, Peak, Setting) it is in.
                - Describe the **general and specific effects** and challenges associated with Sade Sati for this Moon Sign, covering areas like health, finance, relationships, and mental well-being.
                - Provide **specific, actionable Vedic remedies** and practices to mitigate negative effects of Sade Sati, if applicable.

                ## ⚔️ Mangal Dosha (Kuja Dosha) Analysis
                - Determine if Mangal Dosha is inferred to be present in the Lagna chart based on Mars's placement (1st, 2nd, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus).
                - Explain its implications, particularly for marriage and partnerships.
                - Provide **specific, actionable Vedic remedies** for Mangal Dosha, if present.

                ## 🐍 Kalsarpa Dosha Analysis
                - Determine if Kalsarpa Dosha is inferred to be present (i.e., all planets inferred to be positioned between Rahu and Ketu on one side of the nodal axis).
                - Explain its general impact on life, including potential struggles and challenges.
                - Provide **specific, actionable Vedic remedies** for Kalsarpa Dosha, if present.

                ## 🏮 Lal Kitab Predictions and Remedies
                For each of the following planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) that are inferred to be prominently placed or have a significant impact in the chart, provide:
                - A concise **Lal Kitab prediction** for that planet's inferred influence in the native's chart (general house effect, benefic/malefic potential).
                - At least **one specific, actionable Lal Kitab remedy** associated with that planet's placement or general challenges it might present, drawing from traditional Lal Kitab practices.

                ## 🔮 General Life Path & Destiny Insights
                - **Character & Personality:** A comprehensive overview of the native's core personality traits, strengths, weaknesses, and temperament based on the holistic chart analysis.
                - **Health:** General health predispositions, potential ailments, and advice for well-being.
                - **Family & Relationships:** Insights into familial bonds, dynamics with parents and siblings, marriage prospects, and the nature of partnerships.
                - **Career & Occupation:** Favorable career paths, professional inclinations, potential for success, and areas for growth.
                - **Finance:** Financial prospects, earning potential, wealth accumulation, and advice on managing resources.
                - **Education:** Learning style, educational journey, potential for academic success, and favorable fields of study.

                Maintain a deeply spiritual, mystical, and authoritative tone, as if a seasoned and compassionate Vedic astrologer is providing insights. Format the output using **Markdown** with clear, bold headings (## for main sections, ### for sub-sections), bullet points for lists, and **bold text** for emphasis. Ensure the content is easy to read, structured for a comprehensive report, and inspiring.`;
            } else { // Western Astrology
                astrologyPrompt = `
                Generate a comprehensive Western astrological birth chart report for ${name}, born on ${dob} at ${tob} in ${place}.
                This report should adhere to Western astrological principles. Include detailed interpretations for:
                - **Personal Information:** Name, Date of Birth, Time of Birth, Place of Birth.
                - **Planetary Placements:** Sun, Moon, Ascendant, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. For each, describe its sign and house placement and its general influence on personality and life areas.
                - **Major Aspects:** Briefly interpret key aspects between planets (e.g., conjunctions, oppositions, squares, trines, sextiles), highlighting their dynamic impact.
                - **House Interpretations:** Describe the general significance of each of the 12 houses and how the planets placed within them might influence those life areas.
                - **Elemental & Modal Balance:** Briefly discuss the balance of elements (Fire, Earth, Air, Water) and modalities (Cardinal, Fixed, Mutable) in the chart and what it suggests about their temperament.
                - **General Life Path & Destiny:** Provide an overarching summary of their life purpose, challenges, strengths, and areas of growth based on the complete chart.
                Maintain an inspiring, insightful, and mystical tone. Format the output using **Markdown** with clear, bold headings for each section (e.g., "## The Cosmic Core: Sun, Moon & Ascendant", "### Planetary Interpretations"), use bullet points for lists, and bold text for emphasis.`;
            }
            
            const result = await window.model.generateContent(astrologyPrompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

            // Append the fixed disclaimer AFTER the AI-generated content
            const disclaimerText = `**Important Note:** This report is generated by an AI based on vast astrological knowledge and patterns. It provides interpretive insights and symbolic guidance. Please note: This AI provides interpretations based on astrological principles and data. It does not perform real-time astronomical calculations or generate visual birth charts (Lagna Kundalis/Western Wheels). For precise calculations and visual charts, it is recommended to consult a professional astrologer or specialized software.`;
            const disclaimerP = document.createElement('p');
            disclaimerP.classList.add('ai-disclaimer');
            disclaimerP.innerHTML = marked.parse(disclaimerText); // Parse disclaimer for markdown like bold
            reportContentDiv.appendChild(disclaimerP);


            astrologyReportOutput.querySelector('.download-pdf-btn').classList.remove('hidden');
            
            // Store the generated report content for chat context
            lastGeneratedReportInfo = {
                type: 'astrology',
                name: name,
                dob: dob,
                tob: tob,
                place: place,
                system: astroSystem,
                reportContent: text // Store the full markdown content
            };

        } catch (error) {
            console.error('Error generating astrology report:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate report. Please try again. (Error: API communication issue)</p>';
            astrologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden');
            lastGeneratedReportInfo = null; // Clear context on error
        }
    });

    // --- Numerology Report Generation ---
    numerologyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nume-name').value;
        const dob = document.getElementById('nume-dob').value;
        const numeType = document.getElementById('nume-type').value;

        const reportContentDiv = numerologyReportOutput.querySelector('.report-content');
        reportContentDiv.innerHTML = '<p>Deciphering your numerical destiny... Please wait.</p>';
        numerologyReportOutput.classList.add('active');
        numerologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden'); // Hide download button during generation

        try {
            const prompt = `Generate a detailed ${numeType} numerology report for ${name}, born on ${dob}. 
            Calculate and interpret the Life Path Number, Destiny Number (Expression Number), and Soul Urge Number (Heart's Desire Number). 
            Explain what each number means for their personality, talents, challenges, and purpose in life. 
            Provide the calculation steps briefly for each number if possible, or just the resulting number and its interpretation. 
            Maintain an insightful and ancient tone, reflecting the wisdom of numbers. Format the output using **Markdown** with clear headings for each section (e.g., "## Life Path Number", "## Destiny Number", use bullet points for lists, and bold text for emphasis).`;

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

            // Append the fixed disclaimer AFTER the AI-generated content for numerology too
            const disclaimerText = `**Important Note:** This report is generated by an AI based on vast numerological knowledge and patterns. It provides interpretive insights and symbolic guidance. For precise numerical analysis, consulting a professional numerologist is recommended, as this AI does not perform live calculations or generate visual charts.`;
            const disclaimerP = document.createElement('p');
            disclaimerP.classList.add('ai-disclaimer');
            disclaimerP.innerHTML = marked.parse(disclaimerText); // Parse disclaimer for markdown like bold
            reportContentDiv.appendChild(disclaimerP);

            numerologyReportOutput.querySelector('.download-pdf-btn').classList.remove('hidden');
            
            // Store the generated report content for chat context
            lastGeneratedReportInfo = {
                type: 'numerology',
                name: name,
                dob: dob,
                reportContent: text
            };

        } catch (error) {
            console.error('Error generating numerology report:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate report. Please try again. (Error: API communication issue)</p>';
            numerologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden');
            lastGeneratedReportInfo = null; // Clear context on error
        }
    });

    // --- Daily Horoscope Generation ---
    const getZodiacSign = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1; // Months are 0-indexed

        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
        return "Unknown";
    };

    dailyHoroscopeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dob = document.getElementById('horo-dob').value;
        const zodiacSign = getZodiacSign(dob);
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const reportContentDiv = dailyHoroscopeOutput.querySelector('.report-content');
        reportContentDiv.innerHTML = '<p>Consulting the stars for your daily forecast... Please wait.</p>';
        dailyHoroscopeOutput.classList.add('active');

        if (zodiacSign === "Unknown") {
            reportContentDiv.innerHTML = '<p class="error-message">Please enter a valid date of birth to determine your Zodiac sign.</p>';
            return;
        }

        try {
            const prompt = `Generate a concise and inspiring daily horoscope for a ${zodiacSign} for today, ${today}. Focus on general themes like career, relationships, and well-being. Make it feel mystical and encouraging. Format the output using **Markdown** with a bold heading for the sign and today's date, and use bullet points or paragraphs for insights.`;

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

        } catch (error) {
            console.error('Error generating daily horoscope:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate horoscope. Please try again. (Error: API communication issue)</p>';
        }
    });

    // --- Tarot Reading Generation ---
    tarotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = document.getElementById('tarot-question').value;

        const reportContentDiv = tarotOutput.querySelector('.report-content');
        reportContentDiv.innerHTML = '<p>Drawing the cards of destiny... Please wait.</p>';
        tarotOutput.classList.add('active');

        try {
            const prompt = `You are performing a 3-card Tarot reading (Past/Situation, Present/Challenge, Future/Guidance) for the user's question: "${question}".
            Randomly "select" three plausible Tarot cards (Major or Minor Arcana, indicate if reversed). For each card, provide its name, whether it's reversed, and a brief mystical interpretation relevant to its position (Past, Present, Future).
            Conclude with a concise overall message or guidance.
            Maintain an mystical and insightful tone. Format the output using **Markdown** with clear, bold headings for each card and the overall message. Use bullet points for interpretations if helpful.`;

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

        } catch (error) {
            console.error('Error generating tarot reading:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to perform reading. Please try again. (Error: API communication issue)</p>';
        }
    });

    // --- Floating AI Chat Assistant ---
    chatBubble.addEventListener('click', async () => {
        floatingChatModal.classList.toggle('hidden');
        if (!floatingChatModal.classList.contains('hidden')) {
            floatingChatInput.focus();

            // Get chat session or initialize a new one if needed
            const chatSession = await getChatSession();

            // Only add initial bot greeting if starting a fresh chat within the UI
            // This is purely UI, not sent to Gemini history.
            // Check if UI is also empty (no child messages, including any initial ones from previous session opens)
            if (conversationHistory.length === 0 && floatingChatMessages.children.length === 0) { 
                const initialBotGreeting = `Hello! I am AstroMaestro AI, your cosmic guide. How may I assist you today regarding mystical knowledge?
                You can ask me about:
                - Your generated reports
                - Astrological concepts (e.g., "What is a retrograde?")
                - Numerological meanings
                - Or simply "What's my daily horoscope?"`;
                
                const initialBotMsgDiv = document.createElement('div');
                initialBotMsgDiv.classList.add('message', 'bot-message', 'intro-message');
                initialBotMsgDiv.innerHTML = marked.parse(initialBotGreeting);
                floatingChatMessages.appendChild(initialBotMsgDiv);

                // If a report was just generated, send a hidden message to Gemini to prime its context
                if (lastGeneratedReportInfo) {
                    let reportSummary = `The user recently generated a ${lastGeneratedReportInfo.type} report. `;
                    if (lastGeneratedReportInfo.type === 'astrology') {
                        reportSummary += `It was for ${lastGeneratedReportInfo.name} born on ${lastGeneratedReportInfo.dob} at ${lastGeneratedReportInfo.tob} in ${lastGeneratedReportInfo.place}, using ${lastGeneratedReportInfo.system} system. `;
                    } else if (lastGeneratedReportInfo.type === 'numerology') {
                        reportSummary += `It was for ${lastGeneratedReportInfo.name} born on ${lastGeneratedReportInfo.dob}. `;
                    }
                    // Truncate the report content to stay within token limits for history
                    const truncatedReport = lastGeneratedReportInfo.reportContent.substring(0, 5000) + (lastGeneratedReportInfo.reportContent.length > 5000 ? "\n...(Report truncated for brevity in chat context)..." : "");
                    reportSummary += `The full content of this report is provided below for context in any follow-up questions the user might have about it:\n\n${truncatedReport}`;
                    
                    // Send this as a user message that doesn't get displayed (effectively system instruction)
                    // This will be part of the chatSession's history
                    try {
                        await chatSession.sendMessage(reportSummary);
                        console.log("Report context successfully sent to Gemini history.");
                    } catch (error) {
                        console.error("Error sending report context to Gemini:", error);
                        // Optionally, add a visible message if context fails to send
                        const contextErrorMsgDiv = document.createElement('div');
                        contextErrorMsgDiv.classList.add('message', 'bot-message', 'intro-message');
                        contextErrorMsgDiv.innerHTML = `<em>Apologies, I couldn't load the full context of your last report for this chat due to a technical issue. You can still ask general questions!</em>`;
                        floatingChatMessages.appendChild(contextErrorMsgDiv);
                    }
                }
            }
            
            // Render any actual conversation history (from API interaction)
            renderChatMessages(); 
            floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
        }
    });

    closeChatModalBtn.addEventListener('click', () => {
        floatingChatModal.classList.add('hidden');
    });

    floatingChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = floatingChatInput.value.trim();
        if (!userMessage) return;

        // Add user message to UI
        const userMsgDiv = document.createElement('div');
        userMsgDiv.classList.add('message', 'user-message');
        userMsgDiv.textContent = userMessage; // Use textContent for user input to prevent XSS
        floatingChatMessages.appendChild(userMsgDiv);
        floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;

        floatingChatInput.value = '';

        // Add enhanced typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        typingIndicator.innerHTML = 'AstroMaestro AI is thinking<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        floatingChatMessages.appendChild(typingIndicator);
        floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;

        try {
            const chatSession = await getChatSession();

            // Add user message to chatSession history for API call
            conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

            const result = await chatSession.sendMessage(userMessage); // Gemini uses its internal history for context
            const response = await result.response;
            const botReply = response.text();

            // REMOVE TYPING INDICATOR *BEFORE* UPDATING AND RENDERING
            // Ensure the typing indicator is still in the DOM before attempting to remove it
            if (floatingChatMessages.contains(typingIndicator)) {
                floatingChatMessages.removeChild(typingIndicator);
            }

            // Update the local conversationHistory with the new bot reply
            conversationHistory.push({ role: 'model', parts: [{ text: botReply }] });

            // Re-render all messages (including the new bot reply)
            renderChatMessages();

        } catch (error) {
            console.error('Error in chat assistant:', error);
            // Ensure typing indicator is removed even on error
            if (floatingChatMessages.contains(typingIndicator)) {
                floatingChatMessages.removeChild(typingIndicator);
            }
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.classList.add('message', 'bot-message');
            errorMsgDiv.innerHTML = '<em>Apologies, I encountered a cosmic disturbance. Please try again.</em>';
            floatingChatMessages.appendChild(errorMsgDiv);
            floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
        }
    });

    // --- PDF Download Functionality ---
    window.downloadPdf = async (reportType) => {
        let contentDivId, templateDivId, filename;
        if (reportType === 'astrology') {
            contentDivId = 'astrology-report-output';
            templateDivId = 'astrology-pdf-template';
            filename = 'AstroMaestro_Astrology_Report.pdf';
        } else if (reportType === 'numerology') {
            contentDivId = 'numerology-report-output';
            templateDivId = 'numerology-pdf-template';
            filename = 'AstroMaestro_Numerology_Report.pdf';
        } else {
            return;
        }

        const reportOutputHTML = document.getElementById(contentDivId).querySelector('.report-content').innerHTML;
        const pdfTemplate = document.getElementById(templateDivId);
        pdfTemplate.querySelector('.pdf-content').innerHTML = reportOutputHTML;

        // Temporarily make the template visible off-screen for html2canvas to render
        pdfTemplate.classList.remove('hidden'); 
        pdfTemplate.style.display = 'block';
        pdfTemplate.style.position = 'absolute';
        pdfTemplate.style.left = '-9999px';
        pdfTemplate.style.width = '210mm'; // Ensure A4 width for rendering
        pdfTemplate.style.minHeight = '297mm'; // Ensure A4 height for rendering

        try {
            const canvas = await html2canvas(pdfTemplate, {
                scale: 3, // Increased scale for better resolution in PDF
                useCORS: true,
                logging: false,
                imageTimeout: 15000 // Increase timeout for images to load (in milliseconds)
            });

            console.log('html2canvas output dimensions: ', canvas.width, 'x', canvas.height);

            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error("html2canvas produced a canvas with zero dimensions. This often means images failed to load or the element had no computable size.");
            }

            // Re-hide the template (original display:none will be applied by the class)
            pdfTemplate.style.display = 'none'; // Set to none immediately, then re-add hidden class
            pdfTemplate.style.position = 'static';
            pdfTemplate.classList.add('hidden'); // Re-add the hidden class
            pdfTemplate.style.width = ''; // Reset width
            pdfTemplate.style.minHeight = ''; // Reset min-height

            const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG with 90% quality
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

            const imgWidth = pdf.internal.pageSize.getWidth(); // A4 width in mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Height of the image stretched to A4 width

            console.log('PDF addImage dimensions: ', imgWidth, 'x', imgHeight);

            if (isNaN(imgWidth) || isNaN(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
                 throw new Error("Calculated PDF image dimensions are invalid (zero, negative, or NaN).");
            }


            let heightLeft = imgHeight;
            let position = 0; // Tracks the current Y offset for adding image slice

            // First page
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position = position - pageHeight; // Shift the position up by one page height
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
            console.log("PDF generated successfully!");

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF. Please try again or check console for details. Error: ${error.message || error}`);
        } finally {
             // Ensure template is hidden even on error, and hidden class is back
            pdfTemplate.style.display = 'none';
            pdfTemplate.style.position = 'static';
            pdfTemplate.classList.add('hidden'); // Ensure hidden class is added back
            pdfTemplate.style.width = ''; // Reset width
            pdfTemplate.style.minHeight = ''; // Reset min-height
        }
    };
});