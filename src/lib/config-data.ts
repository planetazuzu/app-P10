
'use server';

import type { SystemConfig, SystemConfigFormValues } from '@/types';

const NOCODB_API_BASE_URL = process.env.NEXT_PUBLIC_NOCODB_API_URL;
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID;
const NOCODB_CONFIG_TABLE_ID = process.env.NOCODB_SYSTEM_CONFIG_TABLE_ID;
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

// Asumimos que la configuración se guarda como un único registro, o siempre se lee/actualiza el registro con un ID conocido (ej: 'main_config' o 1)
// Para NocoDB, si usas el ID numérico, asegúrate de que exista. Si usas un ID de texto, también.
const CONFIG_RECORD_ID = 'main_config'; // O un ID numérico si tu tabla lo usa así.

const API_ENDPOINT_CONFIG = `${NOCODB_API_BASE_URL}/${NOCODB_PROJECT_ID}/${NOCODB_CONFIG_TABLE_ID}`;

const mapNocoDBToSystemConfig = (nocoRecord: any): SystemConfig => {
  return {
    id: nocoRecord.Id || nocoRecord.id, // NocoDB puede usar 'Id' o 'id'
    organizationName: nocoRecord.nombreOrganizacion || 'Respuesta Médica Global (Ejemplo)',
    defaultTimezone: nocoRecord.zonaHorariaPorDefecto || 'Europe/Madrid',
    emailNotificationsEnabled: typeof nocoRecord.notificacionesEmailHabilitadas === 'boolean' ? nocoRecord.notificacionesEmailHabilitadas : true,
    requestHistoryDays: nocoRecord.diasHistorialSolicitudes ? parseInt(String(nocoRecord.diasHistorialSolicitudes), 10) : 90,
  };
};

const mapSystemConfigToNocoDBPayload = (config: SystemConfigFormValues): any => {
  const payload: any = {};
  // NocoDB usualmente no quiere el 'id' en el payload de actualización, se usa en la URL.
  if (config.organizationName !== undefined) payload.nombreOrganizacion = config.organizationName;
  if (config.defaultTimezone !== undefined) payload.zonaHorariaPorDefecto = config.defaultTimezone;
  if (config.emailNotificationsEnabled !== undefined) payload.notificacionesEmailHabilitadas = config.emailNotificationsEnabled;
  if (config.requestHistoryDays !== undefined) payload.diasHistorialSolicitudes = config.requestHistoryDays;
  return payload;
};


