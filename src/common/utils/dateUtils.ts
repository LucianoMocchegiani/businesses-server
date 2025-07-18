/**
 * Utilidades para manejo de fechas y timestamps en el backend
 * Estandariza la conversión entre fechas y timestamps en toda la aplicación
 */

export type Timestamp = number; // Unix timestamp en milisegundos

/**
 * Convierte una fecha a timestamp (milisegundos desde epoch)
 */
export const dateToTimestamp = (date: Date | string | null | undefined): Timestamp | null => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return new Date(date).getTime();
  }
  
  if (date instanceof Date) {
    return date.getTime();
  }
  
  return null;
};

/**
 * Convierte un timestamp a objeto Date
 */
export const timestampToDate = (timestamp: Timestamp | null | undefined): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp);
};

/**
 * Convierte un timestamp a string ISO
 */
export const timestampToISOString = (timestamp: Timestamp | null | undefined): string | null => {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
};

/**
 * Obtiene el timestamp actual
 */
export const getCurrentTimestamp = (): Timestamp => {
  return Date.now();
};

/**
 * Valida si un valor es un timestamp válido
 */
export const isValidTimestamp = (value: any): value is Timestamp => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};

/**
 * Convierte un objeto Prisma con fechas a timestamps para respuesta API
 */
export const convertPrismaDatesToTimestamps = <T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): T => {
  const result = { ...obj } as any;
  
  dateFields.forEach(field => {
    if (field in result && result[field] !== null && result[field] !== undefined) {
      const timestamp = dateToTimestamp(result[field]);
      if (timestamp !== null) {
        result[field] = timestamp;
      }
    }
  });
  
  return result as T;
};

/**
 * Convierte timestamps de request a fechas para Prisma
 */
export const convertTimestampsToDates = <T extends Record<string, any>>(
  obj: T,
  timestampFields: (keyof T)[]
): T => {
  const result = { ...obj } as any;
  
  timestampFields.forEach(field => {
    if (field in result && result[field] !== null && result[field] !== undefined) {
      const date = timestampToDate(result[field]);
      if (date !== null) {
        result[field] = date;
      }
    }
  });
  
  return result as T;
};

/**
 * Transforma un objeto Prisma completo convirtiendo todas las fechas conocidas a timestamps
 */
export const transformPrismaResponse = <T extends Record<string, any>>(obj: T): T => {
  const dateFields: (keyof T)[] = [
    'created_at',
    'updated_at',
    'entry_date',
    'expiration_date',
    'valid_from',
    'valid_to',
    'start_date',
    'departure_date',
    'sale_date',
    'purchase_date',
    'actual_delivery_date'
  ] as (keyof T)[];
  
  return convertPrismaDatesToTimestamps(obj, dateFields);
};

/**
 * Transforma un array de objetos Prisma
 */
export const transformPrismaArrayResponse = <T extends Record<string, any>>(array: T[]): T[] => {
  return array.map(item => transformPrismaResponse(item));
};

/**
 * Transforma una respuesta paginada de Prisma
 */
export const transformPrismaPaginatedResponse = <T extends Record<string, any>>(
  response: { data: T[]; total: number; page: number; last_page: number }
) => {
  return {
    ...response,
    data: transformPrismaArrayResponse(response.data)
  };
}; 