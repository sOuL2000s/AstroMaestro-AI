document.addEventListener('DOMContentLoaded', () => {
    const astrologyForm = document.getElementById('astrology-form');
    const numerologyForm = document.getElementById('numerology-form');
    const chatForm = document.getElementById('chat-form');
    const astrologyReportOutput = document.getElementById('astrology-report-output');
    const numerologyReportOutput = document.getElementById('numerology-report-output');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');

    // Function to switch sections
    window.showSection = (sectionId) => {
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    };

    // Initialize the first section as active
    showSection('astrology-section');

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
            Maintain an inspiring, insightful, and mystical tone. Format the output using **Markdown** with clear, bold headings for each section (e.g., "## The Cosmic Core: Sun, Moon & Ascendant", "### Planetary Interpretations"), use bullet points for lists, and bold text for emphasis.
            **IMPORTANT NOTE:** This report is generated by an AI based on vast astrological knowledge and patterns. It provides interpretive insights and symbolic guidance. For precise astrological calculations (e.g., exact degrees, specific Dasha periods, precise house cusps), consulting a professional astrologer with specialized software is recommended, as this AI does not perform live astronomical calculations or generate visual charts.
            `;

            const result = await window.model.generateContent(astrologyPrompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);
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
            numerologyReportOutput.querySelector('.download-pdf-btn').classList.remove('hidden');

        } catch (error) {
            console.error('Error generating numerology report:', error);
            reportContentDiv.innerHTML = '<p class="error-message">Failed to generate report. Please try again. (Error: API communication issue)</p>';
            numerologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden');
        }
    });

    // --- AI Chat Assistant ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const userMsgDiv = document.createElement('div');
        userMsgDiv.classList.add('message', 'user-message');
        userMsgDiv.textContent = userMessage;
        chatMessages.appendChild(userMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message');
        typingIndicator.innerHTML = '<em>AstroMaestro AI is thinking...</em>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const prompt = `You are AstroMaestro AI, an expert and mystical guide in astrology and numerology. Provide concise, helpful, and insightful answers. If the question is about a personal report, assume they are asking about a report they just generated (though you don't have direct memory of it, phrase it generally). Format your response using **Markdown** (e.g., bold for keywords, bullet points for lists if applicable).
            User's question: "${userMessage}"`;

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const botReply = response.text();

            chatMessages.removeChild(typingIndicator);

            const botMsgDiv = document.createElement('div');
            botMsgDiv.classList.add('message', 'bot-message');
            botMsgDiv.innerHTML = marked.parse(botReply);
            chatMessages.appendChild(botMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error('Error in chat assistant:', error);
            chatMessages.removeChild(typingIndicator);
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.classList.add('message', 'bot-message');
            errorMsgDiv.innerHTML = '<em>Apologies, I encountered a cosmic disturbance. Please try again.</em>';
            chatMessages.appendChild(errorMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
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
        pdfTemplate.style.display = 'block';
        pdfTemplate.style.position = 'absolute';
        pdfTemplate.style.left = '-9999px';

        try {
            const canvas = await html2canvas(pdfTemplate, {
                scale: 3, // Increased scale for better resolution in PDF
                useCORS: true, // Keep this, useful for other external resources if any
                // allowTaint: true, // Uncomment FOR TESTING ONLY if you suspect CORS issues with images. DO NOT use in production for security reasons.
                logging: false // Disable logging for cleaner console
            });

            // Re-hide the template
            pdfTemplate.style.display = 'none';
            pdfTemplate.style.position = 'static';

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Height of the image stretched to A4 width

            let heightLeft = imgHeight;
            let position = 0; // Tracks the current Y offset for adding image slice

            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position = position - pageHeight; // Shift the position up by one page height
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again or check console for details.');
        } finally {
             // Ensure template is hidden even on error
            pdfTemplate.style.display = 'none';
            pdfTemplate.style.position = 'static';
        }
    };
});