export async function getSystemConfig(): Promise<SystemConfig | null> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_CONFIG_TABLE_ID || !NOCODB_API_TOKEN) {
    console.warn("Configuración de API para NocoDB (System Config) incompleta. Devolviendo config por defecto.");
    // Devolver una configuración por defecto si la API no está lista, para que la UI no se rompa.
    return {
        id: CONFIG_RECORD_ID,
        organizationName: 'Respuesta Médica Global (Predeterminado)',
        defaultTimezone: 'Europe/Madrid',
        emailNotificationsEnabled: true,
        requestHistoryDays: 90,
    };
  }
  try {
    const response = await fetch(`${API_ENDPOINT_CONFIG}/${CONFIG_RECORD_ID}`, { // Asume que puedes obtener un registro por un ID conocido.
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Evitar caché para configuraciones
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Configuración del sistema (ID: ${CONFIG_RECORD_ID}) no encontrada en NocoDB. Devolviendo config por defecto.`);
        return { // Devuelve valores por defecto si el registro no existe aún
            id: CONFIG_RECORD_ID, // Es importante tener un ID para la lógica de actualización
            organizationName: 'Organización Ejemplo (No Encontrada)',
            defaultTimezone: 'Europe/Madrid',
            emailNotificationsEnabled: true,
            requestHistoryDays: 90,
        };
      }
      console.error(`Error fetching system config: ${response.status} ${response.statusText}`, await response.text());
      return null; // O una configuración por defecto si prefieres.
    }
    const nocoRecord = await response.json();
    return mapNocoDBToSystemConfig(nocoRecord);
  } catch (error) {
    console.error("Fallo al obtener la configuración del sistema desde la API:", error);
    return null; // O una configuración por defecto.
  }
}

export async function updateSystemConfig(configData: SystemConfigFormValues): Promise<SystemConfig | null> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_CONFIG_TABLE_ID || !NOCODB_API_TOKEN) {
    console.error("Configuración de API para NocoDB (System Config) incompleta. No se puede actualizar la configuración.");
    return null;
  }

  const payload = mapSystemConfigToNocoDBPayload(configData);

  try {
    // Intenta actualizar. Si falla (ej: 404 si el registro no existe), intenta crear.
    let response = await fetch(`${API_ENDPOINT_CONFIG}/${CONFIG_RECORD_ID}`, {
      method: 'PATCH', // PATCH para actualizar parcialmente
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 404) { // Si el registro no existe, créalo
        console.log(`Configuración (ID: ${CONFIG_RECORD_ID}) no encontrada, intentando crear...`);
        // Para NocoDB, al crear un registro con un ID específico, usualmente el ID va en el cuerpo.
        // Pero la API de NocoDB a veces es peculiar con IDs predefinidos.
        // La forma más segura es omitir el ID en el cuerpo para POST,
        // y NocoDB asignará uno. Si NECESITAS un ID específico, consulta su documentación.
        // Aquí, asumimos que la tabla SOLO tendrá UN registro para la configuración,
        // y que si no existe, lo creamos (NocoDB asignará un ID numérico).
        // O, si tu tabla de NocoDB permite IDs de texto, puedes intentar:
        // const createPayload = { ...payload, id: CONFIG_RECORD_ID };
        // Pero es más simple dejar que NocoDB asigne el ID y luego siempre referenciar ESE ID
        // o consultar el primer registro.
        // Para esta simulación, vamos a asumir que el primer registro es la configuración.
        // O si tu tabla `system_configurations` está vacía y haces un POST, se crea la primera fila.
        // Si no puedes garantizar un ID fijo, la lógica de `getSystemConfig` debería
        // obtener el primer registro de la tabla.

        // Por ahora, simplificamos: si PATCH falla con 404, asumimos que necesitas crear.
        // La implementación de NocoDB para "crear o actualizar" (UPSERT) puede variar.
        // Lo más seguro es hacer un POST si el GET inicial devolvió null o un 404.
        // Esta función ASUME que la llamada a `getSystemConfig` ya ha ocurrido
        // y si el registro no existía, la UI podría estar creando uno nuevo.
        // Vamos a reintentar con POST si PATCH da 404, asumiendo que la tabla está vacía.
        // NOTA: NocoDB al hacer POST usualmente ignora el ID en el cuerpo si la columna es autoincremental.
        // Si tu `CONFIG_RECORD_ID` es un texto, puedes intentar incluirlo.
        const postPayload = { ...payload };
        if (typeof CONFIG_RECORD_ID === 'string') { // Si CONFIG_RECORD_ID es un string, NocoDB podría usarlo como Primary Key de texto
            postPayload.id = CONFIG_RECORD_ID; // Ajusta esto a tu nombre de columna ID en NocoDB
        }

        response = await fetch(API_ENDPOINT_CONFIG, {
            method: 'POST',
            headers: {
                'xc-token': NOCODB_API_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postPayload),
        });
    }


    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error actualizando la configuración del sistema: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const updatedNocoRecord = await response.json();
    return mapNocoDBToSystemConfig(updatedNocoRecord);
  } catch (error) {
    console.error("Fallo al actualizar la configuración del sistema vía API:", error);
    return null;
  }
}

// Ejemplo: Si tu tabla de configuración solo tendrá una fila, y quieres
// obtener esa única fila sin saber su ID:
export async function getFirstSystemConfig(): Promise<SystemConfig | null> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_CONFIG_TABLE_ID || !NOCODB_API_TOKEN) {
    console.warn("Configuración de API para NocoDB (System Config) incompleta. Devolviendo config por defecto.");
    return { /* ... default config ... */ };
  }
  try {
    // Obtener el primer registro (limit 1)
    const response = await fetch(`${API_ENDPOINT_CONFIG}?limit=1`, {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Error fetching system config: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data && data.list && data.list.length > 0) {
      return mapNocoDBToSystemConfig(data.list[0]);
    }
    console.warn("No system configuration record found in NocoDB. Returning default.");
    return { // Devuelve valores por defecto si la tabla está vacía
        id: CONFIG_RECORD_ID, // O un ID placeholder, ya que no se encontró
        organizationName: 'Organización Ejemplo (Nueva)',
        defaultTimezone: 'Europe/Madrid',
        emailNotificationsEnabled: true,
        requestHistoryDays: 90,
    };
  } catch (error) {
    console.error("Fallo al obtener la configuración del sistema desde la API:", error);
    return null;
  }
}
