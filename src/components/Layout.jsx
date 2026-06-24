import React from 'react';
import{colors,fonts}from '../theme.js';
export default function Layout({children}){
  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:colors.light}}>
      <header style={{background:colors.white,borderBottom:`4px solid ${colors.gold}`,padding:'0 20px',height:'64px',display:'flex',alignItems:'center',boxShadow:'0 1px 6px rgba(0,0,0,0.07)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{background:colors.red,color:colors.white,fontFamily:fonts.heading,fontWeight:700,fontSize:'22px',letterSpacing:'2px',padding:'6px 14px',borderRadius:'4px'}}>JLA</div>
          <span style={{fontFamily:fonts.heading,fontWeight:500,fontSize:'17px',color:colors.dark,letterSpacing:'0.5px'}}>Rendición de Viáticos</span>
        </div>
      </header>
      <main style={{flex:1,padding:'20px 16px',maxWidth:'600px',width:'100%',margin:'0 auto'}}>{children}</main>
      <footer style={{background:colors.gold,padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontFamily:fonts.data,fontWeight:600,fontSize:'12px',color:colors.dark,letterSpacing:'0.5px'}}>JLA · Sistema de Rendición de Gastos</span>
      </footer>
    </div>
  );
        }
