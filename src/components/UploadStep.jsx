import React,{useRef,useState}from 'react';
import{colors,styles,fonts}from '../theme.js';
export default function UploadStep({onExtracted,onManual}){
  const fileRef=useRef();
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  async function handleFile(e){
    const file=e.target.files?.[0];
    if(!file)return;
    setError('');setLoading(true);
    try{
      const reader=new FileReader();
      reader.onload=async()=>{
        try{
          const base64=reader.result.split(',')[1];
          const mimeType=file.type||'image/jpeg';
          const res=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({base64,mimeType})});
          const data=await res.json();
          if(!res.ok)throw new Error(data.error||'Error al procesar imagen');
          onExtracted({...data,_fileBase64:base64,_fileMime:mimeType,_fileName:file.name});
        }catch(err){setError(err.message);}finally{setLoading(false);}
      };
      reader.onerror=()=>{setError('No se pudo leer el archivo');setLoading(false);};
      reader.readAsDataURL(file);
    }catch(err){setError(err.message);setLoading(false);}
  }
  return(
    <div style={styles.card}>
      <h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'22px',color:colors.red,marginBottom:'8px'}}>Cargar comprobante</h2>
      <p style={{fontSize:'14px',color:colors.midGray,marginBottom:'24px'}}>Sacá una foto del ticket o factura. La IA extraerá los datos automáticamente.</p>
      {loading?(
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{width:'48px',height:'48px',border:`4px solid ${colors.border}`,borderTopColor:colors.red,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
          <p style={{fontFamily:fonts.heading,fontWeight:500,color:colors.midGray,fontSize:'16px'}}>Analizando con IA…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      ):(
        <>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFile}/>
          <button style={{...styles.btnPrimary,marginBottom:'12px'}} onClick={()=>fileRef.current?.click()}>📷 &nbsp; Sacar foto / Subir imagen</button>
          <button style={styles.btnSecondary} onClick={onManual}>✏️ &nbsp; Sin comprobante (carga manual)</button>
          {error&&<div style={{marginTop:'16px',background:'#FFF3F3',border:`1.5px solid ${colors.red}`,borderRadius:'7px',padding:'12px 14px',color:colors.red,fontSize:'14px'}}>{error}</div>}
        </>
      )}
    </div>
  );
                                   }
