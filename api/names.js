import{getSheets,SHEET_ID}from './_sheets.js';
export default async function handler(req,res){
  try{
    const sheets=await getSheets();
    const resp=await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:'Movimientos!C2:C',valueRenderOption:'UNFORMATTED_VALUE'});
    const names=[...new Set((resp.data.values||[]).flat().filter(Boolean))].sort();
    res.json({names});
  }catch(e){console.error(e);res.status(500).json({error:e.message,names:[]});}
}
