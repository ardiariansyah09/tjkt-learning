const STORAGE_KEY = 'tjkt:ipv4-subnetting:progress:v1';

export function readProgress(validLessonIds) {
  const fallback = { completed: [], current: validLessonIds[0] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.completed)) return fallback;
    const completed = [...new Set(parsed.completed.filter(id => validLessonIds.includes(id)))];
    const current = validLessonIds.includes(parsed.current) ? parsed.current : validLessonIds[0];
    return { completed, current };
  } catch (error) {
    console.warn('Progres lokal tidak dapat dibaca:', error);
    return fallback;
  }
}

export function writeProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      completed: progress.completed,
      current: progress.current,
      updatedAt: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.warn('Progres lokal tidak dapat disimpan:', error);
    return false;
  }
}
