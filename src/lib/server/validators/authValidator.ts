export function validateSignupInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const email = body.email?.toString().trim();
  const password = body.password?.toString();
  const fullName = (body.fullName || body.memberName || body.name)?.toString().trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }

  if (!fullName) {
    return { valid: false, error: 'Please enter your full name.' };
  }

  return { valid: true };
}

export function validateLoginInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const email = (body.email || body.identity)?.toString().trim();
  const password = body.password?.toString();

  if (!email) {
    return { valid: false, error: 'Please enter your email or username.' };
  }

  if (!password) {
    return { valid: false, error: 'Please enter your password.' };
  }

  return { valid: true };
}
