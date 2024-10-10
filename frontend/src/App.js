import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import idl from './idl.json';
import {Connection, 
PublicKey,
 clusterApiUrl 
} from '@solana/web3.js';
import { 
 Program,
 AnchorProvider,
web3,
    BN,
     utils 
    } from '@coral-xyz/anchor';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';
// import Buffer from 'buffer';
// window.Buffer = Buffer;

const programID = new PublicKey(idl.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment:'processed',
}
const { SystemProgram } = web3; 

function App() {
  const [campaigns,setCampaigns] = useState([])

  const getProvider = ()=>{
    const connection = new Connection(network,opts.preflightCommitment)
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment)
    return provider;
  }
  const checkIfWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found")
          const response = await solana.connect({
            onlyIfTrusted:true
          })
        } else {
          alert("Get a phantom wallet");
        }
      } else {
        alert("Solana object not foundGet a phantom wallet");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const [walletAddress,setWalletAddress] =  useState(null);


  const connectWallet = async ()=>{
    const {solana} = window;
    if(solana){
      const response = await solana.connect();
      console.log("Connected with the public key");
      console.log("Connected with publick key:" ,response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }else{
      console.log("Solana not detected");
    }
  }

  const renderNotConnectedBtn = ()=>{
    return <button onClick={connectWallet}>Connect Wallet</button>
  }
  const renderCreateCampaignButton = ()=>{
    return <button onClick={createCampaign}>Create Campaign</button>
  }
  const renderGetCampaignButton = ()=>{
    return <button onClick={getCampaign}>Get Campaign List</button>
  }
  useEffect(() => {
    const onload = async () => {
      await checkIfWalletConnected();
    }
    window.addEventListener("load", onload);
    return () => window.removeEventListener("load", onload)
  }, [])

  const createCampaign = async ()=>{
    try{
      const provider = getProvider();
     
      const program = new Program(idl, provider,);
      const [campaign] =  PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
        provider.wallet.publicKey.toBuffer()
      ], 
    program.programId
  )
    await program.rpc.create('First Campaign Name','This is for description', {
      accounts:{
        campaign,
        user: provider.wallet.publicKey,
        systemProgram:SystemProgram.programId
      } 
    });

    console.log(
      "Created a new campaign w/ address:",
      campaign.toString()
    );

    }catch(err){
      console.error(err)
    }
  } 
  const getCampaign = async ()  =>{
    const connection = new Connection(network,opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program(idl,programID, provider);
    Promise.all(
      ((await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
          ...(program.account.campaign.fetch(campaign.pubKey)),
          pubKey: campaign.pubKey
        })
      ))
    ).then((cps) => setCampaigns(cps));


  }


  const donate = async (pk)=>{
    try{
      const provider = getProvider();
      const program = new Program(idl, provider);
      program.account.campaign.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaigns: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      })
    }catch(e){

    }
  }
  return (<>
    <div className="App" style={{marginTop:300}}>
      {walletAddress? <h3>Wallet Connected</h3> : renderNotConnectedBtn()}
      {walletAddress && renderCreateCampaignButton()}
      {walletAddress && renderGetCampaignButton()}
    </div>
    <div>
      {
        campaigns.map(campaign => (<>
        <p>Campaign ID: {campaign.pubKey.toString()}</p>
        <p>Balance: {campaign.amountDonated / web3.LAMPORTS_PER_SOL}</p>
        <p>Name: {campaign.name}</p>
        <p>{campaign.description}</p>
        </>))
      }
    </div>
    </>
  );
}

export default App;
