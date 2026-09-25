/**
 * app.js — Main application controller for College Notice Assistant
 */

/* ═══════════════════════════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════════════════════════ */
let currentAnalysis = null;   // Last analyzed notice (unsaved)
let currentRawText  = '';     // Raw text in the input area (from any tab)
let confirmCallback = null;   // For modal confirm action

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadSettingsIntoForm();
  loadProfileIntoForm();
  loadReminderSettings();
  renderSampleList();
  renderDashboard();
  checkDemoMode();
  checkNotifications();
});

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════ */
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const page = document.getElementById(`page-${pageName}`);
  if (page) page.classList.add('active');

  const btn = document.querySelector(`.nav-btn[data-page="${pageName}"]`);
  if (btn) btn.classList.add('active');

  if (pageName === 'dashboard') renderDashboard();
  window.scrollTo(0, 0);
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════════════
   INPUT TABS
═══════════════════════════════════════════════════════════════ */
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

/* ═══════════════════════════════════════════════════════════════
   FILE UPLOAD — PDF
═══════════════════════════════════════════════════════════════ */
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file, type);
}

function handleFileSelect(e, type) {
  const file = e.target.files[0];
  if (file) processFile(file, type);
}

async function processFile(file, type) {
  if (type === 'pdf') {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showStatus('pdfStatus', 'error', '✕ Please select a valid PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showStatus('pdfStatus', 'error', '✕ PDF is too large. Maximum size is 10MB.');
      return;
    }

    showStatus('pdfStatus', '', '⏳ Extracting text from PDF...');
    try {
      const text = await extractTextFromPDF(file);
      currentRawText = text;
      showExtractedPreview(text);
      showStatus('pdfStatus', 'success', `✅ Extracted text from ${file.name} (${pdf_pageCount || 'multiple'} pages)`);
      showToast('PDF loaded', `Text extracted from "${file.name}"`, 'success');
    } catch (err) {
      showStatus('pdfStatus', 'error', '✕ ' + err.message);
      showToast('PDF Error', err.message, 'error');
    }
  } else if (type === 'image') {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showStatus('imgStatus', 'error', '✕ Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus('imgStatus', 'error', '✕ Image is too large. Maximum size is 5MB.');
      return;
    }

    showStatus('imgStatus', '', `⏳ Starting OCR on "${file.name}"...`);
    const ocrProgress = document.getElementById('ocrProgress');
    const ocrFill     = document.getElementById('ocrProgressFill');
    const ocrLabel    = document.getElementById('ocrProgressLabel');
    ocrProgress.style.display = 'block';

    try {
      const text = await extractTextFromImage(file, (pct, label) => {
        if (pct !== null) ocrFill.style.width = pct + '%';
        ocrLabel.textContent = label || '';
      });
      currentRawText = text;
      showExtractedPreview(text);
      ocrProgress.style.display = 'none';
      showStatus('imgStatus', 'success', `✅ OCR complete — text extracted from "${file.name}"`);
      showToast('Image loaded', 'OCR text extraction complete.', 'success');
    } catch (err) {
      ocrProgress.style.display = 'none';
      showStatus('imgStatus', 'error', '✕ ' + err.message);
      showToast('OCR Error', err.message, 'error');
    }
  }
}

function showStatus(elementId, type, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = 'upload-status ' + type;
}

function showExtractedPreview(text) {
  const preview = document.getElementById('extractedPreview');
  const pre     = document.getElementById('extractedText');
  preview.style.display = 'block';
  pre.textContent = text.length > 800 ? text.substring(0, 800) + '\n...(truncated for preview)' : text;
}

function clearExtracted() {
  currentRawText = '';
  document.getElementById('extractedPreview').style.display = 'none';
  document.getElementById('pdfStatus').textContent = '';
  document.getElementById('pdfStatus').className = 'upload-status';
  document.getElementById('imgStatus').textContent = '';
  document.getElementById('imgStatus').className = 'upload-status';
  document.getElementById('pdfInput').value = '';
  document.getElementById('imgInput').value = '';
}

