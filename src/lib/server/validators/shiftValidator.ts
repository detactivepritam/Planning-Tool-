export function validateShiftInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { shiftDate, startTime, endTime } = body;

  if (!shiftDate || !/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
    return { valid: false, error: 'Invalid shift date format (expected YYYY-MM-DD).' };
  }

  if (!startTime || !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime)) {
    return { valid: false, error: 'Invalid start time format (expected HH:MM).' };
  }

  if (!endTime || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
    return { valid: false, error: 'Invalid end time format (expected HH:MM).' };
  }

  return { valid: true };
}
