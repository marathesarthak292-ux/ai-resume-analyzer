const form = document.getElementById("resumeForm");

const result = document.getElementById("result");

const loading = document.getElementById("loading");

const analyzeBtn = document.getElementById("analyzeBtn");

const resumeInput = document.getElementById("resume");

const uploadBox = document.getElementById("uploadBox");

const uploadTitle = document.getElementById("uploadTitle");

const uploadText = document.getElementById("uploadText");

const jobDescription = document.getElementById("job_description");

const charCount = document.getElementById("charCount");


// =========================================================
// CHARACTER COUNTER
// =========================================================

jobDescription.addEventListener("input", function () {

    charCount.textContent =
        `${jobDescription.value.length.toLocaleString()} characters`;

});


// =========================================================
// FILE UPLOAD
// =========================================================

resumeInput.addEventListener("change", function () {

    if (this.files.length > 0) {

        const file = this.files[0];

        if (file.type !== "application/pdf") {

            alert("Please upload a PDF file.");

            this.value = "";

            return;
        }

        uploadTitle.textContent = file.name;

        uploadText.textContent =
            "Resume selected successfully ✓";

        uploadBox.classList.add("selected");

    }

});


// =========================================================
// DRAG & DROP
// =========================================================

["dragenter", "dragover"].forEach(eventName => {

    uploadBox.addEventListener(eventName, function (event) {

        event.preventDefault();

        uploadBox.classList.add("dragover");

    });

});


["dragleave", "drop"].forEach(eventName => {

    uploadBox.addEventListener(eventName, function (event) {

        event.preventDefault();

        uploadBox.classList.remove("dragover");

    });

});


uploadBox.addEventListener("drop", function (event) {

    const files = event.dataTransfer.files;

    if (!files.length) return;

    const file = files[0];

    if (file.type !== "application/pdf") {

        alert("Only PDF files are supported.");

        return;
    }

    resumeInput.files = files;

    uploadTitle.textContent = file.name;

    uploadText.textContent =
        "Resume selected successfully ✓";

});


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// =========================================================
// FORMAT AI TEXT
// =========================================================

function formatAIText(text) {

    let html = escapeHTML(text);

    // Bold markdown
    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Convert markdown bullets
    html = html.replace(
        /^\s*[-•]\s+(.*)$/gm,
        "<li>$1</li>"
    );

    // Convert numbered lists
    html = html.replace(
        /^\s*\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );

    // Convert headings ending with :
    html = html.replace(
        /^([A-Z][A-Z\s&-]{3,}):$/gm,
        "<h4>$1</h4>"
    );

    // Line breaks
    html = html.replace(
        /\n{2,}/g,
        "<br><br>"
    );

    html = html.replace(
        /\n/g,
        "<br>"
    );

    return html;
}


// =========================================================
// EXTRACT SCORE
// =========================================================

function extractScore(text, type) {

    let pattern;

    if (type === "ats") {

        pattern =
            /ATS\s*SCORE\s*:?\s*(\d{1,3})\s*(?:\/\s*100|%?)/i;

    } else {

        pattern =
            /JOB\s*MATCH\s*:?\s*(\d{1,3})\s*(?:\/\s*100|%)/i;

    }

    const match = text.match(pattern);

    if (match) {

        let score = parseInt(match[1]);

        if (score > 100) score = 100;

        return score;
    }

    return null;
}


// =========================================================
// EXTRACT SECTION
// =========================================================

function extractSection(text, title, nextTitles) {

    const escapedTitle =
        title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const nextPattern =
        nextTitles
            .map(t =>
                t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            )
            .join("|");

    const regex = new RegExp(
        escapedTitle +
        "\\s*:?[\\s\\S]*?" +
        "(?=" +
        nextPattern +
        "|$)",
        "i"
    );

    const match = text.match(regex);

    if (!match) return "";

    return match[0]
        .replace(
            new RegExp(
                escapedTitle + "\\s*:?",
                "i"
            ),
            ""
        )
        .trim();
}


// =========================================================
// ANALYSIS CARD
// =========================================================

function createAnalysisCard(
    icon,
    title,
    content,
    full = false
) {

    if (!content) {

        content =
            "No specific information was provided by the AI.";

    }

    return `
        <div class="analysis-card ${full ? "full" : ""}">

            <h3>
                <span>${icon}</span>
                ${title}
            </h3>

            <div class="analysis-content">
                ${formatAIText(content)}
            </div>

        </div>
    `;
}


// =========================================================
// DISPLAY RESULT
// =========================================================

