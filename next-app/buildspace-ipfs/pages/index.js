import Head from 'next/head'
import React, { useState, useEffect} from "react";
import items from "./api/items.json";
import CreateItem from '../components/CreateItem'
import Item from '../components/Item';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { resolveToWalletAddress, getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";


//Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
var currentWalletNftsImages = [];
var currentWalletNftSymbols = [];

export default function App() {
  const { publicKey } = useWallet();
  const [memes, setMemes] = useState([]);
  // Header Button States
  const [creating, setCreating] = useState(false);
  const [viewMemes, setViewMemes] = useState(false);
  const [viewNfts, setViewNfts] = useState(false);
  // Solana Wallet ***********************************************************
  const [accessGranted, setAccessGranted] = useState(false);

  const renderNotConnectedContainer = () => (
    <div className="button-container">
      <WalletMultiButton className="cta-button connect-wallet-button" />
    </div>    
  );
  
  const renderAccessDeniedContainer = () => (
    <div className="memes-container">
      <img src="https://media.giphy.com/media/f8Gk0YteGgcqaEktvD/giphy.gif" alt="access denied" />
    </div>
  );
  


  /****************************************************************************** */
  // SOL-Rayz NFT Parsing
  async function checkOwnership() {
    
    const address = publicKey.toString();
    const publicAddress = await resolveToWalletAddress({
      text: address
    });
    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress,
    });
    for (let i = 0; i <= nftArray.length - 1; i++) {
       
      const results = await fetch(nftArray[i].data.uri).catch(err => { console.log(err) });
      if(results){
        const data = await results.json();
        if(data.image != undefined){
          currentWalletNftsImages.push(data.image);
        }
        if(data.symbol != undefined){
          currentWalletNftSymbols.push(data.symbol);
          // SET ACCESS GRANTE SYMBOL HERE******
          if(data.symbol === "NOOT"){
            setAccessGranted(true);
          }
        }
      } 
    }
    console.log(currentWalletNftsImages)
    console.log(currentWalletNftSymbols)
  }

  const renderNftImageContainer = () => (
    <div className="memes-container">
      {currentWalletNftsImages.map((nft) => (
        <div key={nft.id}>
          <img src={nft} className='meme'/>
        </div>
      ))}
    </div>
  );

  const renderMemesContainer = () => (
    <div className="memes-container">
      {memes.map((meme) => (
        <Item key={meme.id} item={meme} className='meme'/>
      ))}
    </div>
  );
  
  useEffect(() => {
    setMemes(items);
    console.log("memes are:",memes)
  }, []);

  useEffect(() => {
    if (publicKey) {
      checkOwnership();
    }
  }, [publicKey]);

  return (
    <div className="App">
      <Head>
        <title>Buildspace IPFS Beam-Up</title>
        <meta name="description" content="Generated by @_buildspace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="header-container">
        {!publicKey && renderNotConnectedContainer()}
        {publicKey && <WalletDisconnectButton />}
        {publicKey && 
          <button className="cta-button" onClick={() => setViewNfts(!viewNfts)}>
            {viewNfts ? "Back" : "View Nfts in Wallet"}
          </button>
        }
        {accessGranted ? 
        <>
          <button className="cta-button" onClick={() => setCreating(!creating)}>
            {creating ? "Back" : "Create Product"}
          </button>
          <button className="cta-button" onClick={() => setViewMemes(!viewMemes)}>
            {viewMemes ? "Back" : "View Memes"}
          </button>
        </>
        : null}
        
        
      </header>

      <main className=''>
        {/* Change if you want Access Granted based on PublicKey being present or Access Granted being true*/}
        {/* {publicKey && creating && <CreateItem />} */}
        {creating && <CreateItem />}
        {viewMemes && renderMemesContainer()}
        {viewNfts && renderNftImageContainer()}
        {publicKey && !accessGranted && renderAccessDeniedContainer()}
      </main>

      <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src="twitter-logo.svg" />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
    </div>
  )
}
