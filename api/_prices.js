// Server-side source of truth for prices (INR). Index = product id in index.html. Keep in sync with the catalog.
const PRICES=[89990,94990,47990,82500,24990,28490,31990,28990,9490,6990,4299,1499,12990,15490,32990,24999,79999,799];
function total(items){
  if(!Array.isArray(items)||!items.length||items.length>50) throw new Error("bad items");
  return items.reduce((s,i)=>{const p=PRICES[i.id],q=Number(i.qty);
    if(p===undefined||!Number.isInteger(q)||q<1||q>20) throw new Error("bad item");return s+p*q},0);
}
module.exports={PRICES,total};
