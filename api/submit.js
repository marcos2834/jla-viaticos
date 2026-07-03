import{getSheets,getDrive,SHEET_ID,DRIVE_FOLDER_ID}from './_sheets.js';
import{PassThrough}from 'stream';
function getPeriod(d){if(!d)return'';const dt=new Date(d);if(isNaN(dt))return'';return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0');}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
async function uploadToDrive(drive,base64,mimeType,fileName,folderId){
const buf=Buffer.from(base64,'base64');
const stream=new PassThrough();
stream.end(buf);
const ext=(mimeType||'image/jpeg').split('/')[1]||'jpg';
const name=fileName||('comprobante-'+uid()+'.'+ext);
const resp=await drive.files.create({requestBody:{name,parents:[folderId]},media:{mimeType:mimeType||'image/jpeg',body:stream},fields:'id,webViewLink'});
try{await drive.permissions.create({fileId:resp.data.id,requestBody:{role:'reader',type:'anyone'}});}catch(e){console.warn('permissions warn:',e.message);}
return resp.data.webViewLink||('https://drive.google.com/file/d/'+resp.data.id+'/view');
}
async function getCaps(sheets){
try{const r=await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:'Topes!A2:C',valueRenderOption:'UNFORMATTED_VALUE'});const caps={};(r.data.values||[]).forEach(([cat,tope,unidad])=>{if(cat)caps[cat]={tope:parseFloat(tope)||0,unidad:unidad||'por comprobante'};});return caps;}catch{return{};}
}
export default async function handler(req,res){
if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
try{
const{_fileBase64,_fileMime,_fileName,...data}=req.body;
const sheets=await getSheets();
const drive=await getDrive();
let fotoUrl='';
if(_fileBase64&&DRIVE_FOLDER_ID){
try{fotoUrl=await uploadToDrive(drive,_fileBase64,_fileMime||'image/jpeg',_fileName,DRIVE_FOLDER_ID);}
catch(e){console.error('Drive upload failed:',e.message,e.stack);}
}
const caps=await getCaps(sheets);
const montoTotal=parseFloat(data.monto_total)||0;
const noches=parseInt(data.noches)||1;
const monto_por_noche=data.categoria==='Alojamiento'&&noches>0?montoTotal/noches:null;
let supera_tope=false;
const cap=caps[data.categoria];
if(cap&&cap.tope>0){const comparar=cap.unidad==='por noche'?(monto_por_noche||montoTotal):montoTotal;if(comparar>cap.tope)supera_tope=true;}
const id=uid();
const timestamp=new Date().toISOString();
const periodo=getPeriod(data.fecha_comprobante)||getPeriod(new Date().toISOString().slice(0,10));
const row=[
id,timestamp,
data.titular||'',data.tarjeta||'',data.sociedad||'',
periodo,data.fecha_comprobante||'',
data.destino||'',data.categoria||'',
data.proveedor||'',data.cuit||'',
data.tipo_comprobante||'',data.numero||'',
data.forma_pago||'',data.moneda||'ARS',
data.subtotal||'',data.iva_21||'',data.iva_105||'',
'','','',
montoTotal,data.noches||'',monto_por_noche||'',
supera_tope?'TRUE':'FALSE',
data.observaciones||'',fotoUrl,data.modo_carga||'Foto',
data.cuil_titular||'',
data.personas||'',
data.litros||'',
data.tipo_combustible||'',
data.hora_comprobante||'',
data.cliente_estudio||''
];
await sheets.spreadsheets.values.append({spreadsheetId:SHEET_ID,range:'Movimientos!A:AH',valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[row]}});
res.json({ok:true,id,supera_tope,foto_url:fotoUrl});
}catch(e){console.error('submit error:',e.message,e.stack);res.status(500).json({error:e.message});}
}
