import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import abi from "./utils/Vote.json";

import { Flex, Box, Text, chakra, Button } from '@chakra-ui/react';
import { AvatarGenerator } from 'random-avatar-generator';
 
const contractAddress = "0xA9A299775Df5B00d87a916d399a6BA14c48783EE";
const contractABI = abi.abi;

const generator = new AvatarGenerator();

const Image = chakra('img');

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidates, setCandidates] = useState(null);
  const [voting, setVoting] = useState(false);
  const [votingId, setVotingId] = useState(0);
  
  const walletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }
  
      console.log("We have the ethereum object: ", ethereum);
  
      const accounts = await ethereum.request({ method: "eth_accounts" });
  
      if(accounts.length === 0) {
        console.log("No authorized account found");
        return;
      }
  
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
  
      setCurrentAccount(account);
      return;
    } catch (error) {
      console.log(error);
    }
  }
  
  const getCandidates = async () => {
    try {
      const { ethereum } = window;
      
      if(!ethereum) {
      console.error("Ethereum object doesn't exist!");
      return;
      }   
      
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const voteContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      let _candidates = await voteContract.getCandidates();
      _candidates = _candidates.filter(candidate => candidate.id > 0).map(candidate => ({
        ...candidate,
        avatar: generator.generateRandomAvatar()
      }));

      setCandidates(_candidates);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if(candidates) {
      return;
    }
    
    getCandidates();
  }, [])
  
  useEffect(() => {
    walletIsConnected();  
  }, [])

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        alert("Make sure you have metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const vote = useCallback(async (id) => {
    try {
      const { ethereum } = window;
      
      if(!ethereum) {
        console.error("Ethereum object doesn't exist!");
        return;
      }   
      
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const voteContract = new ethers.Contract(contractAddress, contractABI, signer);

      setVoting(true);
      setVotingId(id);
      const voteTxn = await voteContract.vote(id);
      console.log("Mining...", voteTxn.hash);

      await voteTxn.wait();
      console.log("Mined --", voteTxn.hash);

      const updatedCandidates = candidates.map(candidate => {
        if(Number(candidate.id) === Number(id)) {
          return {
            ...candidate,
            votes: candidate.votes + 1
          }
        }

        return candidate;
      })

      setCandidates(updatedCandidates);
      setVoting(false);
      setVotingId(0);
    } catch (error) {
      console.error(error);
    }
  }, [candidates])
  
  return (
    <Flex 
      direction="column" 
      alignItems="center" 
      justifyContent="center" 
      backgroundColor="#0f0327" 
      height="100vh">
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <Flex gridGap="16px" marginTop="32px">
          {candidates?.map(candidate => (
            <Box 
              key={candidate.id}
              backgroundColor="#410da9"
              borderRadius="16px"
              padding="16px">
              <Image 
                width="100%" 
                height="112px" 
                src={candidate.avatar} />
              <Text 
                  color="#ccc" 
                  marginTop="16px"
                  fontWeight="600"
                  fontSize="14px"
              >
                {candidate.name}
              </Text>
              <Text 
                  color="#fff" 
                  marginTop="16px"
                  fontWeight="600"
              >
                Votes: {candidate.votes}
              </Text>

              <Button 
                  width="100%"
                  marginTop="32px"
                  backgroundColor="#00C89C"
                  onClick={() => vote(candidate.id)}
                  isLoading={voting && votingId === candidate.id}
                  loadingText="Votando"
              >
                Vote
              </Button>
            </Box>
          ))}
        </Flex>
    </Flex>
  );
}
