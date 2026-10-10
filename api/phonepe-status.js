// POST /api/phonepe-status {id} -> { state: COMPLETED | PENDING | FAILED }
const {PG,token}=require("./_phonepe");
module.exports=async(req,res)=>{
  if(req.method!=="POST") return res.status(405).end();
  try{
    const id=String((req.body||{}).id||"");if(!/^ANSH\d+$/.test(id)) return res.status(400).json({error:"bad id"});
    const t=await token();
    const r=await fetch(PG+"/checkout/v2/order/"+id+"/status",{headers:{Authorization:"O-Bearer "+t}});
    const d=await r.json(); res.json({state:d.state});
  }catch(e){res.status(400).json({error:"bad request"})}
};
