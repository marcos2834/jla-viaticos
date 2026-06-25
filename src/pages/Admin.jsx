import React,{useState,useEffect,useCallback}from 'react';
import Layout from '../components/Layout.jsx';
import{colors,fonts,styles}from '../theme.js';
import{formatCurrency}from '../utils/format.js';
const ADMIN_PIN=import.meta.env.VITE_ADMIN_PIN||'1234';
function Badge({children,color}){return(<span style={{background:color||colors.blue,color:colors.white,borderRadius:'4px',padding:'2px 8px',fontSize:'11px',fontFamily:fonts.data,fontWeight:600,letterSpacing:'0.5px'}}>{children}</span>);}
export default function Admin(){
  const[authed,setAuthed]=useState(false);
  const[pin,setPin]=useState('');
  const[pinError,setPinError]=useState('');
  const[periodo,setPeriodo]=useState(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');});
  const[colaborador,setColaborador]=useState('');
  const[rows,setRows]=useState([]);
  const[names,setNames]=useState([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[concil,setConcil]=useState(null);
  const loadReport=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const p=new URLSearchParams({periodo});
      if(colaborador)p.append('colaborador',colaborador);
      const res=await fetch('/api/report?'+p);
      const d=await res.json();
      if(!res.ok)throw new Error(d.error||'Error');
      setRows(d.rows||[]);setConcil(d.conciliacion||null);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[periodo,colaborador]);
  useEffect(()=>{fetch('/api/names').then(r=>r.json()).then(d=>setNames(d.names||[])).catch(()=>{});},[]);
  useEffect(()=>{if(authed)loadReport();},[authed,loadReport]);
  function handlePin(e){e.preventDefault();if(pin===ADMIN_PIN){setAuthed(true);setPinError('');}else{setPinError('PIN incorrecto');}}
  if(!authed)return(
    <Layout>
      <div style={{...styles.card,maxWidth:'340px',margin:'60px auto'}}>
        <h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'22px',color:colors.red,marginBottom:'8px'}}>Área de Administración</h2>
        <p style={{fontSize:'14px',color:colors.midGray,marginBottom:'20px'}}>Ingresá el PIN para acceder al reporte.</p>
        <form onSubmit={handlePin}>
          <label style={styles.label}>PIN</label>
          <input style={{...styles.input,marginBottom:'12px'}} type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" autoFocus/>
          {pinError&&<p style={{color:colors.red,fontSize:'13px',marginBottom:'10px'}}>{pinError}</p>}
          <button style={styles.btnPrimary} type="submit">Ingresar</button>
        </form>
      </div>
    </Layout>
  );
  const byCategoria={};
  rows.forEach(r=>{if(!byCategoria[r.Categoria])byCategoria[r.Categoria]=0;byCategoria[r.Categoria]+=parseFloat(r.Monto_total||0);});
  const totalTarjeta=rows.filter(r=>r.Forma_pago==='Tarjeta JLA').reduce((s,r)=>s+parseFloat(r.Monto_total||0),0);
  const totalEfectivo=rows.filter(r=>r.Forma_pago==='Efectivo').reduce((s,r)=>s+parseFloat(r.Monto_total||0),0);
  return(
    <Layout>
      <div style={{background:colors.red,color:colors.white,borderRadius:'8px',padding:'10px 16px',marginBottom:'16px',fontSize:'13px',fontFamily:fonts.body,fontWeight:600}}>🔒 CONFIDENCIAL — USO EXCLUSIVO DE ADMINISTRACIÓN</div>
      <div style={styles.card}>
        <h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'22px',color:colors.red,marginBottom:'16px'}}>Reporte de Viáticos</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
          <div><label style={styles.label}>Período</label><input style={styles.input} type="month" value={periodo} onChange={e=>setPeriodo(e.target.value)}/></div>
          <div><label style={styles.label}>Colaborador</label><select style={{...styles.input,appearance:'none'}} value={colaborador} onChange={e=>setColaborador(e.target.value)}><option value="">Todos</option>{names.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        </div>
        <button style={styles.btnGold} onClick={loadReport} disabled={loading}>{loading?'Cargando…':'Actualizar reporte'}</button>
      </div>
      {error&&<div style={{background:'#FFF3F3',border:`1.5px solid ${colors.red}`,borderRadius:'8px',padding:'12px 16px',color:colors.red,marginBottom:'16px'}}>{error}</div>}
      {rows.length>0&&(
        <>
          <div style={styles.card}>
            <h3 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'16px',color:colors.dark,marginBottom:'12px'}}>Comprobantes ({rows.length})</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                <thead><tr style={{background:colors.light}}>{['Fecha','Titular','Categoría','Proveedor','Forma pago','Monto','Foto','⚠'].map(h=>(<th key={h} style={{padding:'8px 10px',textAlign:'left',fontFamily:fonts.heading,fontWeight:700,fontSize:'12px',color:colors.midGray,letterSpacing:'0.5px',borderBottom:`2px solid ${colors.border}`,whiteSpace:'nowrap'}}>{h}</th>))}</tr></thead>
                <tbody>{rows.map((r,i)=>(<tr key={i} style={{background:r.Supera_tope==='TRUE'?'#FFF0F0':i%2===0?colors.white:colors.light,borderBottom:`1px solid ${colors.border}`}}>
                  <td style={{padding:'8px 10px',whiteSpace:'nowrap'}}>{r.Fecha_comprobante}</td>
                  <td style={{padding:'8px 10px',whiteSpace:'nowrap'}}>{r.Titular}</td>
                  <td style={{padding:'8px 10px'}}>{r.Categoria}</td>
                  <td style={{padding:'8px 10px',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.Proveedor}</td>
                  <td style={{padding:'8px 10px'}}><Badge color={r.Forma_pago==='Tarjeta JLA'?colors.blue:colors.green}>{r.Forma_pago}</Badge></td>
                  <td style={{padding:'8px 10px',whiteSpace:'nowrap',fontFamily:fonts.data,fontWeight:600}}>{formatCurrency(parseFloat(r.Monto_total||0))}</td>
                  <td style={{padding:'8px 10px'}}>{r.Foto_URL?<a href={r.Foto_URL} target="_blank" rel="noreferrer" style={{color:colors.blue,fontSize:'12px'}}>ver</a>:'—'}</td>
                  <td style={{padding:'8px 10px',textAlign:'center'}}>{r.Supera_tope==='TRUE'&&<span style={{color:colors.red,fontWeight:700,fontSize:'16px'}}>⚠</span>}</td>
                </tr>))}</tbody>
              </table>
            </div>
          </div>
          <div style={styles.card}>
            <h3 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'16px',color:colors.dark,marginBottom:'12px'}}>Resumen por categoría</h3>
            {Object.entries(byCategoria).sort((a,b)=>b[1]-a[1]).map(([cat,total])=>(<div key={cat} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${colors.border}`}}><span>{cat}</span><span style={{fontFamily:fonts.data,fontWeight:600}}>{formatCurrency(total)}</span></div>))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 0'}}><strong style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'15px'}}>TOTAL PERÍODO</strong><strong style={{fontFamily:fonts.data,fontWeight:700,fontSize:'17px',color:colors.red}}>{formatCurrency(rows.reduce((s,r)=>s+parseFloat(r.Monto_total||0),0))}</strong></div>
          </div>
          <div style={styles.card}>
            <h3 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'16px',color:colors.dark,marginBottom:'16px'}}>Conciliación</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              <div style={{background:colors.light,borderRadius:'8px',padding:'14px'}}>
                <p style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'13px',letterSpacing:'0.8px',color:colors.midGray,textTransform:'uppercase',marginBottom:'10px'}}>Tarjeta JLA</p>
                <p style={{fontSize:'13px',marginBottom:'4px'}}>Rendido: <strong>{formatCurrency(totalTarjeta)}</strong></p>
                {concil&&<p style={{fontSize:'13px',marginBottom:'4px'}}>Resumen banco: <strong>{formatCurrency(parseFloat(concil.Resumen_banco||0))}</strong></p>}
                {concil&&<p style={{fontSize:'13px',color:parseFloat(concil.Diferencia_tarjeta||0)===0?colors.green:colors.red}}>Diferencia: <strong>{formatCurrency(parseFloat(concil.Diferencia_tarjeta||0))}</strong></p>}
              </div>
              <div style={{background:colors.light,borderRadius:'8px',padding:'14px'}}>
                <p style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'13px',letterSpacing:'0.8px',color:colors.midGray,textTransform:'uppercase',marginBottom:'10px'}}>Efectivo</p>
                <p style={{fontSize:'13px',marginBottom:'4px'}}>Rendido: <strong>{formatCurrency(totalEfectivo)}</strong></p>
                {concil&&<p style={{fontSize:'13px',marginBottom:'4px'}}>Adelanto: <strong>{formatCurrency(parseFloat(concil.Adelanto_efectivo||0))}</strong></p>}
                {concil&&<p style={{fontSize:'13px',color:parseFloat(concil.Diferencia_efectivo||0)===0?colors.green:colors.red}}>Diferencia: <strong>{formatCurrency(parseFloat(concil.Diferencia_efectivo||0))}</strong></p>}
              </div>
            </div>
          </div>
        </>
      )}
      {!loading&&rows.length===0&&<div style={{...styles.card,textAlign:'center',color:colors.midGray,padding:'40px'}}>No hay comprobantes para el período y filtros seleccionados.</div>}
    </Layout>
  );
                                                     }
