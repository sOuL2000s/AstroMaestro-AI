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
    // Ensure this path matches the src in your index.html image tags
    preloadImage('logo.png').catch(() => {
        // Optionally, handle the error if the image fails to load during preload
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
            // Removed the AI-generated disclaimer from the prompt.

            const result = await window.model.generateContent(astrologyPrompt);
            const response = await result.response;
            const text = response.text();

            reportContentDiv.innerHTML = marked.parse(text);

            // Append the fixed disclaimer AFTER the AI-generated content
            const disclaimerText = `**Important Note:** This report is generated by an AI based on vast astrological knowledge and patterns. It provides interpretive insights and symbolic guidance. For precise astrological calculations (e.g., exact degrees, specific Dasha periods, precise house cusps) or a visual chart representation, consulting a professional astrologer with specialized software is recommended, as this AI does not perform live astronomical calculations or generate visual charts.`;
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

        // *** IMPORTANT CHANGES START HERE ***
        // 1. Temporarily make the template visible off-screen for html2canvas to render
        // Remove the 'hidden' class with !important to allow display:block to work
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

            // Diagnostic: Log canvas dimensions before converting to image data
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

            // Diagnostic: Log calculated image dimensions for PDF
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