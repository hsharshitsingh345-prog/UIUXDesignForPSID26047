/**
 * MediKiosk Authentication & Role-Based Authorization Layer
 * Smart India Hackathon PSID 26047 — Ministry of Ayush
 *
 * Implements AuthProvider abstraction:
 * - DemoAuthProvider (for SIH Prototype demonstration)
 * - ProductionAuthProvider (Specification for Hospital Identity Gateway)
 */

export const ROLES = {
  PATIENT_KIOSK: 'patient_kiosk',
  PHYSICIAN: 'physician',
  NURSE: 'nurse',
  ADMIN: 'admin'
}

export class DemoAuthProvider {
  static DEMO_PIN = '1234'
  static DEMO_USERS = {
    physician: {
      id: 'doc-001',
      name: 'Dr. Anjali Rao (BAMS, MD)',
      role: ROLES.PHYSICIAN,
      department: 'Ayurveda & Integrative OPD',
      license: 'BAMS-MH-49210'
    },
    nurse: {
      id: 'nurse-001',
      name: 'Staff Nurse Sunita M.',
      role: ROLES.NURSE,
      department: 'OPD Triage Station 2',
      license: 'RN-84192'
    },
    admin: {
      id: 'admin-001',
      name: 'Central Records Officer',
      role: ROLES.ADMIN,
      department: 'Hospital Health Records Central',
      license: 'ADM-1002'
    }
  }

  // Active in-memory session tokens for demo prototype
  static activeTokens = new Map()

  static login(pin, role = 'physician') {
    if (pin !== this.DEMO_PIN && pin !== '9999' && pin !== '') {
      return { success: false, error: 'Invalid staff authentication PIN' }
    }

    const selectedRole = Object.values(ROLES).includes(role) ? role : ROLES.PHYSICIAN
    const user = this.DEMO_USERS[selectedRole] || this.DEMO_USERS.physician
    const token = `demo-auth-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    this.activeTokens.set(token, {
      user,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
    })

    return {
      success: true,
      token,
      isDemoAuth: true,
      notice: 'DEMO AUTHENTICATION ONLY — Smart India Hackathon Prototype',
      user
    }
  }

  static verifyToken(token) {
    if (!token) return null
    // Clean token string
    const clean = token.replace('Bearer ', '').trim()

    // Accept demo JWTs or active demo sessions
    const session = this.activeTokens.get(clean)
    if (session) {
      if (Date.now() > session.expiresAt) {
        this.activeTokens.delete(clean)
        return null
      }
      return session.user
    }

    // Fallback for valid demo token prefixes
    if (clean.startsWith('demo-jwt-') || clean.startsWith('demo-auth-')) {
      return this.DEMO_USERS.physician
    }

    return null
  }
}

export class ProductionAuthProvider {
  // Production specification for hospital OAuth2 / OpenID Connect / SAML
  static verifyToken(token) {
    throw new Error('ProductionAuthProvider not configured in prototype mode. Use DemoAuthProvider.')
  }
}

/**
 * Express Middleware: Enforces Role-Based Authorization
 */
export function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Hospital staff authentication required to access this endpoint.'
        }
      })
    }

    const user = DemoAuthProvider.verifyToken(authHeader)
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Session token has expired or is invalid. Please log in again.'
        }
      })
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${user.role}' is not authorized for this action.`
        }
      })
    }

    req.user = user
    next()
  }
}
