// PhonePe Standard Checkout (v2) helpers. Confirm endpoints against PhonePe's current docs when you get credentials.
const BASE=process.env.PHONEPE_ENV==="production"?"https://api.phonepe.com/apis":"https://api-preprod.phonepe.com/apis/pg-sandbox";
const PG=process.env.PHONEPE_ENV==="production"?"https://api.phonepe.com/apis/pg":"https://api-preprod.phonepe.com/apis/pg-sandbox";
const AUTH=process.env.PHONEPE_ENV==="production"?"https://api.phonepe.com/apis/identity-manager/v1/oauth/token":"https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
async function token(){
  const r=await fetch(AUTH,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:process.env.PHONEPE_CLIENT_ID,client_secret:process.env.PHONEPE_CLIENT_SECRET,client_version:process.env.PHONEPE_CLIENT_VERSION||"1",grant_type:"client_credentials"})});
  const d=await r.json(); if(!r.ok) throw new Error("auth"); return d.access_token;
}
module.exports={PG,token};
