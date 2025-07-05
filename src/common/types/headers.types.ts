/**
 * Tipos para headers comunes del sistema
 */

export interface BusinessHeaders {
  business_id: number;
}

export interface ProfileHeaders {
  profile_id: number;
}

export interface ContextHeaders extends BusinessHeaders, ProfileHeaders {
  business_id: number;
  profile_id: number;
}

/**
 * Headers opcionales para casos donde algunos contextos pueden no estar presentes
 */
export interface OptionalContextHeaders {
  business_id?: number;
  profile_id?: number;
}
