import { actions, utils, programs, NodeWallet } from "@metaplex/js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const keypair = Keypair.generate();
  // console.log(keypair);
  console.log(keypair.publicKey);
  const feePayerAirdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(feePayerAirdropSignature);

  actions.mintNFT({
    connection,
    wallet: new NodeWallet(keypair),
    uri: "https://bjtbqhtlqhdln4t5id24mbq6h66izkbj6tmnauouelaenuddq45a.arweave.net/U1NsWLusuoDLwjpzwb7d7pThU8lPLEqJY05CSOxsvFw",
    maxSupply: 1,
  }).then(e => console.log(e)).catch((e) => console.error(e));

  // console.log(mintNFTResponse);
})();

