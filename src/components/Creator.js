import "../App.css";
import Contractm from "../contractABI.json";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import { CircularProgress } from "@mui/material";

const contractAddress = Contractm.contractAddress;
const contractABI = Contractm.abi;

const Creator = () => {
  const [tokenName, setTokenName] = useState();
  const [tokenSymbol, setTokenSymbol] = useState();
  const [tokenAmount, setTokenAmount] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [showCircular, setShowCircular] = useState(false);

  const provider = useRef();
  const Contract = useRef();
  const signer = useRef();
  const contractWithSigner = useRef();

  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        provider.current = new ethers.providers.Web3Provider(window.ethereum);
        Contract.current = new ethers.Contract(
          contractAddress,
          contractABI,
          provider.current
        );
        await provider.current.send("eth_requestAccounts", []);
        signer.current = provider.current.getSigner();
        contractWithSigner.current = Contract.current.connect(signer.current);
      }
    })();
  }, []);

  async function connectToMetamask() {
    await provider.current.send("eth_requestAccounts", []);
    signer.current = provider.current.getSigner();
    contractWithSigner.current = Contract.current.connect(signer.current);
  }

  async function findAddress() {
    return new Promise((resolve) => {
        Contract.current.on("Created", (_addressOfToken) => {
          resolve(_addressOfToken);
        });
      });
    }

  async function createToken() {
    setShowCircular(true);

    await contractWithSigner.current.create(
      tokenName,
      tokenSymbol,
      tokenAmount
    );

    const address = await findAddress();
    setTokenAddress(address);
    
    setShowCircular(false);
  }

  return (
    <div>
      <div className="connect-Metamask">
        <Button onClick={connectToMetamask} variant="contained">
          Connect Metamask
        </Button>
      </div>
      <TextField
        onChange={(e) => {
          setTokenName(e.target.value);
        }}
        label="Token Name"
        color="secondary"
        focused
      />
      <br />
      <br />
      <TextField
        onChange={(e) => {
          setTokenSymbol(e.target.value);
        }}
        label="Token Symbol"
        color="secondary"
        focused
      />
      <br />
      <br />
      <TextField
        onChange={(e) => {
          setTokenAmount(e.target.value);
        }}
        label="Mint Amount"
        color="secondary"
        focused
      />
      <br />
      <br />
      <Button onClick={createToken} variant="outlined">
        CREATE TOKEN
      </Button>
      <br />
      <br />
      {showCircular ? <CircularProgress /> : ""}
      <p>
        Your {tokenName}, {tokenSymbol} token contract address is:
        <br />
        <a
          href={"https://testnet.snowtrace.io/address/" + tokenAddress}
          target="_blank"
          rel="noreferrer"
        >
          {tokenAddress}
        </a>
      </p>
    </div>
  );
};

export default Creator;
