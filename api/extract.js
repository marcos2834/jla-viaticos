import Anthropic from '@anthropic-ai/sdk';
const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});
const PROMPT=`Sos un asistente de extracción de datos de comprobantes fiscales argentinos. Analizá la imagen y devolvé ÚNICAMENTE un objeto JSON con estos campos (sin texto extra):
{"fecha_comprobante":"YYYY-MM-DD o null","proveedor":"razón social o null","cuit":"XX-XXXXXXXX-X o null","tipo_comprobante":"Factura A|Factura B|Factura C|Ticket|Otro","numero":"número o null","moneda":"ARS|USD|EUR","subtotal":null,"iva_21":null,"iva_105":null,"monto_total":null,"observaciones":"notas o null"}
Categorías válidas: Alojamiento, Desayuno, Almuerzo, Cena, Refrigerio, Estacionamiento, Peaje, Pasajes, Combustible, Otros.
Reglas: ARS por defecto; USD en observaciones; Factura A con IVA discriminado: completá subtotal/iva_21/iva_105; números sin símbolos ni separadores.`;
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const{base64,mimeType}=req.body;
  if(!base64)return res.status(400).json({error:'base64 requerido'});
  try{
    const msg=await client.messages.create({model:'claude-sonnet-4-5',max_tokens:1024,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mimeType||'image/jpeg',data:base64}},{type:'text',text:PROMPT}]}]});
    const text=msg.content[0].text.trim();
    const m=text.match(/\{[\s\S]*\}/);
    if(!m)throw new Error('La IA no devolvió JSON válido');
    res.json(JSON.parse(m[0]));
  }catch(e){console.error('extract error:',e);res.status(500).json({error:e.message});}
}
