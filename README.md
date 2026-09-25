# 🎓 College Notice Assistant

A browser-based web application that helps college students understand long college notices and converts them into personalized, prioritized action checklists.

---

## How to Run

**No installation or build step required.** This is a pure HTML/CSS/JavaScript application.

1. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
2. The app will launch in **Demo Mode** with sample notices ready to explore.

> **Recommended:** Use VS Code's Live Server extension for the best experience (right-click `index.html` → "Open with Live Server"). This avoids any file:// restrictions with PDF.js.

---

## Features

| Feature | Status |
|---|---|
| Paste notice text | ✅ Working |
| Upload PDF (text-based) | ✅ Working |
| Upload image (OCR) | ✅ Working (Tesseract.js) |
| 4 sample notices | ✅ Included |
| AI analysis (OpenAI) | ✅ Working (requires API key) |
| Demo mode (no API key) | ✅ Working |
| Prioritized checklist (CRITICAL/HIGH/MEDIUM/LOW) | ✅ Working |
| Task completion tracking | ✅ Working |
| Overdue detection | ✅ Working |
| Student profile & personalization | ✅ Working |
| Dashboard with filters | ✅ Working |
| Saved notices | ✅ Working (localStorage) |
| Browser notifications (reminders) | ✅ Implemented (requires permission) |
| Responsive design (mobile) | ✅ Working |

---

## Configuration

### AI Analysis (Optional but Recommended)

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Go to the **Settings** page in the app
3. Paste your API key and click **Save Settings**
4. The app will now use GPT-4o to analyze any notice you paste or upload

> **Note:** Your API key is stored only in your browser's `localStorage`. It is sent directly to OpenAI's API from your browser — it never passes through any server.

### Supported Models
- GPT-4o (default, best quality)
- GPT-4o Mini (faster, cheaper)
- GPT-4 Turbo

---

## Sample Notices

Four sample notices are included for testing:

1. **Mid-Semester Examination Schedule** — exam dates, hall ticket collection, attendance requirements
2. **Fee Payment & Scholarship Application** — fee deadlines with penalties, merit and sports scholarships
3. **Industrial Training / Internship Guidelines** — mandatory 4-week training for 3rd year with multiple deadlines
4. **Cultural Fest UTSAV 2026** — event registration, volunteer applications, hostel permissions

---

## Architecture

```
college-notice-assistant/
├── index.html          ← Single-page app shell, all UI pages
├── assets/
│   ├── style.css       ← All styling (CSS variables, responsive)
│   ├── data.js         ← Sample notices + pre-analyzed demo results
│   ├── storage.js      ← localStorage CRUD (notices, tasks, profile, settings)
│   ├── ai.js           ← PDF extraction, OCR, OpenAI API call, demo fallback
│   └── app.js          ← UI logic, rendering, navigation, dashboard
```

**Libraries (CDN, no install needed):**
- [PDF.js 3.11](https://mozilla.github.io/pdf.js/) — PDF text extraction
- [Tesseract.js 4.1](https://tesseract.projectnaptha.com/) — OCR for image-based notices

---

## Priority Level Guide

| Level | Color | When assigned |
|---|---|---|
| 🔴 CRITICAL | Red | Imminent deadline, or severe consequence (fail, de-registration, expulsion) |
| 🟠 HIGH | Orange | Approaching deadline, or blocks academic/admin progress |
| 🟡 MEDIUM | Yellow | Important task, deadline not immediate |
| 🟢 LOW | Green | Informational, optional, or no deadline |

---

## Development Notes

- No backend, no database, no build step. Runs entirely in the browser.
- All data persists in `localStorage`. Clearing browser data will erase it.
- The OpenAI API call is made directly from the browser (client-side). This is appropriate for personal use. For a production/multi-user deployment, API calls should be proxied through a server to protect the API key.
- Notifications use the browser Notification API. They fire once when the app is opened if a deadline is within the configured threshold.
