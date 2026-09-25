/**
 * storage.js — Persistent localStorage management for College Notice Assistant
 */

const STORAGE_KEYS = {
  PROFILE:   'cna_profile',
  NOTICES:   'cna_notices',
  TASKS:     'cna_tasks',
  SETTINGS:  'cna_settings',
  REMINDERS: 'cna_reminders'
};

/* -------- Generic helpers -------- */
function storageGet(key, defaultVal = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.warn('storageGet error', key, e);
    return defaultVal;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('storageSet error', key, e);
    return false;
  }
}

/* -------- Profile -------- */
function getProfile() {
  return storageGet(STORAGE_KEYS.PROFILE, {
    name: '', year: '', department: '', section: '', rollNo: '', email: ''
  });
}
function saveProfileData(profile) {
  return storageSet(STORAGE_KEYS.PROFILE, profile);
}

/* -------- Settings -------- */
function getSettings() {
  return storageGet(STORAGE_KEYS.SETTINGS, {
    apiKey: '', model: 'gpt-4o'
  });
}
function saveSettingsData(settings) {
  return storageSet(STORAGE_KEYS.SETTINGS, settings);
}

/* -------- Reminder settings -------- */
function getReminderSettings() {
  return storageGet(STORAGE_KEYS.REMINDERS, {
    enabled: false, daysBefore: 3
  });
}
function saveReminderSettingsData(data) {
  return storageSet(STORAGE_KEYS.REMINDERS, data);
}

/* -------- Notices -------- */
function getNotices() {
  return storageGet(STORAGE_KEYS.NOTICES, []);
}

function saveNoticeData(notice) {
  const notices = getNotices();
  const idx = notices.findIndex(n => n.id === notice.id);
  if (idx >= 0) {
    notices[idx] = notice;
  } else {
    notices.unshift(notice); // newest first
  }
  return storageSet(STORAGE_KEYS.NOTICES, notices);
}

function deleteNoticeData(noticeId) {
  let notices = getNotices();
  notices = notices.filter(n => n.id !== noticeId);
  storageSet(STORAGE_KEYS.NOTICES, notices);
  // Also remove related tasks
  let tasks = getTasksData();
  tasks = tasks.filter(t => t.noticeId !== noticeId);
  storageSet(STORAGE_KEYS.TASKS, tasks);
}

function getNoticeById(noticeId) {
  return getNotices().find(n => n.id === noticeId) || null;
}

/* -------- Tasks -------- */
function getTasksData() {
  return storageGet(STORAGE_KEYS.TASKS, []);
}

function saveTasksForNotice(noticeId, tasks) {
  let allTasks = getTasksData();
  // Remove old tasks for this notice
  allTasks = allTasks.filter(t => t.noticeId !== noticeId);
  // Append new ones (with noticeId stamped)
  const stamped = tasks.map(t => ({ ...t, noticeId }));
  allTasks = [...allTasks, ...stamped];
  return storageSet(STORAGE_KEYS.TASKS, allTasks);
}

function updateTaskStatus(taskId, status) {
  let tasks = getTasksData();
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx >= 0) {
    tasks[idx].status = status;
    tasks[idx].completedAt = status === 'completed' ? new Date().toISOString() : null;
    storageSet(STORAGE_KEYS.TASKS, tasks);
    return tasks[idx];
  }
  return null;
}

function getTasksByNotice(noticeId) {
  return getTasksData().filter(t => t.noticeId === noticeId);
}

/* -------- Task Status Computation -------- */
function computeTaskStatus(task) {
  // If manually completed, keep as completed
  if (task.status === 'completed') return 'completed';

  if (!task.deadlineISO || task.deadlineISO === 'none') return 'pending';

  const now = new Date();
  const deadline = new Date(task.deadlineISO);
  // Treat deadline as end of that day
  deadline.setHours(23, 59, 59, 999);

  if (deadline < now) return 'overdue';
  return 'pending';
}

/**
 * Get tasks with computed/live statuses + deadline urgency flags.
 */
function getEnrichedTasks(tasks) {
  const now = new Date();
  return tasks.map(t => {
    const computed = computeTaskStatus(t);
    let daysUntil = null;
    let isToday = false;
    let isSoon = false;

    if (t.deadlineISO && t.deadlineISO !== 'none') {
      const dl = new Date(t.deadlineISO);
      dl.setHours(23, 59, 59, 999);
      daysUntil = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
      isToday = daysUntil <= 0 && computed !== 'overdue'; // deadline is today
      if (daysUntil === 0) isToday = true;
      isSoon = daysUntil > 0 && daysUntil <= 7;
    }

    return { ...t, computedStatus: computed, daysUntil, isToday, isSoon };
  });
}

/* -------- Clear all -------- */
function clearAllStorageData() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

/* -------- Generate ID -------- */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
