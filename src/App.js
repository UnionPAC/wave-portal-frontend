import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import waveAbi from "../src/utils/WavePortal.json";

import napoleonDynamite from "../src/napoleon_dynamite.gif";
import progressBar from "../src/progress-bar.gif";
import "./App.css";

export default function App() {
  const waveContractAddress = "0x38cFfadC426cE9c7255FB0282C1EBf37cf12e66C";

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState();
  const [allWaves, setAllWaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // See if user is connected and authenticated
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      // Check if we have to window.ethereum object
      if (!ethereum) {
        console.log("Make sure you have MetaMask installed!");
      } else {
        console.log("We got the ethereum object 👍");
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please Install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log("Account Connected:", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Send a WAVE
  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        let inputMsg = document.getElementById("messageInput");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const waveContract = new ethers.Contract(
          waveContractAddress,
          waveAbi.abi,
          signer
        );
        let count = await waveContract.getTotalWaveCount();
        console.log("Our total wave count is ", count.toNumber());

        const waveTx = await waveContract.wave(inputMsg.value, {gasLimit: 300000});
        inputMsg.value = "";
        setLoading(true);
        console.log("Mining...", waveTx.hash);
        await waveTx.wait();
        setLoading(false);
        console.log("Mined -- ", waveTx.hash);

        count = await waveContract.getTotalWaveCount();
        setTotalWaves(count.toNumber());
        getAllWaves();
        console.log("Our total wave count is ", count.toNumber());
      } else {
        console.log("We don't have the Ethereum object");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get the TOTAL WAVE count #
  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const waveContract = new ethers.Contract(
          waveContractAddress,
          waveAbi.abi,
          signer
        );
        let count = await waveContract.getTotalWaveCount();
        setTotalWaves(count.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveContract = new ethers.Contract(
          waveContractAddress,
          waveAbi.abi,
          signer
        );

        const waves = await waveContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        console.log(wavesCleaned);
        wavesCleaned.reverse();

        setAllWaves(wavesCleaned);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(waveContractAddress, waveAbi.abi, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  useEffect(() => {
    getTotalWaves();
    checkIfWalletIsConnected();
    //eslint-disable-next-line
  }, []);

  return (
    <div className="mainContainer">
      <div className="header">👋 Howdy Partner!</div>
      <div>
        <img
          src={napoleonDynamite}
          alt="Napoleon Dynamite Waving!"
          style={{
            width: "550px",
            boxShadow: "box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
          }}
        />
      </div>
      <div className="bio">
        <p>
          Welcome to the Wave Station 👻 &nbsp; I'm Geoff and I want to make the
          world a better place by creating cool things that can help others 🙂
        </p>
        <p style={{ fontSize: "14px" }}>
          <em>
            Connect your MetaMask wallet, say hi and throw me a wave! You'll
            have a 50% chance to win 0.005 ETH just by sending me a wave
          </em>
        </p>
      </div>
      {currentAccount && (
        <div>
            {allWaves.length > 0 && <div style={{ margin: '20px 0', fontSize: '15px', color: '#2eb7ff' }}>{totalWaves} people have waved</div>}
        </div>
      )}
      {currentAccount && (
        <input
          id="messageInput"
          type="text"
          placeholder="Type your message here..."
        />
      )}
      <div className="btns">
        {!currentAccount && (
          <button className="btn connect-wallet-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="btn wave-btn" onClick={wave}>
            Wave at Me
          </button>
        )}
        {loading && (
          <div className="loading">
            <img src={progressBar} alt="loading..."></img>
          </div>
        )}
      </div>

      {allWaves.map((wave, index) => {
        return (
          <div
            className="messages"
            key={index}
            style={{
              backgroundColor: "#d2f8d2",
              marginTop: "25px",
              padding: "12px",
              width: '700px',
              fontFamily: "monospace",
              fontSize: "16px",
              borderRadius: "5px",
            }}
          >
            <div className="message">
              <strong>Address:</strong> {wave.address}
            </div>
            <div className="message">
              <strong>Time:</strong> {wave.timestamp.toString()}
            </div>
            <div className="message">
              <strong>Message:</strong> {wave.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
