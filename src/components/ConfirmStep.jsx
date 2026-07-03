import React,{useState}from 'react';
import{colors,styles,fonts}from '../theme.js';
const CATS=['Alojamiento','Desayuno','Almuerzo','Cena','Refrigerio','Estacionamiento','Peaje','Pasajes','Combustible','Otros'];
const FPS=['Efectivo','Tarjeta JLA'];
const TIPOS=['Factura A','Factura B','Factura C','Ticket','Otro'];
const MONEDAS=['ARS','USD','EUR'];
const TIPOS_COMBUSTIBLE=['GNC','Nafta Super','Nafta Premium','Gasoil'];
const CATS_PERSONAS=['Alojamiento','Desayuno','Almuerzo','Cena','Refrigerio'];
function Field({label,children}){return(<div style={{marginBottom:'16px'}}><label style={styles.label}>{label}</label>{children}</div>);}
export default function ConfirmStep({extracted,isManual,identity,onSubmit,onBack}){
const[form,setForm]=useState({fecha_comprobante:extracted?.fecha_comprobante||'',hora_comprobante:extracted?.hora_comprobante||'',proveedor:extracted?.proveedor||'',cuit:extracted?.cuit||'',tipo_comprobante:extracted?.tipo_comprobante||'Ticket',numero:extracted?.numero||'',moneda:extracted?.moneda||'ARS',subtotal:extracted?.subtotal||'',iva_21:extracted?.iva_21||'',iva_105:extracted?.iva_105||'',monto_total:extracted?.monto_total||'',observaciones:extracted?.observaciones||'',destino:'',cliente_estudio:'',categoria:'',forma_pago:'',noches:'',personas:'',litros:'',tipo_combustible:'GNC'});
const[submitting,setSubmitting]=useState(false);
const[error,setError]=useState('');
const set=(k,v)=>setForm(f=>({...f,[k]:v}));
async function handleSubmit(e){
e.preventDefault();
if(!form.categoria){setError('Seleccioná una categoría');return;}
if(!form.forma_pago){setError('Seleccioná la forma de pago');return;}
if(form.categoria==='Alojamiento'&&!form.noches){setError('Ingresá la cantidad de noches');return;}
if(CATS_PERSONAS.includes(form.categoria)&&!form.personas){setError('Ingresá la cantidad de personas');return;}
if(form.categoria==='Combustible'&&!form.litros){setError('Ingresá la cantidad de litros');return;}
setError('');setSubmitting(true);
try{
const payload={...form,titular:identity.nombre,tarjeta:identity.tarjeta,sociedad:identity.sociedad,cuil_titular:identity.cuil,modo_carga:isManual?'Manual':'Foto',_fileBase64:extracted?._fileBase64,_fileMime:extracted?._fileMime,_fileName:extracted?._fileName};
const res=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
const data=await res.json();
if(!res.ok)throw new Error(data.error||'Error al guardar');
onSubmit(data);
}catch(err){setError(err.message);}finally{setSubmitting(false);}
}
const isFacA=form.tipo_comprobante==='Factura A';
const ss={background:colors.light,borderRadius:'8px',padding:'16px',marginBottom:'20px'};
const st={fontFamily:fonts.heading,fontWeight:700,fontSize:'13px',letterSpacing:'1px',color:colors.midGray,textTransform:'uppercase',marginBottom:'14px'};
return(
<div style={styles.card}>
<h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'20px',color:colors.red,marginBottom:'4px'}}>{isManual?'Datos del gasto':'Confirmar datos extraídos'}</h2>
{!isManual&&<p style={{fontSize:'13px',color:colors.midGray,marginBottom:'20px'}}>Revisá y corregí los datos detectados por la IA si es necesario.</p>}
<form onSubmit={handleSubmit}>
<div style={ss}>
<p style={st}>Datos del comprobante</p>
<Field label="Destino *"><input style={styles.input} value={form.destino} onChange={e=>set('destino',e.target.value)} placeholder="Ej: Rosario, Mendoza…" required/></Field>
<Field label="Cliente / N° de estudio"><input style={styles.input} value={form.cliente_estudio} onChange={e=>set('cliente_estudio',e.target.value)} placeholder="Ej: Cliente XYZ / Estudio 1234"/></Field>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<Field label="Fecha"><input style={styles.input} type="date" value={form.fecha_comprobante} onChange={e=>set('fecha_comprobante',e.target.value)}/></Field>
<Field label="Hora"><input style={styles.input} type="time" value={form.hora_comprobante} onChange={e=>set('hora_comprobante',e.target.value)}/></Field>
</div>
<Field label="Proveedor / Razón social"><input style={styles.input} value={form.proveedor} onChange={e=>set('proveedor',e.target.value)} placeholder="Nombre del proveedor"/></Field>
<Field label="CUIT"><input style={styles.input} value={form.cuit} onChange={e=>set('cuit',e.target.value)} placeholder="XX-XXXXXXXX-X"/></Field>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<Field label="Tipo comprobante"><select style={{...styles.input,appearance:'none'}} value={form.tipo_comprobante} onChange={e=>set('tipo_comprobante',e.target.value)}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></Field>
<Field label="N° comprobante"><input style={styles.input} value={form.numero} onChange={e=>set('numero',e.target.value)} placeholder="0001-00012345"/></Field>
</div>
{isFacA&&(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<Field label="Subtotal / monto neto"><input style={styles.input} type="number" step="0.01" value={form.subtotal} onChange={e=>set('subtotal',e.target.value)} placeholder="0.00"/></Field>
<Field label="IVA 21%"><input style={styles.input} type="number" step="0.01" value={form.iva_21} onChange={e=>set('iva_21',e.target.value)} placeholder="0.00"/></Field>
<Field label="IVA 10.5%"><input style={styles.input} type="number" step="0.01" value={form.iva_105} onChange={e=>set('iva_105',e.target.value)} placeholder="0.00"/></Field>
</div>)}
{!isFacA&&isManual&&(<Field label="Subtotal / monto neto"><input style={styles.input} type="number" step="0.01" value={form.subtotal} onChange={e=>set('subtotal',e.target.value)} placeholder="0.00"/></Field>)}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<Field label="Moneda"><select style={{...styles.input,appearance:'none'}} value={form.moneda} onChange={e=>set('moneda',e.target.value)}>{MONEDAS.map(m=><option key={m}>{m}</option>)}</select></Field>
<Field label="Monto total *"><input style={styles.input} type="number" step="0.01" value={form.monto_total} onChange={e=>set('monto_total',e.target.value)} placeholder="0.00" required/></Field>
</div>
</div>
<div style={ss}>
<p style={st}>Clasificación</p>
<Field label="Categoría *">
<select style={{...styles.input,appearance:'none',borderColor:!form.categoria?colors.red:colors.border}} value={form.categoria} onChange={e=>set('categoria',e.target.value)} required>
<option value="">— Seleccioná —</option>
{CATS.map(c=><option key={c}>{c}</option>)}
</select>
</Field>
{form.categoria==='Alojamiento'&&(<Field label="Cantidad de noches *"><input style={styles.input} type="number" min="1" value={form.noches} onChange={e=>set('noches',e.target.value)} placeholder="1" required/></Field>)}
{CATS_PERSONAS.includes(form.categoria)&&(<Field label="Cantidad de personas *"><input style={styles.input} type="number" min="1" value={form.personas} onChange={e=>set('personas',e.target.value)} placeholder="1" required/></Field>)}
{form.categoria==='Combustible'&&(<>
<Field label="Cantidad de litros *"><input style={styles.input} type="number" step="0.01" min="0" value={form.litros} onChange={e=>set('litros',e.target.value)} placeholder="0.00" required/></Field>
<Field label="Tipo de combustible *"><select style={{...styles.input,appearance:'none'}} value={form.tipo_combustible} onChange={e=>set('tipo_combustible',e.target.value)}>{TIPOS_COMBUSTIBLE.map(t=><option key={t}>{t}</option>)}</select></Field>
</>)}
<Field label="Forma de pago *">
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
{FPS.map(fp=>(<label key={fp} style={{display:'flex',alignItems:'center',gap:'8px',border:`1.5px solid ${form.forma_pago===fp?colors.red:colors.border}`,borderRadius:'7px',padding:'10px 14px',cursor:'pointer',background:form.forma_pago===fp?'#FFF3F3':colors.white,fontFamily:fonts.body,fontSize:'14px'}}>
<input type="radio" name="forma_pago" value={fp} checked={form.forma_pago===fp} onChange={()=>set('forma_pago',fp)} style={{accentColor:colors.red}}/>{fp}
</label>))}
</div>
</Field>
</div>
<Field label="Observaciones (opcional)">
<textarea style={{...styles.input,height:'80px',resize:'vertical'}} value={form.observaciones} onChange={e=>set('observaciones',e.target.value)} placeholder="Ej: viaje a Rosario…"/>
</Field>
{error&&<div style={{background:'#FFF3F3',border:`1.5px solid ${colors.red}`,borderRadius:'7px',padding:'12px 14px',color:colors.red,fontSize:'14px',marginBottom:'16px'}}>{error}</div>}
<button type="submit" style={{...styles.btnPrimary,marginBottom:'10px'}} disabled={submitting}>{submitting?'Guardando…':'✓ Confirmar y guardar'}</button>
<button type="button" style={styles.btnSecondary} onClick={onBack} disabled={submitting}>← Volver</button>
</form>
</div>
);
                              }
