import fs from 'fs';
import Arweave from 'arweave';
import dotenv from 'dotenv';
dotenv.config();



import { actions, utils, programs, NodeWallet } from '@metaplex/js';
import {
	clusterApiUrl,
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
} from '@solana/web3.js';


// wallet from env
const wallet = {
	// kty: process.env.KTY,
	n: process.env.N,
	e: process.env.E,
	d: process.env.D,
	p: process.env.P,
	q: process.env.Q,
	dp: process.env.DP,
	dq: process.env.DQ,
	qi: process.env.QI,
};


(async () => {
	const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
	const keypair = Keypair.generate();

	const feePayerAirdropSignature = await connection.requestAirdrop(
		keypair.publicKey,
		LAMPORTS_PER_SOL
	);
	await connection.confirmTransaction(feePayerAirdropSignature);

	const arweave = Arweave.init({
		host: 'arweave.net',
		port: 443,
		protocol: 'https',
		timeout: 20000,
		logging: false,
	});

	//   const config = await arweave.wallets.generate()

	// * Upload image to Arweave
	const data = fs.readFileSync('./22.SUM.png');

	const transaction = await arweave.createTransaction(
		{
			data: data,
		},
		wallet
	);

	transaction.addTag('Content-Type', 'image/png');

	await arweave.transactions.sign(transaction, wallet);

	const response = await arweave.transactions.post(transaction, wallet);
	// console.log(response);

	const id = transaction.id;
	const imageUrl = id ? `https://arweave.net/${id}` : undefined;
	console.log('imageUrl', imageUrl);




	//  !  Upload metadata to Arweave

	const metadata = {
		name: 'Custom NFT #1',
		symbol: 'CNFT',
		description: 'A description about my custom NFT #1',
		seller_fee_basis_points: 500,
		external_url: 'https://www.customnft.com/',
		attributes: [
			{
				trait_type: 'NFT type',
				value: 'Custom',
			},
		],
		collection: {
			name: 'Test Collection',
			family: 'Custom NFTs',
		},
		properties: {
			files: [
				{
					uri: imageUrl,
					type: 'image/png',
				},
			],
			category: 'image',
			maxSupply: 0,
			creators: [
				{
					address: keypair.publicKey.toString(), // usesrs public address
					share: 100,
				},
			],
		},
		image: imageUrl,
	};

	const metadataRequest = JSON.stringify(metadata);

	const metadataTransaction = await arweave.createTransaction(
		{
			data: metadataRequest,
		},
		wallet
	);

	metadataTransaction.addTag('Content-Type', 'application/json');

	await arweave.transactions.sign(metadataTransaction, wallet);

	console.log('metadata txid', metadataTransaction.id);

	console.log(await arweave.transactions.post(metadataTransaction));
	const metaURL = metadataTransaction.id
		? `https://arweave.net/${metadataTransaction.id}`
		: undefined;
	console.log('metaURL', metaURL);

	// * mintNFT

	const mintNFTResponse = await actions.mintNFT({
		connection,
		wallet: new NodeWallet(keypair),
		uri: metaURL,
		maxSupply: 1,
	});

	console.log(mintNFTResponse);
})();
