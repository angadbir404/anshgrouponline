// POST /api/razorpay-order  -> creates a Razorpay order for the cart total
const {total}=require("./_prices");
module.exports=async(req,res)=>{
  if(req.method!=="POST") return res.status(405).end();
  try{
    const {items,customer}=req.body||{};
    const amount=total(items)*100; // paise
    const auth=Buffer.from(process.env.RAZORPAY_KEY_ID+":"+process.env.RAZORPAY_KEY_SECRET).toString("base64");
    const r=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",
      headers:{Authorization:"Basic "+auth,"Content-Type":"application/json"},
      body:JSON.stringify({amount,currency:"INR",receipt:"ansh_"+Date.now(),notes:{name:customer?.name,phone:customer?.phone,address:customer?.addr}})});
    const d=await r.json(); if(!r.ok) return res.status(502).json({error:"gateway"});
    res.json({orderId:d.id,amount:d.amount,key:process.env.RAZORPAY_KEY_ID});
  }catch(e){res.status(400).json({error:"bad request"})}
};
