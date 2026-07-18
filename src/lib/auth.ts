import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD_KEY = 'admin_session';

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_PASSWORD_KEY)?.value;
  return session === getAdminPassword();
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (password === getAdminPassword()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_PASSWORD_KEY, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return true;
  }
  return false;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_PASSWORD_KEY);
}

export function verifyApiRequest(req: NextRequest): boolean {
  // Check cookie
  const session = req.cookies.get(ADMIN_PASSWORD_KEY)?.value;
  if (session === getAdminPassword()) {
    return true;
  }

  // Check Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/, '');
    if (token === getAdminPassword()) {
      return true;
    }
  }

  return false;
}
