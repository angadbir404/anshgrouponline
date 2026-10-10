// POST /api/razorpay-verify -> verifies the payment signature. Do your fulfilment (email, DB, etc.) after the check.
const crypto=require("crypto");
module.exports=(req,res)=>{
  if(req.method!=="POST") return res.status(405).end();
  const {razorpay_order_id:o,razorpay_payment_id:p,razorpay_signature:sig}=req.body||{};
  if(!o||!p||!sig) return res.status(400).json({error:"missing"});
  const exp=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(o+"|"+p).digest("hex");
  const ok=exp.length===sig.length&&crypto.timingSafeEqual(Buffer.from(exp),Buffer.from(sig));
  if(!ok) return res.status(400).json({error:"invalid signature"});
  // TODO: mark order as paid / notify yourself here.
  res.json({ok:true});
};
