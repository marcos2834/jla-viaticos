import{getSheets,SHEET_ID}from './_sheets.js';
import{normDominio,dominioValido,COL_DOMINIO}from './_dominio.js';
// Devuelve las patentes ya cargadas (para sugerir en el formulario y evitar errores de tipeo).
export default async function handler(req,res){
  try{
    const sheets=await getSheets();
    const resp=await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:`Movimientos!${COL_DOMINIO}2:${COL_DOMINIO}`,valueRenderOption:'UNFORMATTED_VALUE'});
    const dominios=[...new Set((resp.data.values||[]).flat().map(normDominio).filter(dominioValido))].sort();
    res.json({dominios});
  }catch(e){console.error(e);res.status(500).json({error:e.message,dominios:[]});}
}
