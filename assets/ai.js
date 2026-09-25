/**
 * ai.js — AI analysis engine for College Notice Assistant
 *
 * Handles:
 *  1. Text extraction from PDF (via PDF.js CDN — global: pdfjsLib)
 *  2. Text extraction from images (via Tesseract.js CDN — global: Tesseract)
 *  3. Notice analysis via OpenAI API (when key is configured)
 *  4. Demo-mode analysis using pre-analyzed sample data
 */

/* ─────────────────── PDF Text Extraction ─────────────────── */
async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // pdfjsLib is loaded from CDN (pdf.min.js)
        if (typeof pdfjsLib === 'undefined') {
          reject(new Error('PDF library not loaded. Please check your internet connection.'));
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        // Store page count for the status message in app.js
        window.pdf_pageCount = pdf.numPages;

        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          fullText += (pageNum > 1 ? '\n\n' : '') + `--- Page ${pageNum} ---\n${pageText}`;
        }

        const trimmed = fullText.trim();
        if (!trimmed) {
          reject(new Error('No text could be extracted. This PDF may be image-based — try the Image tab and use OCR instead.'));
          return;
        }
        resolve(trimmed);
      } catch (err) {
        reject(new Error('Failed to read PDF: ' + (err.message || String(err))));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsArrayBuffer(file);
  });
}

/* ─────────────────── Image OCR (Tesseract.js) ─────────────── */
async function extractTextFromImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    // Tesseract is loaded from CDN (tesseract.min.js)
    if (typeof Tesseract === 'undefined') {
      reject(new Error('OCR library not loaded. Please check your internet connection.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const worker = await Tesseract.createWorker('eng', 1, {
          logger: (m) => {
            if (!onProgress) return;
            if (m.status === 'recognizing text') {
              onProgress(Math.round(m.progress * 100), 'Reading text from image...');
            } else {
              const labels = {
                'loading tesseract core':       'Loading OCR engine...',
                'loading language traineddata': 'Loading language data...',
                'initializing api':             'Initializing OCR...',
                'initialized api':              'OCR ready...',
              };
              onProgress(null, labels[m.status] || ('OCR: ' + m.status));
            }
          }
        });

        const result = await worker.recognize(e.target.result);
        await worker.terminate();

        const text = (result.data.text || '').trim();
        if (!text) {
          reject(new Error('No text could be read from this image. Ensure the image is clear and well-lit.'));
          return;
        }
        resolve(text);
      } catch (err) {
        reject(new Error('OCR failed: ' + (err.message || String(err))));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
    reader.readAsDataURL(file);
  });
}

/* ─────────────────── System Prompt ─────────────────── */
function buildSystemPrompt() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return `You are an expert college notice analyst. Your job is to read college notices and extract structured, actionable information for students.

Rules you MUST follow:
1. Do NOT invent or assume any information not explicitly present in the notice.
2. If a date, deadline, or eligibility condition is missing or unclear, mark it as "Not specified" or "Uncertain".
3. Preserve the original meaning — do not paraphrase in a way that changes facts.
4. For each task, include the exact excerpt from the notice that supports it.
5. Be precise about who is affected — mention year, department, or section only where explicitly stated.
6. Assign priority based on: urgency (days until deadline), severity of stated consequences, and explicit notice language.

Priority rules:
- CRITICAL: deadline is imminent/already passed, OR notice states severe consequence (fail grade, expulsion, de-registration, loss of eligibility)
- HIGH: deadline approaching within ~2 weeks, OR missing it blocks academic/administrative progress
- MEDIUM: important task with non-immediate deadline
- LOW: informational, optional, or no stated deadline

Today's date for context: ${today}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "string — concise notice title (max 80 chars)",
  "summary": "string — 2-4 sentence summary of what the notice says",
  "whoAffected": "string — who this notice applies to (year, dept, section, eligibility)",
  "changes": "string — what has been announced or changed",
  "importantDates": [
    {
      "date": "string — human-readable date or date range",
      "event": "string — what happens on this date",
      "type": "deadline|action|informational"
    }
  ],
  "tasks": [
    {
      "id": "string — unique short id like t_1, t_2",
      "description": "string — clear, actionable task starting with a verb (e.g. Submit, Collect, Register)",
      "deadline": "string — human-readable deadline, or 'No deadline specified'",
      "deadlineISO": "string — ISO date YYYY-MM-DD of the deadline, or 'none' if unknown",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "importance": "string — why this task matters and consequences of missing it",
      "excerpt": "string — direct quote from the notice supporting this task",
      "affectedGroups": ["array of strings e.g. '3rd year', 'CSE', 'all students'"],
      "applicability": "certain|uncertain"
    }
  ]
}`;
}