function displayResult(text) {

    const atsScore =
        extractScore(text, "ats");

    const jobMatch =
        extractScore(text, "job");


    const sections = [
        "STRENGTHS",
        "MISSING SKILLS",
        "TECHNICAL SKILLS",
        "SOFT SKILLS",
        "WEAKNESSES",
        "RESUME IMPROVEMENT SUGGESTIONS",
        "FINAL RECOMMENDATION"
    ];

    const strengths =
        extractSection(
            text,
            "STRENGTHS",
            sections.slice(1)
        );

    const missingSkills =
        extractSection(
            text,
            "MISSING SKILLS",
            sections.slice(2)
        );

    const technicalSkills =
        extractSection(
            text,
            "TECHNICAL SKILLS",
            sections.slice(3)
        );

    const softSkills =
        extractSection(
            text,
            "SOFT SKILLS",
            sections.slice(4)
        );

    const weaknesses =
        extractSection(
            text,
            "WEAKNESSES",
            sections.slice(5)
        );

    const suggestions =
        extractSection(
            text,
            "RESUME IMPROVEMENT SUGGESTIONS",
            sections.slice(6)
        );

    const recommendation =
        extractSection(
            text,
            "FINAL RECOMMENDATION",
            []
        );


    result.innerHTML = `

        <div class="result-heading">

            <h2>✦ AI Analysis Results</h2>

            <span>ANALYSIS COMPLETE</span>

        </div>


        <div class="score-grid">

            <div class="score-card">

                <div class="score-label">
                    ATS SCORE
                </div>

                <div class="score-value">
                    ${atsScore !== null ? atsScore + "%" : "--"}
                </div>

                <div class="score-subtitle">
                    Applicant Tracking System compatibility
                </div>

            </div>


            <div class="score-card">

                <div class="score-label">
                    JOB MATCH
                </div>

                <div class="score-value">
                    ${jobMatch !== null ? jobMatch + "%" : "--"}
                </div>

                <div class="score-subtitle">
                    Compatibility with target position
                </div>

            </div>

        </div>


        <div class="analysis-grid">

            ${createAnalysisCard(
                "↗",
                "Strengths",
                strengths
            )}

            ${createAnalysisCard(
                "⚠",
                "Missing Skills",
                missingSkills
            )}

            ${createAnalysisCard(
                "◆",
                "Technical Skills",
                technicalSkills
            )}

            ${createAnalysisCard(
                "●",
                "Soft Skills",
                softSkills
            )}

            ${createAnalysisCard(
                "!",
                "Weaknesses",
                weaknesses
            )}

            ${createAnalysisCard(
                "✦",
                "Resume Improvement Suggestions",
                suggestions,
                true
            )}

            ${createAnalysisCard(
                "✓",
                "Final Recommendation",
                recommendation,
                true
            )}

        </div>

    `;


    result.classList.add("visible");

    result.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =========================================================
// FORM SUBMIT
// =========================================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Validate resume

    if (!resumeInput.files.length) {

        alert("Please upload your resume PDF.");

        return;
    }


    // Validate job description

    if (!jobDescription.value.trim()) {

        alert("Please enter the job description.");

        jobDescription.focus();

        return;
    }


    // Hide previous result

    result.classList.remove("visible");

    result.innerHTML = "";


    // Show loading

    loading.style.display = "block";


    // Disable button

    analyzeBtn.disabled = true;

    analyzeBtn.style.opacity = "0.7";

    analyzeBtn.style.cursor = "not-allowed";


    // Change button text

    analyzeBtn.querySelector(
        ".button-text"
    ).textContent = "Analyzing Resume...";


    const formData = new FormData(form);


    try {

        const response = await fetch(
            "/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok || data.error) {

            throw new Error(
                data.error ||
                "AI analysis failed."
            );

        }


        displayResult(data.result);


    } catch (error) {

        console.error(error);


        result.innerHTML = `

            <div class="error-box">

                <strong>⚠ Analysis Failed</strong>

                <br><br>

                ${escapeHTML(error.message)}

                <br><br>

                Please make sure your Flask server,
                Gemini API key and internet connection
                are working correctly.

            </div>

        `;

        result.classList.add("visible");


    } finally {

        loading.style.display = "none";


        analyzeBtn.disabled = false;

        analyzeBtn.style.opacity = "1";

        analyzeBtn.style.cursor = "pointer";


        analyzeBtn.querySelector(
            ".button-text"
        ).textContent = "Analyze My Resume";

    }

});
