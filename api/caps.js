import{getSheets,SHEET_ID}from './_sheets.js';
export default async function handler(req,res){
  try{
    const sheets=await getSheets();
    const resp=await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:'Topes!A2:C',valueRenderOption:'UNFORMATTED_VALUE'});
    const caps={};
    (resp.data.values||[]).forEach(([cat,tope,unidad])=>{if(cat)caps[cat]={tope:parseFloat(tope)||0,unidad:unidad||'por comprobante'};});
    res.json({caps});
  }catch(e){console.error(e);res.status(500).json({error:e.message,caps:{}});}
}
