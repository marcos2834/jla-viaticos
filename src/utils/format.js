export function formatCurrency(a){if(a===null||a===undefined||a==='')return'—';const n=typeof a==='string'?parseFloat(a.replace(/,/g,'')):a;if(isNaN(n))return'—';return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:2}).format(n);}
export function formatDate(s){if(!s)return'—';const d=new Date(s);if(isNaN(d))return s;return d.toLocaleDateString('es-AR');}
export function getPeriod(s){const d=s?new Date(s):new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
