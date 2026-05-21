require('dotenv').config();
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

const k = process.env.SOLANA_PRIVATE_KEY;
if (!k) {
  console.log('NO_KEY');
  process.exit(0);
}

try {
  let sk;
  if (k.trim().startsWith('[')) {
    sk = Uint8Array.from(JSON.parse(k));
  } else {
    sk = bs58.decode(k.trim());
  }
  console.log('DECODE_OK length=' + sk.length);
  try {
    const kp = Keypair.fromSecretKey(sk);
    console.log('PUBKEY=' + kp.publicKey.toBase58());
  } catch (e) {
    console.log('KEYPAIR_ERROR=' + e.message);
  }
} catch (e) {
  console.log('DECODE_ERROR=' + e.message);
}
