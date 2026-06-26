import React,{useState}from 'react';
import Layout from '../components/Layout.jsx';
import IdentityGate from '../components/IdentityGate.jsx';
import UploadStep from '../components/UploadStep.jsx';
import ConfirmStep from '../components/ConfirmStep.jsx';
import SuccessStep from '../components/SuccessStep.jsx';
import{getIdentity,clearIdentity}from '../utils/storage.js';
import{colors,fonts}from '../theme.js';
export default function Home(){
const[identity,setIdentity]=useState(getIdentity);
const[step,setStep]=useState('upload');
const[extracted,setExtracted]=useState(null);
const[isManual,setIsManual]=useState(false);
function handleChange(){clearIdentity();setIdentity(null);setStep('upload');}
function handleExtracted(data){setExtracted(data);setIsManual(false);setStep('confirm');}
function handleManual(){setExtracted({});setIsManual(true);setStep('confirm');}
function handleSubmitted(){setStep('success');}
function handleAnother(){setExtracted(null);setIsManual(false);setStep('upload');}
return(
<Layout>
{identity&&(
<div style={{background:'#fff',border:'1.5px solid #ddd',borderRadius:'8px',padding:'10px 16px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<span style={{fontFamily:fonts.body,fontSize:'14px',color:colors.dark}}>
<strong>Cargando como:</strong> {identity.nombre}{identity.cuil&&` · CUIL: ${identity.cuil}`} · {identity.sociedad}{identity.tarjeta&&` · *${identity.tarjeta}`}
</span>
<button onClick={handleChange} style={{background:'none',border:'none',color:colors.red,fontFamily:fonts.body,fontSize:'13px',cursor:'pointer',textDecoration:'underline'}}>Cambiar</button>
</div>
)}
{!identity&&<IdentityGate onSave={setIdentity}/>}
{identity&&step==='upload'&&<UploadStep onExtracted={handleExtracted} onManual={handleManual}/>}
{identity&&step==='confirm'&&<ConfirmStep extracted={extracted} isManual={isManual} identity={identity} onSubmit={handleSubmitted} onBack={handleAnother}/>}
{identity&&step==='success'&&<SuccessStep onAnother={handleAnother}/>}
</Layout>
);
}
