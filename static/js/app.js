
const $ = (id) => document.getElementById(id);

const subject = $("subject");
const message = $("message");
const analyze = $("analyze-btn");


// ==========================================
// CHARACTER COUNTER
// ==========================================

function updateCount() {
    const total = subject.value.length + message.value.length;

    $("char-count").textContent =
        `${total.toLocaleString()} characters`;
}

subject.addEventListener("input", updateCount);
message.addEventListener("input", updateCount);


// ==========================================
// CLEAR EMAIL
// ==========================================

$("clear-btn").addEventListener("click", () => {

    subject.value = "";
    message.value = "";

    updateCount();

    $("result-content").classList.add("hidden");
    $("error-box").classList.add("hidden");
    $("result-empty").classList.remove("hidden");

});


// ==========================================
// SAMPLE EMAILS
// ==========================================

document.querySelectorAll(".sample").forEach((btn) => {

    btn.addEventListener("click", () => {

        if (btn.dataset.sample === "spam") {

            subject.value =
                "Congratulations! You have won a cash prize";

            message.value =
                "Claim your FREE reward now. Limited time offer! " +
                "Click this link immediately to verify your account " +
                "and receive your guaranteed cash bonus. Act now!";

        } else {

            subject.value =
                "Meeting notes for tomorrow";

            message.value =
                "Hi team, sharing the notes from today's meeting. " +
                "Please review the attached agenda and let me know " +
                "if you have any questions. Thanks, Alex.";

        }

        updateCount();

    });

});


// ==========================================
// ERROR DISPLAY
// ==========================================

function showError(text) {

    $("error-box").textContent = text;

    $("error-box").classList.remove("hidden");
    $("result-empty").classList.add("hidden");
    $("result-content").classList.add("hidden");

}


// ==========================================
// EMAIL PREDICTION
// ==========================================

analyze.addEventListener("click", async () => {

    const s = subject.value.trim();
    const m = message.value.trim();

    // Validate input

    if (!s && !m) {

        showError(
            "Please enter a subject or email message before analyzing."
        );

        return;
    }


    // Loading state

    analyze.disabled = true;

    analyze.querySelector("span").textContent =
        "Analyzing…";

    $("error-box").classList.add("hidden");


    try {

        // Send email to Flask backend

        const response = await fetch("/api/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                subject: s,
                message: m
            })

        });


        const data = await response.json();


        // Check response

        if (!response.ok) {

            throw new Error(
                data.error || "Prediction failed."
            );

        }


        // Prediction result

        const spam = data.class_id === 1;


        $("result-empty").classList.add("hidden");

        $("result-content").classList.remove("hidden");


        // Result icon

        $("result-symbol").textContent =
            spam ? "!" : "✓";

        $("result-symbol").classList.toggle(
            "spam",
            spam
        );


        // Result label

        $("result-label").textContent =
            data.prediction;

        $("result-label").classList.toggle(
            "spam",
            spam
        );


        // Result heading

        $("result-title").textContent =
            spam
                ? "This looks like spam."
                : "Looks like a regular email.";


        // Result description

        $("result-description").textContent =
            data.message;


        // Confidence

        const confidence =
            typeof data.confidence === "number"
                ? data.confidence
                : null;


        $("confidence-value").textContent =
            confidence === null
                ? "Not available"
                : `${(confidence * 100).toFixed(1)}%`;


        // Confidence progress bar

        $("confidence-meter").style.width =
            confidence === null
                ? "0%"
                : `${confidence * 100}%`;


        $("confidence-meter").classList.toggle(
            "spam",
            spam
        );


        // Character count

        $("result-length").textContent =
            data.analyzed_characters.toLocaleString();


    } catch (err) {

        showError(
            err.message ||
            "Unable to contact the prediction service."
        );

    } finally {

        // Restore button

        analyze.disabled = false;

        analyze.querySelector("span").textContent =
            "Analyze email";

    }

});


// ==========================================
// ANALYZE ANOTHER EMAIL
// ==========================================

$("analyze-again").addEventListener("click", () => {

    $("result-content").classList.add("hidden");

    $("result-empty").classList.remove("hidden");

    $("error-box").classList.add("hidden");

    message.focus();

});


// ==========================================
// INITIALIZE
// ==========================================

updateCount();