/* ─────────────────── OpenAI API Call ─────────────────── */
async function analyzeWithOpenAI(noticeText, apiKey, model) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system',  content: buildSystemPrompt() },
        { role: 'user',    content: `Analyze this college notice and respond ONLY with the JSON structure:\n\n${noticeText}` }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    let errorMsg = `API error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response received from AI. Please try again.');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (parseErr) {
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // Stamp unique IDs on tasks if missing or duplicated
  const seenIds = new Set();
  parsed.tasks = (parsed.tasks || []).map((t, i) => {
    let id = t.id || `t_${i + 1}`;
    if (seenIds.has(id)) id = `${id}_${i}`;
    seenIds.add(id);
    return { ...t, id };
  });

  return parsed;
}

/* ─────────────────── Demo Mode Matcher ─────────────────── */
function findDemoAnalysis(text, noticeTitle) {
  const combined = ((text || '') + ' ' + (noticeTitle || '')).toLowerCase();

  if (combined.includes('examination') || combined.includes('hall ticket') || combined.includes('mid-semester') || combined.includes('mid semester')) {
    return DEMO_ANALYSES['sample_1'];
  }
  if (combined.includes('fee') || combined.includes('scholarship') || combined.includes('registrar')) {
    return DEMO_ANALYSES['sample_2'];
  }
  if (combined.includes('training') || combined.includes('internship') || combined.includes('placement') || combined.includes('industrial')) {
    return DEMO_ANALYSES['sample_3'];
  }
  if (combined.includes('cultural') || combined.includes('utsav') || combined.includes('fest') || combined.includes('festival')) {
    return DEMO_ANALYSES['sample_4'];
  }

  return generateGenericDemoAnalysis(text, noticeTitle);
}

function generateGenericDemoAnalysis(text, noticeTitle) {
  const lines = (text || '').trim().split('\n').filter(l => l.trim());
  const detectedTitle = noticeTitle || lines[0]?.substring(0, 80) || 'College Notice';

  return {
    title: detectedTitle + ' (Demo Analysis)',
    summary: '[DEMO MODE] This is a simulated analysis. Configure an OpenAI API key in Settings → AI Configuration to get real AI-powered analysis. Please review the original notice for accurate details.',
    whoAffected: 'Uncertain — real AI analysis needed for accurate eligibility detection.',
    changes: 'Real AI analysis is required to extract notice content accurately.',
    importantDates: [
      {
        date: 'Not specified (Demo Mode)',
        event: 'Review the original notice for all dates and deadlines',
        type: 'informational'
      }
    ],
    tasks: [
      {
        id: 't_demo_1',
        description: 'Read the full notice carefully and identify all deadlines manually',
        deadline: 'As soon as possible',
        deadlineISO: 'none',
        priority: 'HIGH',
        importance: 'Demo mode cannot extract real task details. Add an API key for AI-powered extraction.',
        excerpt: lines.slice(0, 3).join(' ') || 'No text extracted.',
        affectedGroups: ['all'],
        applicability: 'uncertain'
      },
      {
        id: 't_demo_2',
        description: 'Go to Settings and add your OpenAI API key to enable real analysis',
        deadline: 'No deadline specified',
        deadlineISO: 'none',
        priority: 'MEDIUM',
        importance: 'An API key enables automatic extraction of tasks, dates, and eligibility from any notice.',
        excerpt: 'Navigate to Settings → AI Configuration to add your OpenAI API key.',
        affectedGroups: ['all'],
        applicability: 'certain'
      }
    ]
  };
}

/* ─────────────────── Main Entry Point ─────────────────── */
async function analyzeNoticeText(text, noticeTitle) {
  const settings = getSettings();
  const apiKey = (settings.apiKey || '').trim();

  if (!apiKey) {
    // Demo mode — simulate a small delay for realism
    await new Promise(r => setTimeout(r, 600));
    const result = findDemoAnalysis(text, noticeTitle);
    return { ...result, _demoMode: true };
  }

  // Real AI mode
  return await analyzeWithOpenAI(text, apiKey, settings.model || 'gpt-4o');
}
