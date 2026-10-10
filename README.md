# AnshGroup – deploy guide
Static React SPA (`index.html`, React/GSAP/Lenis from CDN) + Vercel serverless functions in `/api`. No build step.

## Deploy (5 minutes)
1. Push this folder to GitHub, import it at vercel.com (Framework: Other). Or run `npx vercel` here.
2. Add the environment variables from `.env.example`.
3. In `index.html`, top of the script, edit `CFG` (`gateway`: "razorpay" or "phonepe") and the `SELLER` block (already filled from the CV). WhatsApp is set to 919814222255.
4. Seller CV is already at `cv/Harjit-Singh-CV.pdf` (replace the file to update it).

## Payments
- Razorpay: `api/razorpay-order.js` creates the order, checkout opens in the browser, `api/razorpay-verify.js` checks the signature.
- PhonePe: `api/phonepe-pay.js` returns a redirect URL, the customer returns to `/?po=<id>`, `api/phonepe-status.js` confirms.
- Totals are computed on the server from `api/_prices.js`. Update it whenever you change prices in `index.html` (index = product id).
- Add your own fulfilment (email/DB/Sheet) where marked TODO in `razorpay-verify.js`. Test in Razorpay test mode / PhonePe sandbox first.
