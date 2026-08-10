const form = document.getElementById("resumeForm");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Show loading message
    loading.style.display = "block";
    result.innerHTML = "";

    // Get form data
    const formData = new FormData(form);

    try {

        // Send resume and job description to Python
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // Hide loading
        loading.style.display = "none";

        if (data.error) {

            result.innerHTML = `
                <p><strong>Error:</strong> ${data.error}</p>
            `;

        } else {

            result.innerHTML = `
                <h2>📊 Resume Analysis</h2>
                <br>
                <div>${data.result}</div>
            `;
        }

    } catch (error) {

        loading.style.display = "none";

        result.innerHTML = `
            <p>
                ❌ Something went wrong.
                Please make sure the Python server is running.
            </p>
        `;

        console.error(error);
    }

});