/* ═══════════════════════════════════════════════════════════════
   SAMPLE NOTICES
═══════════════════════════════════════════════════════════════ */
function renderSampleList() {
  const container = document.getElementById('sampleList');
  container.innerHTML = SAMPLE_NOTICES.map(n => `
    <div class="sample-item" onclick="loadSample('${n.id}')">
      <div class="sample-item-icon">${getSampleIcon(n.tags)}</div>
      <div class="sample-item-info">
        <strong>${n.title}</strong>
        <span>${n.description}</span>
      </div>
    </div>
  `).join('');
}

function getSampleIcon(tags) {
  if (tags.includes('exams')) return '📝';
  if (tags.includes('fees') || tags.includes('scholarship')) return '💰';
  if (tags.includes('internship') || tags.includes('training')) return '🏭';
  if (tags.includes('cultural fest') || tags.includes('events')) return '🎭';
  return '📋';
}

function loadSample(sampleId) {
  const sample = SAMPLE_NOTICES.find(n => n.id === sampleId);
  if (!sample) return;

  currentRawText = sample.rawText;
  document.getElementById('noticeTitle').value = sample.title;

  // Switch to text tab and populate it
  switchTab('text');
  document.getElementById('noticeText').value = sample.rawText;

  showToast('Sample loaded', `"${sample.title}" is ready to analyze.`, 'info');
}

/* ═══════════════════════════════════════════════════════════════
   ANALYZE NOTICE
═══════════════════════════════════════════════════════════════ */
async function analyzeNotice() {
  // Determine input source
  const activeTab = document.querySelector('.tab-btn.active')?.dataset?.tab;
  let text = '';

  if (activeTab === 'text') {
    text = document.getElementById('noticeText').value.trim();
  } else {
    text = currentRawText.trim();
  }

  if (!text) {
    showToast('No input', 'Please paste notice text, upload a file, or select a sample.', 'warning');
    return;
  }
  if (text.length < 50) {
    showToast('Too short', 'The notice text seems too short. Please provide the full notice.', 'warning');
    return;
  }

  const noticeTitle = document.getElementById('noticeTitle').value.trim();

  // Update UI to loading state
  setAnalyzeBtnLoading(true);
  showLoadingOverlay('Analyzing notice with AI...');

  try {
    const analysis = await analyzeNoticeText(text, noticeTitle);
    currentAnalysis = { ...analysis, rawText: text, analyzedAt: new Date().toISOString() };
    renderAnalysisResults(currentAnalysis);
    document.getElementById('resultsPanel').style.display = 'block';
    showToast('Analysis complete', `Found ${analysis.tasks?.length || 0} action items.`, 'success');
    if (analysis._demoMode) {
      showToast('Demo Mode', 'Using pre-analyzed data. Add an API key in Settings for real analysis.', 'info');
    }
    // Scroll to results on mobile
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error('Analysis error:', err);
    showToast('Analysis failed', err.message || 'An unexpected error occurred.', 'error');
  } finally {
    setAnalyzeBtnLoading(false);
    hideLoadingOverlay();
  }
}

function setAnalyzeBtnLoading(loading) {
  const btn    = document.getElementById('analyzeBtn');
  const text   = document.getElementById('analyzeBtnText');
  const spinner = document.getElementById('analyzeBtnSpinner');
  btn.disabled       = loading;
  text.style.display    = loading ? 'none' : 'inline';
  spinner.style.display = loading ? 'inline-block' : 'none';
}

