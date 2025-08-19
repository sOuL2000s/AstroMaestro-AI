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

        const reportContentDiv = astrologyReportOutput.querySelector('.report-content');
        reportContentDiv.innerHTML = '<p>Generating your cosmic revelation... Please wait.</p>';
        astrologyReportOutput.classList.add('active');
        astrologyReportOutput.querySelector('.download-pdf-btn').classList.add('hidden'); // Hide download button during generation

        try {
            const prompt = `Generate a full astrological birth chart report for ${name}, born on ${dob} at ${tob} in ${place}. 
            Focus on key planetary placements (Sun, Moon, Ascendant, Mercury, Venus, Mars), their signs and house placements (e.g., "Sun in Aries in 10th House"). 
            Describe the general personality traits, strengths, challenges, and life path indicated by these placements. 
            Do not perform complex calculations or list specific degrees/aspects, but provide interpretations based on common astrological significations. 
            Maintain an inspiring, insightful, and slightly mystical tone. Format the output using **Markdown** with clear headings for each section (e.g., "## The Luminary Core: Sun & Moon", "## The Mind & Heart: Mercury & Venus", use bullet points for lists, and bold text for emphasis).`;
            // ^ IMPORTANT: I've updated the prompt to explicitly ask for Markdown.

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse Markdown to HTML
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
            // ^ IMPORTANT: I've updated the prompt to explicitly ask for Markdown.

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse Markdown to HTML
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

        // Display user message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.classList.add('message', 'user-message');
        userMsgDiv.textContent = userMessage; // User input is plain text
        chatMessages.appendChild(userMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom

        chatInput.value = ''; // Clear input

        // Display "typing" indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message');
        typingIndicator.innerHTML = '<em>AstroMaestro AI is thinking...</em>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const prompt = `You are AstroMaestro AI, an expert and mystical guide in astrology and numerology. Provide concise, helpful, and insightful answers. If the question is about a personal report, assume they are asking about a report they just generated (though you don't have direct memory of it, phrase it generally). Format your response using **Markdown** (e.g., bold for keywords, bullet points for lists if applicable).
            User's question: "${userMessage}"`;
            // ^ IMPORTANT: Updated prompt to ask for Markdown

            const result = await window.model.generateContent(prompt);
            const response = await result.response;
            const botReply = response.text();

            chatMessages.removeChild(typingIndicator); // Remove typing indicator

            const botMsgDiv = document.createElement('div');
            botMsgDiv.classList.add('message', 'bot-message');
            // Parse Markdown to HTML for bot replies
            botMsgDiv.innerHTML = marked.parse(botReply);
            chatMessages.appendChild(botMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom

        } catch (error) {
            console.error('Error in chat assistant:', error);
            chatMessages.removeChild(typingIndicator); // Remove typing indicator
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
        pdfTemplate.querySelector('.pdf-content').innerHTML = reportOutputHTML; // Populate the hidden PDF template with the HTML (already parsed markdown)

        // Temporarily make the template visible for html2canvas to render
        pdfTemplate.style.display = 'block';
        pdfTemplate.style.position = 'absolute';
        pdfTemplate.style.left = '-9999px'; // Move off-screen

        try {
            const canvas = await html2canvas(pdfTemplate, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Needed if you use images from different origins (like Imgur logo)
            });

            // Re-hide the template
            pdfTemplate.style.display = 'none';
            pdfTemplate.style.position = 'static'; // Reset position

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
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