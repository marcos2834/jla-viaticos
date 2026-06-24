import{getSheets,SHEET_ID}from './_sheets.js';
const H=['ID','Timestamp_carga','Titular','Tarjeta','Sociedad','Periodo','Fecha_comprobante','Categoria','Proveedor','CUIT','Tipo_comprobante','Numero','Forma_pago','Moneda','Subtotal','IVA_21','IVA_105','Exento','No_gravado','Imp_int','Monto_total','Noches','Monto_por_noche','Supera_tope','Observaciones','Foto_URL','Modo_carga'];
const HC=['Periodo','Colaborador','Total_tarjeta_rendido','Resumen_banco','Diferencia_tarjeta','Total_efectivo_rendido','Adelanto_efectivo','Diferencia_efectivo','Estado'];
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const{periodo,colaborador}=req.query;
  try{
    const sheets=await getSheets();
    const[movResp,concilResp]=await Promise.all([
      sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:'Movimientos!A2:AA',valueRenderOption:'UNFORMATTED_VALUE'}),
      sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:'Conciliacion!A2:I',valueRenderOption:'UNFORMATTED_VALUE'}).catch(()=>({data:{values:[]}}))
    ]);
    let rows=(movResp.data.values||[]).map(row=>{const o={};H.forEach((h,i)=>{o[h]=row[i]!==undefined?String(row[i]):'';});return o;});
    if(periodo)rows=rows.filter(r=>r.Periodo===periodo);
    if(colaborador)rows=rows.filter(r=>r.Titular===colaborador);
    let conciliacion=null;
    if(periodo&&colaborador){
      const cr=(concilResp.data.values||[]).map(r=>{const o={};HC.forEach((h,i)=>{o[h]=r[i]!==undefined?String(r[i]):'';});return o;});
      conciliacion=cr.find(r=>r.Periodo===periodo&&r.Colaborador===colaborador)||null;
    }
    res.json({rows,conciliacion});
  }catch(e){console.error('report error:',e);res.status(500).json({error:e.message,rows:[],conciliacion:null});}
}
