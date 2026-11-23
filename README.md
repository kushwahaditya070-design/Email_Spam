# Postmark — Email Spam Detection

A responsive, original doodle-inspired email spam detection web app built with Flask, HTML, CSS and JavaScript. It uses the **uploaded trained Logistic Regression model and its matching TF-IDF vectorizer**.

## Run locally

Python 3.10–3.12 is recommended. The pickle was created with scikit-learn 1.6.1, so the requirements pin that version for compatibility.

```bash
# Windows (PowerShell)
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## API

`POST /api/predict` with JSON:

```json
{"subject":"Optional subject","message":"Email text to classify"}
```

The response contains `prediction` (`SPAM` or `NOT SPAM`), `class_id` (1 or 0), analyzed character count and probability fields when supported by the model. Empty or invalid inputs return a JSON error.

`GET /api/health` reports whether the model service loaded.

## Model and preprocessing

- Algorithm: Logistic Regression
- Input representation: saved `TfidfVectorizer`
- Vectorizer configuration in notebook: `max_features=1000`, `stop_words='english'`
- The notebook's `basic_clean` step strips leading/trailing whitespace and lowercases the text. The API follows that step before vectorization.
- The model bundle contains `model` and `vectorizer`; no model retraining is performed.
- Labels: 0 = Ham / NOT SPAM; 1 = Spam.

The uploaded notebook's held-out test evaluation (1,035 records) reports:
- Accuracy: 97.874%
- Precision: 95.425%
- Recall: 97.333%
- F1: 96.370%
- Confusion matrix: `[[721, 14], [8, 292]]`

These are notebook evaluation results, not a promise of real-world performance.

## Design notes

The visual language uses warm paper tones, blue/pink/yellow accents, and original inline hand-drawn email doodles. The uploaded doodle reference informed the line-art direction. The separate 3D mascot concept is intentionally not used. No real inbox contents or fake message history are shown.

## Data note

The notebook loads its dataset from Hugging Face (`NotShrirang/email-spam-filter`). A separate CSV was not present among the uploaded files, so this deliverable does not fabricate or bundle a dataset. Dashboard metrics are limited to evaluation figures actually saved in the notebook.

## Safety and privacy

- Email input is treated as plain text; it is never rendered as HTML.
- The app does not persist analyzed email text.
- Do not expose this development server publicly without adding production security controls, rate limiting, HTTPS and deployment hardening.
- Model pickle files can execute code when loaded. Only use the supplied trusted model artifact.

## Project structure

```text
Email_Spam_Detection/
├── app.py
├── requirements.txt
├── README.md
├── models/
│   └── email_spam_simple_model.pkl
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    ├── js/app.js
    └── images/doodle-style-reference.jpg
```
