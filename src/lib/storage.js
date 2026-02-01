const STORAGE_KEY = 'learning-companion-data';
const CURRENT_VERSION = 1;

function getDefaultData() {
  return {
    version: CURRENT_VERSION,
    plans: {},
    activePlanId: null,
    logEntries: {}
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();

    const data = JSON.parse(raw);

    // Handle version migrations here if needed
    if (!data.version || data.version < CURRENT_VERSION) {
      // Future migrations would go here
      data.version = CURRENT_VERSION;
    }
    if (!data.logEntries) data.logEntries = {};

    return data;
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    return getDefaultData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

export function generatePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function savePlan(userProfile, plan) {
  const data = loadData();
  const id = generatePlanId();
  const now = Date.now();

  data.plans[id] = {
    id,
    createdAt: now,
    updatedAt: now,
    userProfile,
    plan
  };
  data.activePlanId = id;

  saveData(data);
  return id;
}

export function updatePlan(planId, plan) {
  const data = loadData();
  if (data.plans[planId]) {
    data.plans[planId].plan = plan;
    data.plans[planId].updatedAt = Date.now();
    saveData(data);
  }
}

export function getPlan(planId) {
  const data = loadData();
  return data.plans[planId] || null;
}

export function getAllPlans() {
  const data = loadData();
  return Object.values(data.plans).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function setActivePlan(planId) {
  const data = loadData();
  data.activePlanId = planId;
  saveData(data);
}

export function getActivePlanId() {
  const data = loadData();
  return data.activePlanId;
}

export function hasPlans() {
  const data = loadData();
  return Object.keys(data.plans).length > 0;
}

// Log entries (Notes-style)
export function generateLogId() {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function getAllLogEntries() {
  const data = loadData();
  return Object.values(data.logEntries || {}).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getLogEntry(id) {
  const data = loadData();
  return data.logEntries?.[id] || null;
}

export function saveLogEntry(entry) {
  const data = loadData();
  if (!data.logEntries) data.logEntries = {};
  const id = entry.id || generateLogId();
  const now = Date.now();
  data.logEntries[id] = {
    id,
    title: entry.title || 'Untitled',
    body: entry.body || '',
    createdAt: entry.createdAt ?? now,
    updatedAt: now
  };
  saveData(data);
  return id;
}

export function updateLogEntry(id, updates) {
  const data = loadData();
  if (!data.logEntries?.[id]) return;
  const entry = data.logEntries[id];
  data.logEntries[id] = {
    ...entry,
    ...updates,
    updatedAt: Date.now()
  };
  saveData(data);
}

export function deleteLogEntry(id) {
  const data = loadData();
  if (data.logEntries?.[id]) {
    delete data.logEntries[id];
    saveData(data);
  }
}
