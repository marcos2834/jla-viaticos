import React from 'react';
import{colors,styles,fonts}from '../theme.js';
export default function SuccessStep({onAnother}){
  return(
    <div style={{...styles.card,textAlign:'center',padding:'40px 24px'}}>
      <div style={{fontSize:'56px',marginBottom:'16px'}}>✅</div>
      <h2 style={{fontFamily:fonts.heading,fontWeight:700,fontSize:'24px',color:colors.red,marginBottom:'8px'}}>¡Comprobante guardado!</h2>
      <p style={{fontSize:'14px',color:colors.midGray,marginBottom:'28px'}}>El gasto fue registrado correctamente en la planilla.</p>
      <button style={styles.btnPrimary} onClick={onAnother}>+ &nbsp; Cargar otro comprobante</button>
    </div>
  );
}