/* ═══════════════════════════════════════════════════════════════
   RENDER ANALYSIS RESULTS
═══════════════════════════════════════════════════════════════ */
function renderAnalysisResults(analysis) {
  document.getElementById('resultTitle').textContent = analysis.title || 'Analysis Results';

  // Summary
  document.getElementById('resultSummary').innerHTML = `
    <p>${escapeHtml(analysis.summary || 'No summary available.')}</p>
    ${analysis._demoMode ? '<p style="margin-top:.5rem;color:var(--warning);font-size:.82rem;">⚠️ Demo Mode — Add an OpenAI API key in Settings for real AI analysis.</p>' : ''}
  `;

  // Who is affected
  document.getElementById('resultAffected').innerHTML = `
    <p>${escapeHtml(analysis.whoAffected || 'Not specified')}</p>
    ${analysis.changes ? `<p style="margin-top:.5rem;color:var(--text-muted);font-size:.85rem;"><strong>What changed:</strong> ${escapeHtml(analysis.changes)}</p>` : ''}
  `;

  // Important dates
  const datesEl = document.getElementById('resultDates');
  if (analysis.importantDates && analysis.importantDates.length > 0) {
    datesEl.innerHTML = `
      <ul class="dates-list">
        ${analysis.importantDates.map(d => `
          <li>
            <span class="date-icon">${dateTypeIcon(d.type)}</span>
            <div class="date-info">
              <strong>${escapeHtml(d.date)}</strong>
              <span>${escapeHtml(d.event)}</span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    datesEl.innerHTML = '<p style="color:var(--text-muted)">No specific dates identified.</p>';
  }

  // Checklist
  renderTaskChecklist(analysis.tasks || [], 'resultChecklist');
}

function dateTypeIcon(type) {
  if (type === 'deadline')     return '⏰';
  if (type === 'action')       return '✅';
  if (type === 'informational') return '📅';
  return '📌';
}

function renderTaskChecklist(tasks, containerId) {
  const container = document.getElementById(containerId);
  if (!tasks || tasks.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted)">No action items identified.</p>';
    return;
  }

  // Apply profile-based filtering flags
  const profile = getProfile();
  const enriched = tasks.map(t => ({
    ...t,
    computedStatus: computeTaskStatus(t),
    profileMatch: checkProfileMatch(t, profile)
  }));

  // Sort: overdue → upcoming → by priority → by deadline
  const sorted = sortTasks(enriched);

  container.innerHTML = sorted.map(t => renderTaskCard(t, false)).join('');
}

/* ═══════════════════════════════════════════════════════════════
   TASK CARD RENDERER
═══════════════════════════════════════════════════════════════ */
function renderTaskCard(task, fromStorage = false) {
  const status   = task.computedStatus || computeTaskStatus(task);
  const priority = task.priority || 'MEDIUM';
  const isCompleted = status === 'completed';

  const priorityBadge = `<span class="badge badge-${priority.toLowerCase()}">${priorityEmoji(priority)} ${priority}</span>`;
  const statusBadge = statusBadgeHtml(status, task.isToday, task.isSoon);

  const deadlineHtml = task.deadline && task.deadline !== 'No deadline specified'
    ? `<span class="deadline-label ${deadlineClass(status, task.isToday, task.isSoon)}">📅 ${escapeHtml(task.deadline)}${daysUntilLabel(task.daysUntil)}</span>`
    : `<span class="deadline-label" style="color:var(--text-light)">📅 No deadline specified</span>`;

  const uncertainBadge = task.applicability === 'uncertain'
    ? `<span class="badge badge-uncertain" title="Applicability to you is uncertain based on your profile">⚠️ Uncertain applicability</span>`
    : '';

  const profileMismatch = task.profileMatch === false
    ? `<span class="badge badge-uncertain" title="This task may not apply to your year/department">👤 May not apply to you</span>`
    : '';

  const checkboxAttr = isCompleted ? 'checked' : '';
  const cardId = `task_card_${task.id}`;

  return `
    <div class="task-card priority-${priority} ${isCompleted ? 'completed' : ''}" id="${cardId}">
      <div class="task-top">
        <input type="checkbox" class="task-checkbox" ${checkboxAttr}
          onchange="toggleTaskCompletion('${task.id}', this.checked, ${fromStorage})"
          title="Mark as completed"
        />
        <div class="task-body">
          <div class="task-description">${escapeHtml(task.description)}</div>
          <div class="task-meta">
            ${priorityBadge}
            ${statusBadge}
            ${deadlineHtml}
            ${uncertainBadge}
            ${profileMismatch}
          </div>
        </div>
        <div class="task-actions-right">
          <button class="btn-icon" onclick="toggleTaskDetails('${task.id}')" title="Show details">🔍</button>
        </div>
      </div>
      <div class="task-expand" id="expand_${task.id}">
        <p><strong>Why this matters:</strong> ${escapeHtml(task.importance || 'Not specified')}</p>
        ${task.excerpt ? `
          <p style="margin-top:.6rem"><strong>From the notice:</strong></p>
          <div class="task-notice-excerpt">"${escapeHtml(task.excerpt)}"</div>
        ` : ''}
        ${task.affectedGroups?.length ? `
          <p style="margin-top:.6rem;font-size:.8rem;color:var(--text-muted)">
            <strong>Affects:</strong> ${task.affectedGroups.join(', ')}
          </p>
        ` : ''}
      </div>
    </div>
  `;
}

