require('dotenv').config();
const k = process.env.SOLANA_PRIVATE_KEY;
if (!k) { console.log('NO_KEY'); process.exit(0); }
try {
  if (k.trim().startsWith('[')) {
    const arr = JSON.parse(k);
    if (!Array.isArray(arr)) { console.log('NOT_ARRAY'); process.exit(0); }
    console.log('ARRAY length=' + arr.length);
    process.exit(0);
  }
  const value = k.trim();
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  const ok = base58Regex.test(value);
  console.log('BASE58_VALID=' + ok + ' length=' + value.length);
} catch (e) {
  console.log('FORMAT_ERROR=' + e.message);
}
