const KEY='jla_viaticos_identity';
export function getIdentity(){try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):null;}catch{return null;}}
export function saveIdentity(id){localStorage.setItem(KEY,JSON.stringify(id));}
export function clearIdentity(){localStorage.removeItem(KEY);}
