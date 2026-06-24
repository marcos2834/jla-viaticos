import React,{useState,useEffect}from 'react';
import{colors,styles,fonts}from '../theme.js';
import{saveIdentity}from '../utils/storage.js';
const SOCS=['JLA Argentina S.A.','JLA Cono Sur S.A.'];
export default function IdentityGate({onSave}){
  const[nombre,setNombre]=useState('');
  const[sociedad,setSociedad]=useState(SOCS[0]);
  const[tarjeta,setTarjeta]=useState('');
  const[suggestions,setSuggestions]=useState([]);
  const[showSugg,setShowSugg]=useState(false);
  useEffect(()=>{fetch('/api/names').then(r=>r.json()).then(d=>setSuggestions(d.names||[])).catch(()=>{});},[]);
  const filtered=nombre.length>=2?suggestions.filter(n=>n.toLowerCase().includes(nombre.toLowerCase())).slice(0,8):[];
  function handleSubmit(e){
    e.preventDefault();if(!nombre.trim())return;
    const id={nombre:nombre.trim(),sociedad,tarjeta:tarjeta.trim().slice(-4)||''};
    saveIdentity(id);onSave(id);
  }
  return(
    <div style={styles.card}>
      <h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'22px',color:colors.red,marginBottom:'6px'}}>Bienvenido/a</h2>
      <p style={{fontSize:'14px',color:colors.midGray,marginBottom:'20px'}}>La primera vez necesitamos identificarte. Esta info se guardará en tu dispositivo.</p>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'18px',position:'relative'}}>
          <label style={styles.label}>Nombre y Apellido *</label>
          <input style={styles.input} value={nombre} onChange={e=>{setNombre(e.target.value);setShowSugg(true);}} onFocus={()=>setShowSugg(true)} onBlur={()=>setTimeout(()=>setShowSugg(false),150)} placeholder="Ej: María González" autoComplete="off" required/>
          {showSugg&&filtered.length>0&&(
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:colors.white,border:`1.5px solid ${colors.border}`,borderTop:'none',borderRadius:'0 0 7px 7px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:100,maxHeight:'200px',overflowY:'auto'}}>
              {filtered.map(n=>(<div key={n} onMouseDown={()=>{setNombre(n);setShowSugg(false);}} style={{padding:'10px 14px',cursor:'pointer',fontSize:'14px',borderBottom:`1px solid ${colors.border}`}}>{n}</div>))}
            </div>
          )}
        </div>
        <div style={{marginBottom:'18px'}}>
          <label style={styles.label}>Sociedad *</label>
          <select style={{...styles.input,appearance:'none',cursor:'pointer'}} value={sociedad} onChange={e=>setSociedad(e.target.value)} required>
            {SOCS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{marginBottom:'24px'}}>
          <label style={styles.label}>Tarjeta corporativa — últimos 4 dígitos (opcional)</label>
          <input style={styles.input} value={tarjeta} onChange={e=>setTarjeta(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="Dejar vacío si solo usa efectivo" maxLength={4} inputMode="numeric"/>
        </div>
        <button type="submit" style={styles.btnPrimary}>Guardar y continuar</button>
      </form>
    </div>
  );
    }
