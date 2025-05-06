// Initialize Gemini API configuration
const GEMINI_API_KEY = "KEY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function generateNotes(subject, topic, semester) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate detailed, structured academic notes on the following:\n\nSubject: ${subject}\nTopic: ${topic}\nSemester: ${semester}\n\nThe notes should include:\n\n1. A clear introduction to the topic with background context\n2. Key concepts, definitions, and explanations\n3. Advantages and disadvantages of the topic\n4. Applications and real-world uses\n5. Additional insights and tips for students\n6. Technical terms glossary`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`
            );
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('400')) {
            return 'Error: Invalid request. Please check the API configuration.';
        }
        return 'Failed to generate notes. Please try again.';
    }
}

async function handleSearch(e) {
    e.preventDefault();
    const selects = document.querySelectorAll('select');
    const inputs = document.querySelectorAll('input');
    let selections = {};
    
    // Get values from select elements
    selects.forEach(select => {
        selections[select.previousElementSibling.textContent.toLowerCase()] = select.value;
    });

    // Get values from input elements
    inputs.forEach(input => {
        selections[input.placeholder.toLowerCase().replace('enter ', '')] = input.value;
    });

    // Validate input
    if (!selections.subject || !selections.topic || !selections.semester) {
        alert('Please fill in all required fields');
        return;
    }

    // Show results section and loading state
    const resultsSection = document.getElementById('searchResults');
    const resultText = document.getElementById('resultText');
    resultsSection.classList.remove('hidden');
    resultText.innerHTML = '<div class="loading">Generating notes...</div>';
    
    try {
        const notes = await generateNotes(
            selections.subject,
            selections.topic,
            selections.semester
        );
        
        // Format and display the notes with better styling
        const formattedNotes = notes
            .split('\n\n')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\d\.\s/g, '<br><strong>$&</strong>')
            .replace(/•\s/g, '<br>• ');

        resultText.innerHTML = `
            <div class="notes-container" id="notesContent">
                <div class="notes-header">
                    <h2>${selections.subject} - ${selections.topic}</h2>
                    <button onclick="downloadPDF()" class="download-btn">Download PDF</button>
                </div>
                <div class="notes-content">
                    ${formattedNotes}
                </div>
            </div>
        `;
    } catch (error) {
        resultText.innerHTML = '<div class="error">Failed to generate notes. Please try again.</div>';
        console.error('Error:', error);
    }
}

// Add the download function
function downloadPDF() {
    const element = document.getElementById('notesContent');
    const filename = 'academic-notes.pdf';
    
    const opt = {
        margin: 1,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// Add event listener when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
});
