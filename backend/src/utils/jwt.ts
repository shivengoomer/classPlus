import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'classplus_default_secret_key_123';

export interface StudentJwtPayload {
  studentId: string;
  email: string;
  studentName: string;
  groupIds: string[];
  role: 'Student';
}

/**
 * Sign a payload into an RFC-compliant JWT structure.
 */
export function signStudentToken(payload: StudentJwtPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days expiry
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

/**
 * Verify a JWT string and return the decoded payload if valid.
 */
export function verifyStudentToken(token: string): StudentJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    
    // Check expiration
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      studentId: decodedBody.studentId || '',
      email: decodedBody.email,
      studentName: decodedBody.studentName,
      groupIds: decodedBody.groupIds || [],
      role: decodedBody.role || 'Student',
    };
  } catch (err) {
    return null;
  }
}

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: 'Admin';
  institutionId: string;
}

/**
 * Sign a payload into an RFC-compliant JWT structure for school administrators.
 */
export function signAdminToken(payload: AdminJwtPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiry
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

/**
 * Verify a custom Admin JWT string.
 */
export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    
    // Check expiration
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      adminId: decodedBody.adminId || '',
      email: decodedBody.email,
      role: decodedBody.role || 'Admin',
      institutionId: decodedBody.institutionId || '',
    };
  } catch (err) {
    return null;
  }
}
