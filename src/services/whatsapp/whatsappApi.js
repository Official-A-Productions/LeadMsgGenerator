const API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3001/api/whatsapp';

export async function fetchStatus() {
  const res = await fetch(`${API_URL}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function enqueueJobs(jobs) {
  const res = await fetch(`${API_URL}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobs)
  });
  if (!res.ok) throw new Error('Failed to enqueue');
  return res.json();
}

export async function fetchQueue() {
  const res = await fetch(`${API_URL}/queue`);
  if (!res.ok) throw new Error('Failed to fetch queue');
  return res.json();
}

export async function updateJobAction(id, action) {
  const res = await fetch(`${API_URL}/queue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function startQueue() {
  const res = await fetch(`${API_URL}/queue/start`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start queue');
  return res.json();
}

export async function pauseQueue() {
  const res = await fetch(`${API_URL}/queue/pause`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to pause queue');
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_URL}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
