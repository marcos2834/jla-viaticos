import{google}from 'googleapis';
const SCOPES=['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive'];
export function getAuth(){
  const credentials=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.GoogleAuth({credentials,scopes:SCOPES});
}
export async function getSheets(){const auth=await getAuth().getClient();return google.sheets({version:'v4',auth});}
export async function getDrive(){const auth=await getAuth().getClient();return google.drive({version:'v3',auth});}
export const SHEET_ID=process.env.GOOGLE_SHEET_ID;
export const DRIVE_FOLDER_ID=process.env.GOOGLE_DRIVE_FOLDER_ID;
