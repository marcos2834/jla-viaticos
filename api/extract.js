import Anthropic from '@anthropic-ai/sdk';
const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});

// Entidades JLA (comprador/receptor). Nunca deben tomarse como proveedor.
const JLA_CUITS=['30-68401360-9','30-71500651-7'];
const onlyDigits=(s)=>String(s||'').replace(/\D/g,'');
const JLA_CUITS_NORM=JLA_CUITS.map(onlyDigits);

const PROMPT=`Sos un asistente de extraccion de datos de comprobantes fiscales argentinos. Analiza la imagen y devolve UNICAMENTE un objeto JSON con estos campos (sin texto extra):
{"fecha_comprobante":"YYYY-MM-DD o null","hora_comprobante":"HH:MM o null","proveedor":"razon social o null","cuit":"XX-XXXXXXXX-X o null","tipo_comprobante":"Factura A|Factura B|Factura C|Ticket|Otro","numero":"numero o null","moneda":"ARS|USD|EUR","subtotal":null,"iva_21":null,"iva_105":null,"monto_total":null,"categoria":"una de las categorias validas segun reglas","personas":"cantidad de personas si es comida, sino null","observaciones":"notas o null"}
IMPORTANTE - Proveedor vs comprador: El comprador/receptor del comprobante es SIEMPRE JLA. Las siguientes entidades son el COMPRADOR y NUNCA deben usarse como "proveedor" ni su CUIT como "cuit": "JLA Argentina S.A." (CUIT 30-68401360-9) y "JLA Cono Sur S.A." (CUIT 30-71500651-7). Los campos "proveedor" y "cuit" deben corresponder SIEMPRE al emisor/vendedor que factura (el proveedor real), no al receptor. Si el CUIT que detectas coincide con 30-68401360-9 o 30-71500651-7, descartalo y busca el otro CUIT presente en el documento, que es el del proveedor. Si no encontras un CUIT distinto al de JLA, deja "cuit" y "proveedor" en null.
Categorias validas: Alojamiento, Desayuno, Almuerzo, Cena, Refrigerio, Estacionamiento, Peaje, Pasajes, Combustible, Otros. Clasifica "categoria" asi: usa la hora_comprobante para comidas -> antes de las 11:00 y sea cafe/medialunas/factura/tostado/desayuno = Desayuno; entre 11:00 y 16:00 = Almuerzo; despues de las 20:00 = Cena; snack/gaseosa/cafe fuera de esos horarios = Refrigerio. Nafta/gasoil/GNC/combustible/estacion de servicio (YPF, Shell, Axion, Puma) = Combustible. Hotel/hosteria/alojamiento/noche = Alojamiento. Peaje/autopista = Peaje. Cochera/parking = Estacionamiento. Pasaje/colectivo/tren/avion/taxi/remis = Pasajes. Si no encaja = Otros. Para "personas": en Desayuno/Almuerzo/Cena/Refrigerio estima la cantidad de comensales segun el ticket; si no se puede determinar, pone 1. En otras categorias pone null.
Reglas: ARS por defecto; USD en observaciones; Factura A con IVA discriminado: completa subtotal/iva_21/iva_105; hora_comprobante en formato 24hs (HH:MM) si el comprobante muestra un horario, sino null; numeros sin simbolos ni separadores.`;

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const{base64,mimeType}=req.body;
  if(!base64)return res.status(400).json({error:'base64 requerido'});
  try{
    const msg=await client.messages.create({model:'claude-sonnet-4-5',max_tokens:1024,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mimeType||'image/jpeg',data:base64}},{type:'text',text:PROMPT}]}]});
    const text=msg.content[0].text.trim();
    const m=text.match(/\{[\s\S]*\}/);
    if(!m)throw new Error('La IA no devolvio JSON valido');
    const data=JSON.parse(m[0]);
    // Salvaguarda: si el CUIT extraido es de JLA (comprador), descartar proveedor/cuit
    if(JLA_CUITS_NORM.includes(onlyDigits(data.cuit))){data.cuit=null;data.proveedor=null;}
    res.json(data);
  }catch(e){console.error('extract error:',e);res.status(500).json({error:e.message});}
}
