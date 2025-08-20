document.addEventListener('DOMContentLoaded', () => {
    const astrologyForm = document.getElementById('astrology-form');
    const numerologyForm = document.getElementById('numerology-form');
    const dailyHoroscopeForm = document.getElementById('daily-horoscope-form');
    const tarotForm = document.getElementById('tarot-form');

    const astrologyReportOutput = document.getElementById('astrology-report-output');
    const numerologyReportOutput = document.getElementById('numerology-report-output');
    const dailyHoroscopeOutput = document.getElementById('daily-horoscope-output');
    const tarotOutput = document.getElementById('tarot-output');

    // Floating Chat Elements
    const chatBubble = document.getElementById('chat-bubble');
    const floatingChatModal = document.getElementById('floating-chat-modal');
    const closeChatModalBtn = document.getElementById('close-chat-modal-btn');
    const floatingChatMessages = document.getElementById('floating-chat-messages');
    const floatingChatInput = document.getElementById('floating-chat-input');
    const floatingChatForm = document.getElementById('floating-chat-form');


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
            let astrologyPrompt = `Generate a comprehensive ${astroSystem} astrological birth chart report for ${name}, born on ${dob} at ${tob} in ${place}.`;

            if (astroSystem === 'Vedic') {
                astrologyPrompt += `
                This report should adhere to Vedic (Indian) astrological principles. Include detailed interpretations for:
                - **Planetary Placements (Grahas):** Sun (Surya), Moon (Chandra), Mars (Mangal), Mercury (Budha), Jupiter (Guru), Venus (Shukra), Saturn (Shani), Rahu, and Ketu. For each planet, describe its sign (Rashi) and house (Bhava) placement and its general influence on personality and life areas.
                - **Ascendant (Lagna):** Interpret the rising sign and its profound impact on temperament and physical appearance.
                - **Nakshatras:** For the Moon and Sun, identify their Nakshatra and provide a brief interpretation of its significance.
                - **House (Bhava) Interpretations:** Briefly describe the general significance of each of the 12 houses (Dharmasthanas, Arthasthanas, Kamasthanas, Mokshasthanas) and how the planets placed within them might influence those life areas.
                - **Yogas (Planetary Combinations):** Identify and briefly interpret any prominent beneficial or challenging Yogas formed by planetary combinations (e.g., Dhana Yoga, Raja Yoga, Kemadruma Yoga, Shakata Yoga), if applicable.
                - **General Life Path & Destiny:** Provide an overarching summary of their life purpose, challenges, strengths, and areas of growth based on the complete chart.
                `;
            } else { // Western Astrology
                astrologyPrompt += `
                This report should adhere to Western astrological principles. Include detailed interpretations for:
                - **Planetary Placements:** Sun, Moon, Ascendant, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. For each, describe its sign and house placement and its general influence on personality and life areas.
                - **Major Aspects:** Briefly interpret key aspects between planets (e.g., conjunctions, oppositions, squares, trines, sextiles), highlighting their dynamic impact.
                - **House Interpretations:** Describe the general significance of each of the 12 houses and how the planets placed within them might influence those life areas.
                - **Elemental & Modal Balance:** Briefly discuss the balance of elements (Fire, Earth, Air, Water) and modalities (Cardinal, Fixed, Mutable) in the chart and what it suggests about their temperament.
                - **General Life Path & Destiny:** Provide an overarching summary of their life purpose, challenges, strengths, and areas of growth based on the complete chart.
                `;
            }

            astrologyPrompt += `
            Maintain an inspiring, insightful, and mystical tone. Format the output using **Markdown** with clear, bold headings for each section (e.g., "## The Cosmic Core: Sun, Moon & Ascendant", "### Planetary Interpretations"), use bullet points for lists, and bold text for emphasis.`;
            
            const result = await window.model.generateContent(astrologyPrompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

            // Append the fixed disclaimer AFTER the AI-generated content
            const disclaimerText = `**Important Note:** This report is generated by an AI based on vast astrological knowledge and patterns. It provides interpretive insights and symbolic guidance. For precise astrological calculations (e.g., exact degrees, specific Dasha periods, precise house cusps) or a visual chart representation (like a Lagna Kundali or Western wheel), consulting a professional astrologer with specialized software is recommended, as this AI does not perform live astronomical calculations or generate visual charts.`;
            const disclaimerP = document.createElement('p');
            disclaimerP.classList.add('ai-disclaimer');
            disclaimerP.innerHTML = marked.parse(disclaimerText); // Parse disclaimer for markdown like bold
            reportContentDiv.appendChild(disclaimerP);


            astrologyReportOutput.querySelector('.download-pdf-btn').classList.remove('hidden');

        } catch (error) {
            console.error('Error generating astrology report:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate report. Please try again. (Error: API communication issue)</p>';
            astrologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden');
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

        } catch (error) {
            console.error('Error generating numerology report:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate report. Please try again. (Error: API communication issue)</p>';
            numerologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden');
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
    chatBubble.addEventListener('click', () => {
        floatingChatModal.classList.toggle('hidden');
        if (!floatingChatModal.classList.contains('hidden')) {
            floatingChatInput.focus(); // Focus input when chat opens
            floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight; // Scroll to bottom
        }
    });

    closeChatModalBtn.addEventListener('click', () => {
        floatingChatModal.classList.add('hidden');
    });

    floatingChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = floatingChatInput.value.trim();
        if (!userMessage) return;

        const userMsgDiv = document.createElement('div');
        userMsgDiv.classList.add('message', 'user-message');
        userMsgDiv.textContent = userMessage;
        floatingChatMessages.appendChild(userMsgDiv);
        floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;

        floatingChatInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message');
        typingIndicator.innerHTML = '<em>AstroMaestro AI is thinking...</em>';
        floatingChatMessages.appendChild(typingIndicator);
        floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;

        try {
            // Updated prompt to make AI more versatile and suggest daily horoscope
            const prompt = `You are AstroMaestro AI, an expert and mystical guide in astrology, numerology, and general mystical knowledge. You can also provide concise daily general horoscopes if asked. Provide concise, helpful, and insightful answers. If the question is about a personal report, phrase it generally as you do not retain memory of specific user reports. Format your response using **Markdown** (e.g., bold for keywords, bullet points for lists if applicable).
            User's question: "${userMessage}"`;

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const botReply = response.text();

            floatingChatMessages.removeChild(typingIndicator);

            const botMsgDiv = document.createElement('div');
            botMsgDiv.classList.add('message', 'bot-message');
            botMsgDiv.innerHTML = marked.parse(botReply);
            floatingChatMessages.appendChild(botMsgDiv);
            floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;

        } catch (error) {
            console.error('Error in chat assistant:', error);
            floatingChatMessages.removeChild(typingIndicator);
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

            const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG with 90% quality
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
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
        }
    };
});