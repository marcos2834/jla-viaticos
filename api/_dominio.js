// Copia server-side de src/utils/dominio.js (las funciones de /api no importan desde /src).
export function normDominio(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function dominioValido(v){const d=normDominio(v);return /^[A-Z]{3}\d{3}$/.test(d)||/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(d);}
// Columna del Sheet donde se guarda el dominio (se agrega al final para no correr las existentes).
export const COL_DOMINIO='AI';
export const HEADER_DOMINIO='Dominio';
