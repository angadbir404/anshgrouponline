// POST /api/phonepe-pay -> creates a PhonePe checkout and returns { redirectUrl }
const {total}=require("./_prices");const {PG,token}=require("./_phonepe");
module.exports=async(req,res)=>{
  if(req.method!=="POST") return res.status(405).end();
  try{
    const {items}=req.body||{};
    const amount=total(items)*100; // paise
    const id="ANSH"+Date.now();
    const t=await token();
    const r=await fetch(PG+"/checkout/v2/pay",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"O-Bearer "+t},
      body:JSON.stringify({merchantOrderId:id,amount,expireAfter:1200,
        paymentFlow:{type:"PG_CHECKOUT",message:"AnshGroup order",merchantUrls:{redirectUrl:process.env.SITE_URL+"/?po="+id}}})});
    const d=await r.json(); if(!r.ok||!d.redirectUrl) return res.status(502).json({error:"gateway"});
    res.json({redirectUrl:d.redirectUrl});
  }catch(e){res.status(400).json({error:"bad request"})}
};
