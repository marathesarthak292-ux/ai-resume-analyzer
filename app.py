from flask import Flask, render_template, request, jsonify
import pymupdf
import os
from dotenv import load_dotenv
from google import genai

# Load .env file
load_dotenv(".env", override=True)

# Create Flask app
app = Flask(__name__)

# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file")

# Connect to Gemini API
client = genai.Client(api_key=api_key)


# --------------------------------
# Extract text from PDF
# --------------------------------
def extract_text(pdf_file):

    document = pymupdf.open(
        stream=pdf_file.read(),
        filetype="pdf"
    )

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


# --------------------------------
# Home page
# --------------------------------
@app.route("/")
def home():

    return render_template("index.html")


# --------------------------------
# Resume Analysis
# --------------------------------
@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        # Get uploaded resume
        resume = request.files.get("resume")

        # Get job description
        job_description = request.form.get("job_description")

        # Check resume
        if not resume:

            return jsonify({
                "error": "Please upload a resume PDF."
            }), 400

        # Check job description
        if not job_description:

            return jsonify({
                "error": "Please enter a job description."
            }), 400

        # Extract resume text
        resume_text = extract_text(resume)

        # AI prompt
        prompt = f"""
You are an expert AI Resume Analyzer.

Analyze the following resume against the job description.

========================
RESUME
========================

{resume_text}


========================
JOB DESCRIPTION
========================

{job_description}


========================
ANALYSIS REQUIRED
========================

Give the result in this format:

ATS SCORE:
Give a score from 0 to 100.

JOB MATCH:
Give a percentage from 0 to 100.

STRENGTHS:
- List the candidate's strongest points.

MISSING SKILLS:
- List skills required by the job but missing from the resume.

TECHNICAL SKILLS:
- List technical skills found in the resume.

SOFT SKILLS:
- List soft skills found in the resume.

WEAKNESSES:
- List important weaknesses.

RESUME IMPROVEMENT SUGGESTIONS:
- Give practical suggestions to improve the resume.

FINAL RECOMMENDATION:
- Explain how suitable the candidate is for this job.
"""

        # Send to Gemini
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        # Send result to website
        return jsonify({
            "result": response.text
        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "error": "AI analysis failed: " + str(e)
        }), 500


# --------------------------------
# Start Flask server
# --------------------------------
if __name__ == "__main__":

    print("===================================")
    print("   AI RESUME ANALYZER STARTING")
    print("===================================")
    print("Open: http://127.0.0.1:5000")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )