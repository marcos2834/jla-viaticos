// Dominio / patente del vehículo (Argentina).
// Formatos válidos: viejo "ABC123" y Mercosur "AB123CD".
const KEY_LAST='jla_viaticos_last_dominio';
export function normDominio(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function dominioValido(v){const d=normDominio(v);return /^[A-Z]{3}\d{3}$/.test(d)||/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(d);}
export function getLastDominio(){try{return localStorage.getItem(KEY_LAST)||'';}catch{return'';}}
export function saveLastDominio(d){try{if(dominioValido(d))localStorage.setItem(KEY_LAST,normDominio(d));}catch{}}