function priorityEmoji(p) {
  return { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' }[p] || '';
}

function statusBadgeHtml(status, isToday, isSoon) {
  if (status === 'overdue')   return `<span class="badge badge-overdue">⚠️ OVERDUE</span>`;
  if (status === 'completed') return `<span class="badge badge-completed">✅ Completed</span>`;
  if (isToday)                return `<span class="badge badge-today">🔥 Due Today</span>`;
  if (isSoon)                 return `<span class="badge badge-soon">⏱ Due Soon</span>`;
  return `<span class="badge badge-pending">📌 Pending</span>`;
}

function deadlineClass(status, isToday, isSoon) {
  if (status === 'overdue') return 'overdue';
  if (isToday)              return 'today';
  if (isSoon)               return 'soon';
  return '';
}

function daysUntilLabel(days) {
  if (days === null || days === undefined) return '';
  if (days < 0)  return ` (${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue)`;
  if (days === 0) return ' (today)';
  if (days === 1) return ' (tomorrow)';
  return ` (in ${days} days)`;
}

function toggleTaskDetails(taskId) {
  const el = document.getElementById(`expand_${taskId}`);
  if (el) el.classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════════════
   TASK COMPLETION
═══════════════════════════════════════════════════════════════ */
function toggleTaskCompletion(taskId, checked, fromStorage) {
  const newStatus = checked ? 'completed' : 'pending';

  if (fromStorage) {
    // Persist to storage
    updateTaskStatus(taskId, newStatus);
    renderDashboard();
    showToast(
      checked ? 'Task completed! ✅' : 'Task reopened',
      checked ? 'Good job! Keep going.' : 'Task marked as pending again.',
      checked ? 'success' : 'info'
    );
  } else {
    // Just update the in-memory analysis (not yet saved)
    if (currentAnalysis?.tasks) {
      const t = currentAnalysis.tasks.find(t => t.id === taskId);
      if (t) {
        t.status = newStatus;
        t.completedAt = checked ? new Date().toISOString() : null;
      }
    }
    // Update the card appearance
    const card = document.getElementById(`task_card_${taskId}`);
    if (card) {
      const desc = card.querySelector('.task-description');
      if (checked) {
        card.classList.add('completed');
        if (desc) desc.style.textDecoration = 'line-through';
      } else {
        card.classList.remove('completed');
        if (desc) desc.style.textDecoration = '';
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   SAVE NOTICE TO DASHBOARD
═══════════════════════════════════════════════════════════════ */
function saveNotice() {
  if (!currentAnalysis) {
    showToast('Nothing to save', 'Analyze a notice first.', 'warning');
    return;
  }

  const noticeId = generateId('notice');
  const notice = {
    id:          noticeId,
    title:       currentAnalysis.title,
    summary:     currentAnalysis.summary,
    whoAffected: currentAnalysis.whoAffected,
    rawText:     currentAnalysis.rawText,
    analyzedAt:  currentAnalysis.analyzedAt || new Date().toISOString(),
    savedAt:     new Date().toISOString(),
    importantDates: currentAnalysis.importantDates || [],
    _demoMode:   currentAnalysis._demoMode || false
  };

  // Prepare tasks with initial statuses
  const tasks = (currentAnalysis.tasks || []).map(t => ({
    ...t,
    noticeId,
    status: t.status || 'pending',
    completedAt: t.completedAt || null
  }));

  saveNoticeData(notice);
  saveTasksForNotice(noticeId, tasks);

  showToast('Saved! 💾', `"${notice.title}" added to your dashboard.`, 'success');

  // Update save button
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.textContent = '✅ Saved';
    saveBtn.disabled = true;
    saveBtn.style.background = 'var(--success)';
  }
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE MATCHING
═══════════════════════════════════════════════════════════════ */
function checkProfileMatch(task, profile) {
  if (!profile || (!profile.year && !profile.department && !profile.section)) {
    return null; // No profile configured — can't filter
  }

  const groups = (task.affectedGroups || []).map(g => g.toLowerCase());
  if (groups.includes('all') || groups.includes('all students') || groups.includes('all years') || groups.includes('all departments')) {
    return true;
  }

  // Year matching
  const yearMap = {
    '1': ['1st year', 'first year', '1 year', '1st', 'fy'],
    '2': ['2nd year', 'second year', '2 year', '2nd', 'sy'],
    '3': ['3rd year', 'third year', '3 year', '3rd', 'ty'],
    '4': ['4th year', 'fourth year', '4 year', '4th', 'final year'],
    '5': ['5th year', 'fifth year', '5 year', '5th'],
    'pg1': ['pg 1st', 'pg first', 'm.tech', 'mtech', 'pg1', 'mca 1st'],
    'pg2': ['pg 2nd', 'pg second', 'pg2', 'mca 2nd']
  };

  if (profile.year && yearMap[profile.year]) {
    const aliases = yearMap[profile.year];
    const yearMatch = groups.some(g => aliases.some(a => g.includes(a)));
    if (yearMatch) return true;
  }

  // Department matching
  if (profile.department) {
    const dept = profile.department.toLowerCase();
    const deptMatch = groups.some(g =>
      g.includes(dept) ||
      dept.includes(g) ||
      (dept.includes('computer') && (g.includes('cse') || g.includes('cs'))) ||
      (dept.includes('electrical') && (g.includes('eee') || g.includes('ee'))) ||
      (dept.includes('mechanical') && g.includes('mech'))
    );
    if (deptMatch) return true;
  }

  // If we have specific groups but none matched → might not apply
  if (groups.length > 0) {
    return task.applicability === 'uncertain' ? null : false;
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   TASK SORTING
═══════════════════════════════════════════════════════════════ */
function sortTasks(tasks) {
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  return [...tasks].sort((a, b) => {
    const sa = a.computedStatus || 'pending';
    const sb = b.computedStatus || 'pending';

    // Completed goes to bottom
    if (sa === 'completed' && sb !== 'completed') return 1;
    if (sb === 'completed' && sa !== 'completed') return -1;

    // Overdue first
    if (sa === 'overdue' && sb !== 'overdue') return -1;
    if (sb === 'overdue' && sa !== 'overdue') return 1;

    // Then by priority
    const pa = priorityOrder[a.priority] ?? 4;
    const pb = priorityOrder[b.priority] ?? 4;
    if (pa !== pb) return pa - pb;

    // Then by deadline
    const da = a.deadlineISO && a.deadlineISO !== 'none' ? new Date(a.deadlineISO) : new Date('9999-12-31');
    const db = b.deadlineISO && b.deadlineISO !== 'none' ? new Date(b.deadlineISO) : new Date('9999-12-31');
    return da - db;
  });
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const filterPriority = document.getElementById('dashFilterPriority')?.value || '';
  const filterStatus   = document.getElementById('dashFilterStatus')?.value   || '';
  const searchTerm     = document.getElementById('dashSearch')?.value?.toLowerCase() || '';

  const notices  = getNotices();
  let allTasks   = getTasksData();
  const enriched = getEnrichedTasks(allTasks);

  // Apply filters
  let filtered = enriched.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterStatus && t.computedStatus !== filterStatus) return false;
    if (searchTerm) {
      const desc    = (t.description || '').toLowerCase();
      const excerpt = (t.excerpt || '').toLowerCase();
      if (!desc.includes(searchTerm) && !excerpt.includes(searchTerm)) return false;
    }
    return true;
  });

  const sorted = sortTasks(filtered);

  // Stats
  renderStats(enriched);

  // Build sections
  const container = document.getElementById('dashboardContent');

  if (sorted.length === 0 && notices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No notices yet</h3>
        <p>Analyze your first college notice to get started.</p>
        <button class="btn btn-primary" onclick="showPage('analyze')">🔍 Analyze a Notice</button>
      </div>
    `;
    return;
  }

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No tasks match filters</h3>
        <p>Try removing filters or check other sections.</p>
      </div>
    `;
    renderSavedNoticesSection(container, notices, true);
    return;
  }

  let html = '';

  // Overdue
  const overdue = sorted.filter(t => t.computedStatus === 'overdue');
  if (overdue.length > 0) {
    html += sectionHtml('⚠️ Overdue', overdue, 'overdue');
  }

  // Due today
  const dueToday = sorted.filter(t => t.computedStatus !== 'overdue' && t.computedStatus !== 'completed' && t.isToday);
  if (dueToday.length > 0) {
    html += sectionHtml('🔥 Due Today', dueToday, 'today');
  }

  // Due within 7 days (not today, not overdue)
  const dueSoon = sorted.filter(t => t.computedStatus !== 'overdue' && t.computedStatus !== 'completed' && !t.isToday && t.isSoon);
  if (dueSoon.length > 0) {
    html += sectionHtml('⏱ Due Within 7 Days', dueSoon, 'soon');
  }

  // Critical & High pending (not already listed above)
  const highPrio = sorted.filter(t =>
    t.computedStatus === 'pending' &&
    (t.priority === 'CRITICAL' || t.priority === 'HIGH') &&
    !t.isToday && !t.isSoon
  );
  if (highPrio.length > 0) {
    html += sectionHtml('🔴 Critical & High Priority', highPrio, 'high');
  }

  // Other pending
  const otherPending = sorted.filter(t =>
    t.computedStatus === 'pending' &&
    (t.priority === 'MEDIUM' || t.priority === 'LOW') &&
    !t.isToday && !t.isSoon
  );
  if (otherPending.length > 0) {
    html += sectionHtml('📌 All Pending Tasks', otherPending, 'pending');
  }

  // Completed
  const completed = sorted.filter(t => t.computedStatus === 'completed');
  if (completed.length > 0) {
    html += sectionHtml('✅ Completed', completed, 'completed', true);
  }

  container.innerHTML = html;

  // Saved notices
  renderSavedNoticesSection(container, notices, false);
}

function sectionHtml(title, tasks, type, collapsed = false) {
  const sectionId = `section_${type}_${Date.now()}`;
  return `
    <div class="section-header">
      <h2>
        ${title}
        <span class="section-count">${tasks.length}</span>
      </h2>
    </div>
    <div class="task-list" id="${sectionId}">
      ${tasks.map(t => renderTaskCard(t, true)).join('')}
    </div>
  `;
}

function renderSavedNoticesSection(container, notices, append) {
  if (notices.length === 0) return;

  const html = `
    <div class="section-header" style="margin-top:2rem">
      <h2>📁 Saved Notices <span class="section-count">${notices.length}</span></h2>
    </div>
    <div class="notices-grid">
      ${notices.map(n => `
        <div class="notice-card">
          <div class="notice-card-title">${escapeHtml(n.title)}</div>
          <div class="notice-card-summary">${escapeHtml(n.summary || '')}</div>
          <div class="notice-card-meta">
            <span>📅 ${formatDate(n.savedAt)}</span>
            <span>•</span>
            <span>${getTasksByNotice(n.id).length} tasks</span>
            ${n._demoMode ? '<span class="badge badge-uncertain" style="margin-left:auto">Demo</span>' : ''}
          </div>
          <div class="notice-card-actions">
            <button class="btn btn-ghost btn-sm" onclick="viewNoticeDetail('${n.id}')">👁 View</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteNotice('${n.id}', '${escapeHtml(n.title)}')">🗑 Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (append) {
    container.innerHTML += html;
  } else {
    container.innerHTML += html;
  }
}

function renderStats(tasks) {
  const critical = tasks.filter(t => t.priority === 'CRITICAL' && t.computedStatus !== 'completed').length;
  const high     = tasks.filter(t => t.priority === 'HIGH'     && t.computedStatus !== 'completed').length;
  const overdue  = tasks.filter(t => t.computedStatus === 'overdue').length;
  const total    = tasks.filter(t => t.computedStatus !== 'completed').length;
  const done     = tasks.filter(t => t.computedStatus === 'completed').length;

  const statsBar = document.getElementById('statsBar');
  if (!statsBar) return;

  statsBar.innerHTML = `
    <div class="stat-card critical">
      <div class="stat-value">${critical}</div>
      <div class="stat-label">Critical</div>
    </div>
    <div class="stat-card high">
      <div class="stat-value">${high}</div>
      <div class="stat-label">High Priority</div>
    </div>
    <div class="stat-card overdue">
      <div class="stat-value">${overdue}</div>
      <div class="stat-label">Overdue</div>
    </div>
    <div class="stat-card total">
      <div class="stat-value">${total}</div>
      <div class="stat-label">Pending</div>
    </div>
    <div class="stat-card done">
      <div class="stat-value">${done}</div>
      <div class="stat-label">Completed</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
   NOTICE DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function viewNoticeDetail(noticeId) {
  const notice = getNoticeById(noticeId);
  if (!notice) return;

  const tasks = getTasksByNotice(noticeId);
  const enriched = getEnrichedTasks(tasks);

  // Switch to analyze page and show results there
  showPage('analyze');

  currentAnalysis = {
    ...notice,
    tasks: enriched,
    _viewOnly: true
  };

  renderAnalysisResults(currentAnalysis);
  document.getElementById('resultsPanel').style.display = 'block';

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.textContent = '✅ Already Saved';
    saveBtn.disabled = true;
    saveBtn.style.background = 'var(--success)';
  }
}

/* ═══════════════════════════════════════════════════════════════
   DELETE NOTICE
═══════════════════════════════════════════════════════════════ */
function confirmDeleteNotice(noticeId, title) {
  document.getElementById('confirmTitle').textContent = 'Delete Notice';
  document.getElementById('confirmMessage').textContent = `Delete "${title}" and all its tasks? This cannot be undone.`;
  document.getElementById('confirmOkBtn').onclick = () => {
    deleteNoticeData(noticeId);
    closeModal();
    renderDashboard();
    showToast('Deleted', `"${title}" has been removed.`, 'info');
  };
  document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('confirmModal').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
function loadProfileIntoForm() {
  const p = getProfile();
  document.getElementById('profileName').value    = p.name        || '';
  document.getElementById('profileYear').value    = p.year        || '';
  document.getElementById('profileDept').value    = p.department  || '';
  document.getElementById('profileSection').value = p.section     || '';
  document.getElementById('profileRollNo').value  = p.rollNo      || '';
  document.getElementById('profileEmail').value   = p.email       || '';
}

function saveProfile() {
  const profile = {
    name:       document.getElementById('profileName').value.trim(),
    year:       document.getElementById('profileYear').value,
    department: document.getElementById('profileDept').value.trim(),
    section:    document.getElementById('profileSection').value.trim(),
    rollNo:     document.getElementById('profileRollNo').value.trim(),
    email:      document.getElementById('profileEmail').value.trim()
  };
  saveProfileData(profile);
  const msg = document.getElementById('profileSaveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
  showToast('Profile saved', 'Your profile will be used to personalize tasks.', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════════ */
function loadSettingsIntoForm() {
  const s = getSettings();
  document.getElementById('apiKey').value  = s.apiKey || '';
  document.getElementById('aiModel').value = s.model  || 'gpt-4o';
}

function saveSettings() {
  const settings = {
    apiKey: document.getElementById('apiKey').value.trim(),
    model:  document.getElementById('aiModel').value
  };
  saveSettingsData(settings);
  checkDemoMode();
  const msg = document.getElementById('settingsSaveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
  showToast('Settings saved', settings.apiKey ? 'AI mode enabled.' : 'Running in Demo Mode.', 'success');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKey');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function checkDemoMode() {
  const s = getSettings();
  const banner = document.getElementById('demoBanner');
  if (banner) {
    banner.style.display = (!s.apiKey || s.apiKey.trim() === '') ? 'flex' : 'none';
  }
}

/* ═══════════════════════════════════════════════════════════════
   REMINDER SETTINGS
═══════════════════════════════════════════════════════════════ */
function loadReminderSettings() {
  const r = getReminderSettings();
  document.getElementById('reminderEnabled').checked = r.enabled || false;
  document.getElementById('reminderDays').value      = String(r.daysBefore || 3);
}

function saveReminderSettings() {
  const enabled    = document.getElementById('reminderEnabled').checked;
  const daysBefore = parseInt(document.getElementById('reminderDays').value, 10);

  if (enabled) {
    requestNotificationPermission();
  }

  saveReminderSettingsData({ enabled, daysBefore });
  const msg = document.getElementById('reminderSaveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Not supported', 'Browser notifications are not supported in your browser.', 'warning');
    document.getElementById('reminderEnabled').checked = false;
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      showToast('Notifications enabled', 'You will receive reminders for upcoming deadlines.', 'success');
    } else {
      showToast('Permission denied', 'Notifications were blocked. Enable them in browser settings.', 'warning');
      document.getElementById('reminderEnabled').checked = false;
    }
  });
}

function checkNotifications() {
  const r = getReminderSettings();
  if (!r.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;

  const tasks = getEnrichedTasks(getTasksData());
  const now   = new Date();
  const daysBefore = r.daysBefore || 3;

  tasks.forEach(task => {
    if (task.computedStatus === 'completed') return;
    if (!task.deadlineISO || task.deadlineISO === 'none') return;

    const deadline = new Date(task.deadlineISO);
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (diff >= 0 && diff <= daysBefore) {
      const notifKey = `notif_${task.id}_${deadline.toDateString()}`;
      if (!localStorage.getItem(notifKey)) {
        new Notification('📚 Deadline Reminder', {
          body: `${task.description}\nDue: ${task.deadline}`,
          icon: '📚'
        });
        localStorage.setItem(notifKey, '1');
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   DATA MANAGEMENT
═══════════════════════════════════════════════════════════════ */
function clearAllData() {
  document.getElementById('confirmTitle').textContent = 'Clear All Data';
  document.getElementById('confirmMessage').textContent =
    'This will delete all saved notices, tasks, your profile, and settings. This cannot be undone.';
  document.getElementById('confirmOkBtn').onclick = () => {
    clearAllStorageData();
    closeModal();
    loadSettingsIntoForm();
    loadProfileIntoForm();
    renderDashboard();
    checkDemoMode();
    showToast('Data cleared', 'All data has been removed.', 'info');
  };
  document.getElementById('confirmModal').style.display = 'flex';
}

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */
function showToast(title, message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toastContainer');
  const id = generateId('toast');

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.id = id;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" onclick="dismissToast('${id}')">✕</button>
  `;

  container.appendChild(el);
  setTimeout(() => dismissToast(id), 5000);
}

function dismissToast(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    el.style.transition = 'all .3s ease';
    setTimeout(() => el.remove(), 300);
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOADING OVERLAY
═══════════════════════════════════════════════════════════════ */
function showLoadingOverlay(message) {
  document.getElementById('loadingMessage').textContent = message || 'Loading...';
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

// Suppress undefined variable warning for PDF page count
let pdf_pageCount = null;
