import React, { Component } from "react";
import TestNFTContract from "../contracts/TestNFTContract.json";
import Swap from "../contracts/Swap.json";
import getWeb3 from "../getWeb3";
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Bar from "./Bar";
import NFTCardGrid from "./NFTCardGrid";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import Card from '@material-ui/core/Card';
import OfferIcon from './OfferIcon';
import OfferGrid from './OfferGrid';
import { CardHeader } from '@material-ui/core';
import Offer from './Offer';
import OfferList from './OfferList';

import "./App.css";



class App extends Component {
  state = {web3: null, 
            accounts: null,
            contractNFT: null, 
            contractSwap: null, 
            userAddress: null,
            traderAddress:"", 
            numUserNFTs: null,
            numTraderNFTs: null,
            userNFTs: null,
            traderNFTs: null,
            userCreatedOffers: null, 
            userOffers: null,
            userImageURLs: null,
            addressEntered: false,
            offeredNFTIds: [],
            askedNFTIds: [],
            offeredNFTContracts: [],
            askedNFTContracts: [],
            activePage: "barter",
            offerArray: [],
            askArray: [],
            ethOffer: 0,
            ethAsk: 0,
            swapApproval: null,
            swapAddress: null,
            NFTAddress: null,
            trackedNFTAddresses: [],
            trackedNFTInstances: [],
            invalidAddress: false,
            inbox: true
          };

  componentDidMount = async () => {
    try {
      console.log("Begun")
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      console.log("Yikes")

      // ropsten addresses
      // const swapAddress = "0x7652a6791c304794de601f366B5B768CDb4CfBeA";
      // const NFTAddress = "0x13b939f04e9Ea0E8C28f4E8006A081E28b9a440e";
      // const NFTAddress2 = "0x4633555F8FbFA47360AC8bA3B02967cf6dF4718f";
      // const NFTAddress3 = "0x4DE4640051ECD928983Ce96dB7285Bc5AB0027a4";

      //local ganache addresses
      var swapAddress = "0xb6fc10BB88Cf9350bbBa356b3fb516BF3727632A";
      var NFTAddress = "0x2AEceCa1D43160062BA892F8730eBE05e8dE5409";
      var NFTAddress2 = "0x35046Cda39379162Bc6965b22b9bDA88B6C288f9";
      var NFTAddress3 = "0x34F667cbF63cb904D339fc53570A4bAcC98e8cDe";

      this.setState({
        trackedNFTAddresses: [NFTAddress, NFTAddress2, NFTAddress3]
      });

      console.log(this.state.trackedNFTAddresses)

      // NFTAddress = "0xF600A7734a9080fFa9156DE19edDc8f44CdDB895"; // axie deployed contract
      var temp_array = [];
      for(var i = 0; i < this.state.trackedNFTAddresses.length; i++) {
        temp_array.push(new web3.eth.Contract(
          TestNFTContract.abi,
          this.state.trackedNFTAddresses[i]
        ))
      }
      // console.log(temp_array)
      this.setState({
        trackedNFTInstances: temp_array
      })


      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const primaryAddress = accounts[0];
      web3.eth.defaultAccount = web3.eth.accounts[0];


      // Get the Test NFT contract instance.
      console.log("Getting NFT Contract");
      // const networkId = await web3.eth.net.getId();
      // const deployedNetworkTestNFT = TestNFTContract.networks[networkId];
      const instanceTestNFT = new web3.eth.Contract(
        TestNFTContract.abi,
        NFTAddress
      );

      console.log("Getting swap Contract");
      // Get the Swap contract instance.
      // const deployedNetworkSwap = Swap.networks[networkId];
      const instanceSwap = new web3.eth.Contract(
        Swap.abi,
        swapAddress
      );

      // const swapApproved = swap.
      // const {contractNFT, contractSwap } = this.state;
      // const isApproved = await instanceTestNFT.methods.isApprovedForAll(accounts[0], swapAddress).call();
      // console.log("Is Approved: "+isApproved);
      console.log("Setting state");
      // console.log(web3);
      // console.log(accounts);
      // console.log(instanceTestNFT);
      // console.log(instanceSwap);
      // console.log(accounts[0]);
      // console.log(isApproved);
      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0]
      });


      console.log("Getting user data");
      //this is an array of arrarys of size two, with NFTId and imageurl
      //"0x0000000000000000000000002f47d55c7f89a38aaf9470f9f83adb6e48918ac9"
      //"0x0000000000000000000000002f47d55c7f89a38aaf9470f9f83adb6e48918ac9"
      const userNFTs = await this.getData2(accounts[0]);
      
      console.log("Setting more state");
      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0],
        numUserNFTs: userNFTs.length,
        userNFTs: userNFTs,
        swapAddress: swapAddress,
        NFTAddress: NFTAddress
      });

      console.log("Loading offers")
      this.reloadOffers();

      console.log("Subscribing to offers")
      var userAddressTopic = "0x000000000000000000000000"+String(this.state.userAddress).toLowerCase().slice(2);
      console.log(userAddressTopic);
      var subscription = web3.eth.subscribe('logs', {
        address: this.state.swapAddress,
        topics:[null,userAddressTopic]
        },(error, result) => {
          if (!error)
            console.log(result);
          this.reloadOffers();
          // window.location.reload()
        }
      )

      console.log("Second subscription")

      var subscriptionNFTApproval = web3.eth.subscribe('logs', {
        address: this.state.NFTAddress,
        topics:[null, userAddressTopic, null]
        },(error, result) => {
          if (!error)
            console.log(result);
          this.reloadApproval();
          // window.location.reload()
        }
      )

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  reloadOffers = async () => {
    var offerData = await this.getOffers();
    var askData = await this.getAsks();
    console.log("Offers: "+offerData)
      
    this.setState({
      offerArray: offerData,
      askArray: askData
    });
  };

  reloadApproval = async () => {

    const isApproved = await this.state.contractNFT.methods.isApprovedForAll(this.state.userAddress, this.state.swapAddress).call();

    this.setState({
      swapApproval: isApproved
    });
  }

  proposeTrade = async (event) => { // add approval check beforehand
    // console.log("Break 0");
    event.preventDefault();
    var offerContractArr = [];
    var askContractArr = [];
    // const web3 = await getWeb3();
    // console.log("Break 1");
    // contractSwap.methods.getOfferOffVal(offerId).call()
    var fee = await this.state.contractSwap.methods.getFee().call();
    console.log("Fee: "+parseFloat(fee));
    for(var i = 0; i < this.state.offeredNFTContracts.length; i++) {
      offerContractArr[i] = this.state.offeredNFTContracts[i];
    }

    for(var i = 0; i < this.state.askedNFTContracts.length; i++) {
      askContractArr[i] = this.state.askedNFTContracts[i];
    }
    console.log("Ask Contract Array: "+askContractArr);
    console.log("Offer Contract Array: "+offerContractArr);
    const _offerValue = ((parseFloat(this.state.ethOffer)*(10**18)) || 0).toString();
    const _askValue = ((parseFloat(this.state.ethAsk)*(10**18)) || 0).toString();
    const _msgValue = parseFloat(_offerValue)+parseFloat(fee);
    console.log("Msg Value: "+_msgValue);
    console.log("Offer Value: "+_offerValue);
    console.log("Test change")

    var dedup = Array.from(new Set(offerContractArr));
    console.log("Contracts Post-dedup: "+dedup)
    for(var i = 0; i < dedup.length; i++) {
      console.log("Dedup[i]: "+dedup[i])
      var contractIndex = this.state.trackedNFTAddresses.indexOf(dedup[i])
      console.log("Contract Index: "+contractIndex)
      var isApproved = await this.state.trackedNFTInstances[contractIndex].methods.isApprovedForAll(this.state.userAddress, this.state.swapAddress).call();
      // var isInAsk = 
      console.log("IS APPROVED: "+isApproved)
      // var temp = await
      if(!isApproved) 
         this.state.trackedNFTInstances[contractIndex].methods.setApprovalForAll(this.state.swapAddress, "true").send({from:this.state.userAddress});
    }


    // console.log("Eth offer - propose trade: "+_offerValue);
    // console.log("Eth ask - propose trade: "+_askValue);

    // console.log("Offered IDs: "+this.state.offeredNFTIds)
    // console.log("Offered Contracts: "+this.state.offeredNFTContracts)
    // console.log("Asked IDs: "+this.state.askedNFTIds)
    // console.log("Asked Contracts: "+this.state.askedNFTContracts)
    // console.log("Offer Val: "+String(_offerValue))
    // console.log("Ask Val: "+String(_askValue))
    // console.log("Offerer Address: "+this.state.userAddress)
    // console.log("Ask Address: "+this.state.traderAddress)
    const transactionReceipt = await this.state.contractSwap.methods.addOffer(this.state.offeredNFTIds
                                                                              ,this.state.offeredNFTContracts
                                                                              ,this.state.askedNFTIds
                                                                              ,this.state.askedNFTContracts
                                                                              ,_offerValue
                                                                              ,_askValue
                                                                              ,this.state.traderAddress).send({from:this.state.userAddress, value:_msgValue})

    this.setState({offeredNFTIds: [],
      askedNFTIds: [],
      offeredNFTContracts: [],
      askedNFTContracts: []
    })

  }

  acceptTrade = async (offerId, _askContracts) => { // add approval check beforehand
    const {contractNFT, contractSwap } = this.state;
    console.log("Contracts Pre-dedupe: "+_askContracts)
    var dedup = Array.from(new Set(_askContracts));
    console.log("Contracts Post-dedup: "+dedup)
    var fee = await this.state.contractSwap.methods.getFee().call();
    var ask = await this.state.contractSwap.methods.getOfferAskVal(offerId).call();
    console.log("Fee: "+fee)
    console.log("Ask: "+ask)
    var msgVal = parseFloat(fee)+parseFloat(ask);
    for(var i = 0; i < dedup.length; i++) {
      console.log("Dedup[i]: "+dedup[i])
      var contractIndex = this.state.trackedNFTAddresses.indexOf(dedup[i])
      console.log("Contract Index: "+contractIndex)
      var isApproved = await this.state.trackedNFTInstances[contractIndex].methods.isApprovedForAll(this.state.userAddress, this.state.swapAddress).call();
      // var isInAsk = 
      console.log("IS APPROVED: "+isApproved)
      if(!isApproved) 
        var temp = await this.state.trackedNFTInstances[contractIndex].methods.setApprovalForAll(this.state.swapAddress, "true").send({from:this.state.userAddress});
    }
    const transactionReceipt = await this.state.contractSwap.methods.acceptOffer(offerId).send({from:this.state.userAddress, value:msgVal})
  }

  cancelTrade = async (offerId) => { // add approval check beforehand
    const {contractNFT, contractSwap } = this.state;
    const transactionReceipt = await this.state.contractSwap.methods.cancelOffer(offerId).send({from:this.state.userAddress})
  }

  addNFTToOffered = (type, nftid, contract) => {
    if(type == "offer") {
      var arr = this.state.offeredNFTIds;
      arr.push(nftid)
      var arr2 = this.state.offeredNFTContracts;
      arr2.push(contract.toString())
      this.setState({
          offeredNFTIds: arr
          ,offeredNFTContracts: arr2
      });
    } else {
      var arr = this.state.askedNFTIds;
      arr.push(nftid)
      var arr2 = this.state.askedNFTContracts;
      arr2.push(contract.toString())
      this.setState({
        askedNFTIds: arr
        ,askedNFTContracts: arr2
      });
    }
    console.log("*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=")
    console.log("Asked NFTs: "+this.state.askedNFTIds);
    console.log("Asked Contracts: "+this.state.askedNFTContracts);
    console.log("Offered NFTs: "+this.state.offeredNFTIds);
    console.log("Offered Contracts: "+this.state.offeredNFTContracts);
  };

  removeNFTfromOffered = (type, nftid, contract) => {
    if(type == "offer") {
      var arr = this.state.offeredNFTIds;
      var arr2 = this.state.offeredNFTContracts;
      var temp_arr = []
      for (var i = 0; i < arr.length; i++){
        temp_arr.push(arr[i]+','+arr2[i]);
      }
      var ind = temp_arr.indexOf(nftid+','+contract);
      temp_arr.splice(ind, 1);
      arr = []
      arr2 = []
      for (var i = 0; i < temp_arr.length; i++){
        arr.push(temp_arr[i].split(",")[0]);
        arr2.push(temp_arr[i].split(",")[1]);
      }
      this.setState({offeredNFTIds: arr, offeredNFTContracts: arr2});
    } else {
      var arr = this.state.askedNFTIds;
      var arr2 = this.state.askedNFTContracts;
      var temp_arr = []
      for (var i = 0; i < arr.length; i++){
        temp_arr.push(arr[i]+','+arr2[i]);
      }
      var ind = temp_arr.indexOf(nftid+','+contract);
      temp_arr.splice(ind, 1);
      arr = []
      arr2 = []
      for (var i = 0; i < temp_arr.length; i++){
        arr.push(temp_arr[i].split(",")[0]);
        arr2.push(temp_arr[i].split(",")[1]);
      }
      this.setState({askedNFTIds: arr, askedNFTContracts: arr2});
    }
    console.log("*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=")
    console.log("Asked NFTs: "+this.state.askedNFTIds);
    console.log("Asked Contracts: "+this.state.askedNFTContracts);
    console.log("Offered NFTs: "+this.state.offeredNFTIds);
    console.log("Offered Contracts: "+this.state.offeredNFTContracts);
  };

  setActivePage = (pageName) => {
    this.setState({activePage: pageName});
  };

  // getContractInstance = async(NFTaddress, web3) => {
  //   const instanceSwap = new web3.eth.Contract(
  //     Swap.abi,
  //     swapAddress
  //   );
  // };

  getData = async (NFTaddress) => {
    const {contractNFT, contractSwap } = this.state;
    const numNFTs = await contractNFT.methods.balanceOf(NFTaddress).call();
    const NFTdata = [];
    // const imageURLs = [];
    for(var i = 0; i < numNFTs; i++) {
      var NFTId = await contractNFT.methods.tokenOfOwnerByIndex(NFTaddress, i).call();
      NFTId = parseInt(NFTId);
      // NFTIds.push(NFTId);
      var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(NFTId));
      res = await res.json();
      // imageURLs.push(res.image);
      
      NFTdata.push([NFTId, res.image]);
    }

    return NFTdata;
  };

  getData2 = async (userAddress) => {
    const {contractSwap, trackedNFTInstances, trackedNFTAddresses} = this.state;
    console.log(trackedNFTAddresses);
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=***")
    const NFTdata = [];
    for(var i = 0; i < trackedNFTAddresses.length; i++) {
      var contractNFT = trackedNFTInstances[i];
      const numNFTs = await contractNFT.methods.balanceOf(userAddress).call();
      console.log("Found "+String(numNFTs)+ " NFTs at contract "+String(trackedNFTAddresses[i]))
      
      for(var j = 0; j < numNFTs; j++) {
        var NFTId = await contractNFT.methods.tokenOfOwnerByIndex(userAddress, j).call();
        // NFTId = parseInt(NFTId);
        
        var NFTname = await this.getName(NFTId, trackedNFTAddresses[i], trackedNFTAddresses);
        var NFTimage = await this.getImageURL(NFTId, trackedNFTAddresses[i], trackedNFTAddresses);

        // var NFTname = 'hi'
        // var NFTimage = 'https://lh3.googleusercontent.com/17vU_UNWeMOVi4XOAwo4nvAXpeg1dnKPBk8VnAhJcFHOFZ9UBBvSL5Spj0ytvyfII3rdp4gHMY0mMvbnSzjdOZ0=s0'

        NFTdata.push([NFTId, NFTimage, NFTname, trackedNFTAddresses[i]]);
      }

    }
    
    return NFTdata;
  };

  getName = async (id, address, trackedNFTAddresses) => {
    if(address == trackedNFTAddresses[0]) {
      return "Axie #"+String(id);
    }

    if(address == trackedNFTAddresses[1]) {
      id = parseInt(id);
      return "Land ("+String(id%408)+", "+String(Math.floor(id/408))+")"
    }

    if(address == trackedNFTAddresses[2]) {
      console.log('Fetching https://api.decentraland.org/v1/parcels/'+String(id))
      var res = await fetch('https://api.decentraland.org/v1/parcels/'+String(id));
      res = await res.json();
      console.log("JSON: "+res)
      var x = res.data.x;
      var y = res.data.y;
      // var x = 5;
      // var y = 5;
      return "Land ("+String(x)+", "+String(y)+")"
    }

    return null
  };

  getImageURL = async (id, address, trackedNFTAddresses) => {
    // console.log(trackedNFTAddresses)
    if(address == trackedNFTAddresses[0]) {
      var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(id));
      res = await res.json();
      return res.image;
    }

    if(address == trackedNFTAddresses[1]) {
      return "https://lh3.googleusercontent.com/17vU_UNWeMOVi4XOAwo4nvAXpeg1dnKPBk8VnAhJcFHOFZ9UBBvSL5Spj0ytvyfII3rdp4gHMY0mMvbnSzjdOZ0=s0";
    }

    if(address == trackedNFTAddresses[2]) {
      var res = await fetch('https://api.decentraland.org/v1/parcels/'+String(id));
      res = await res.json();
      console.log("JSON: "+String(res))
      var x = res.data.x;
      var y = res.data.y;
      // var x = 5;
      // var y = 5;
      return "https://api.decentraland.org/v1/map.png?width=333&height=250&size=10&center="+String(x)+","+String(y)+"&selected="+String(x)+","+String(y);
    }

    return null
    
  };

  getOffers = async () => {
    const {contractNFT, contractSwap, trackedNFTInstances, trackedNFTAddresses } = this.state;
    const numOffers = await contractSwap.methods.offerCountByAddress(this.state.userAddress).call()

    var NFTdata_2 = [];

    for(var i = 0; i < numOffers; i++) {
      var offerId = await contractSwap.methods.offersByAddress(this.state.userAddress, i).call()
      var offerState = await contractSwap.methods.getOfferState(offerId).call()
      
      var offer = await this.getOfferData(offerId)
      var offerImages = []
      var offerNames = []
      var offerContracts = []
      var url = ""
      var name = ""

      var offVal = await contractSwap.methods.getOfferOffVal(offerId).call()
      var askVal = await contractSwap.methods.getOfferAskVal(offerId).call()
      
      for(var j = 0; j < offer[0].length; j++) {
        url = await this.getImageURL(String(offer[0][j]), offer[2][j], trackedNFTAddresses)
        name = await this.getName(String(offer[0][j]), offer[2][j], trackedNFTAddresses)
        offerImages.push(url)
        offerNames.push(name)
        offerContracts.push(offer[2][j])
      }

      var askImages = []
      var askNames = []
      var askContracts = []
      for(var j = 0; j < offer[1].length; j++) {
        url = await this.getImageURL(String(offer[1][j]), offer[3][j], trackedNFTAddresses)
        name = await this.getName(String(offer[1][j]), offer[3][j], trackedNFTAddresses)
        askImages.push(url)
        askNames.push(name)
        askContracts.push(offer[3][j])
      }
      
      if(offerState) {
        console.log("Offer Contracts: "+offerContracts)
        console.log("Ask Contracts: "+askContracts)
        NFTdata_2.push([offer[0], offer[1], offerImages, askImages, offerId, offVal, askVal, offerNames, askNames, offerContracts, askContracts]);
      }
      
    }
    console.log("Offer Data: "+NFTdata_2)
    
    return NFTdata_2

  };

  getAsks = async () => {
    const {contractNFT, contractSwap, trackedNFTInstances, trackedNFTAddresses } = this.state;
    const numOffers = await contractSwap.methods.offersCreatedCountByAddress(this.state.userAddress).call()

    var NFTdata = [];

    for(var i = 0; i < numOffers; i++) {
      var offerId = await contractSwap.methods.offersCreatedByAddress(this.state.userAddress, i).call()
      var offerState = await contractSwap.methods.getOfferState(offerId).call()
      var offer = await this.getOfferData(offerId)
      var offerImages = []
      var offerNames = []
      var offerContracts = []
      var url = ""
      var name = ""

      var offVal = await contractSwap.methods.getOfferOffVal(offerId).call()
      var askVal = await contractSwap.methods.getOfferAskVal(offerId).call()
      
      for(var j = 0; j < offer[0].length; j++) {
        // console.log("Offer ID: "+String(offer[0][j]))
        // console.log("Offer Contract: "+String(offer[2][j]))
        url = await this.getImageURL(String(offer[0][j]), offer[2][j],trackedNFTAddresses)
        name = await this.getName(String(offer[0][j]), offer[2][j],trackedNFTAddresses)
        offerImages.push(url)
        offerNames.push(name)
        offerContracts.push(offer[2][j])
      }

      var askImages = []
      var askNames = []
      var askContracts = []
      for(var j = 0; j < offer[1].length; j++) {
        url = await this.getImageURL(String(offer[1][j]), offer[3][j], trackedNFTAddresses)
        name = await this.getName(String(offer[1][j]), offer[3][j], trackedNFTAddresses)
        askImages.push(url)
        askNames.push(name)
        askContracts.push(offer[3][j])
      }

      if(offerState) {
        console.log("Offer Contracts: "+offerContracts)
        console.log("Ask Contracts: "+askContracts)
        NFTdata.push([offer[0], offer[1], offerImages, askImages, offerId, offVal, askVal, offerNames, askNames, offerContracts, askContracts]);
      }

      
      
    }
    console.log("Ask Data: "+NFTdata)
    
    return NFTdata

  }

  getOfferData = async (offerId) => {
    const {contractNFT, contractSwap} = this.state;

    // Get NFT Ids being offered to user
    const offerLength = await contractSwap.methods.getOfferLengthFromOffer(offerId).call()
    var offerIds = []
    var offerContracts = []
    // const numOffers = contractSwap.methods.offerCountByAddress(this.state.userAddress)
    for(var i = 0; i < offerLength; i++) {
      offerIds.push (await contractSwap.methods.getOfferFromOffer(offerId, i).call())
      offerContracts.push (await contractSwap.methods.getContractFromOffer(offerId, i).call())
    }

    // Get NFT Ids being asked of the user
    const askLength = await contractSwap.methods.getOfferLengthFromAsk(offerId).call()
    var askIds = []
    var askContracts = []
    // const numOffers = contractSwap.methods.offerCountByAddress(this.state.userAddress)
    for(var i = 0; i < askLength; i++) {
      askIds.push (await contractSwap.methods.getOfferFromAsk(offerId, i).call())
      askContracts.push (await contractSwap.methods.getContractFromAsk(offerId, i).call())
    }

    return [offerIds, askIds, offerContracts, askContracts]
  }

  handleSubmit = async (event) => {

    event.preventDefault();

    

    try {
      const traderNFTs = await this.getData2(this.state.traderAddress);
      this.setState({addressEntered: true, traderNFTs: traderNFTs, numTraderNFTs: traderNFTs.length});
    } catch (error) {
      this.setState({invalidAddress: true});
    }
    
    // console.log("Event value: "+event.target.value);
    
  };

  handleAddressChange = async (event) => {

    event.preventDefault();
    this.setState({traderAddress: event.target.value});
    console.log("Address: "+this.state.traderAddress);
    console.log("Event value: "+event.target.value);
  };

  handleEthOfferChange = async (event) => {

    this.setState({ethOffer: event.target.value});
    console.log("Eth offer: "+ this.state.ethOffer);
    console.log("Event value: "+event.target.value);
  };

  handleEthAskChange = async (event) => {

    this.setState({ethAsk: event.target.value});
    console.log("Eth ask: "+ this.state.ethAsk);
    console.log("Event value: "+event.target.value);
  };

  mineMint = async () => {
    const {contractNFT, contractSwap } = this.state;

    // mint random id nft for fake NFY
    // const receipt = await contractNFT.methods.mine(this.state.userAddress, Math.floor(Math.random()*1000)).send({from:this.state.userAddress})
    
    // mint nft for axie contract
    var randContract = Math.floor(Math.random()*3);
    console.log("Rand Contract: "+String(randContract))
    var mintContract = this.state.trackedNFTInstances[randContract];
    console.log("Mint Contract: "+String(mintContract.address))
    if (randContract == 0) {
      const receipt = await mintContract.methods.mine(this.state.userAddress, Math.floor(Math.random()*100000)).send({from:this.state.userAddress})
    } else {
      if(randContract == 1) {
        const receipt = await mintContract.methods.mine(this.state.userAddress, Math.floor(Math.random()*166464)).send({from:this.state.userAddress})
      } else {
        var id_array = [
          "115792089237316195423570985008687907842040666557249594745166221962664778662033",
          "32667107224410092492483962313449748299754",
          "31986542490568215565557213098586211876843",
          "32326824857489154029020587706017980088299",
          "50702072671219831056042816507333463506834",
          "115792089237316195423570985008687907848846313895668364014433714111300142890889"
        ];
        const receipt = await mintContract.methods.mine(this.state.userAddress, id_array[Math.floor(Math.random()*6)]).send({from:this.state.userAddress})
      }
    }
  };

  render() {
    
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }

    if(this.state.activePage == "barter") {

      return (

        <div className="App">
          <Bar mineMint={this.mineMint} setActivePage={this.setActivePage}></Bar>
          <div>
          <div>&nbsp;</div>
          <Grid container justify='center'>
          <Card style={{ 
                 fontColor: 'white'
                , border:'10px'
                , borderColor:'#000000'
                , minHeight: '2vh'
                , maxHeight: '2vh'
                , paddingLeft: 10
                , paddingRight: 10
                , paddingTop: 3
                , paddingBottom: 3
                , borderRadius: '5px 5px 5px 5px'
                , background: '#f34444'
                // , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                 }}><Typography color='secondary' style={{fontSize:14}}>WARNING: This app is still in beta. Use at own risk.</Typography></Card></Grid>
          {/* {(this.state.activePage == "barter") ? */}
          <div>&nbsp;</div>
          <form onSubmit={this.proposeTrade}>
          <Button type='submit' color='secondary' variant='outlined' 
              style={{
                // background:'linear-gradient(315deg, #cf17b9, #e46144, #cf17b9)'
                // background:'linear-gradient(315deg, #f28de6, #cf17b9, #f28de6, #cf17b9)'
                background:'linear-gradient(315deg,  #D00D0D, #f34444, #D00D0D)'
                
                }}><Typography fontSize={18}>Propose Trade</Typography></Button>
          </form>


          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="center"
            justify="space-evenly"
            // xs={3}
            style={{minWidth:'100%', minHeight: '10vh', padding:'1', maxHeight:'10vh'}}
          >
          
          <Grid item style={{ minHeight: '5vh', paddingRight:'10', maxHeight:'5vh'}}>
          <form onChange={this.handleEthOfferChange}>
              <FormGroup>
                <TextField 
                  style={{maxWidth:'200px', minWidth:'200px'}}
                  value={this.state.ethOffer} 
                  id="ethoffer" 
                  label="$ETH Offer"
                  type="number" 
                  variant="outlined"  />
              </FormGroup>
            </form>
            </Grid>
            <Grid item style={{ minHeight: '5vh', padding:'1', maxHeight:'5vh'}}></Grid>
          <Grid item style={{ minHeight: '5vh', padding:'1', maxHeight:'5vh'}}>
          {(!this.state.addressEntered) ? <div></div> :
          <form onChange={this.handleEthAskChange}>
              <FormGroup>
                <TextField 
                  style={{maxWidth:'200px', minWidth:'200px'}}
                  value={this.state.ethAsk}
                  id="ethask" 
                  label="$ETH Ask"
                  type="number" 
                  variant="outlined"  />
              </FormGroup>
            </form>
            }
            </Grid>
            </Grid>
            <div>&nbsp;</div>
        

          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="flex-start"
            justify="space-evenly"
            // xs={3}
            style={{ minHeight: '10vh', padding:'1', maxHeight:'10vh'}}
          >
          
          <NFTCardGrid 
            offeredNFTIds={this.state.offeredNFTIds}
            pullNFTOffer={this.removeNFTfromOffered}
            pushNFTOffer={this.addNFTToOffered}
            nftType={"offer"}
            numCards={this.state.numUserNFTs} 
            userNFTs={this.state.userNFTs} 
            maxWidth="40%" minWidth="40%"
            minHeight="60vh" maxHeight="60vh"></NFTCardGrid>
{/* 
          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="center"
            justify="space-evenly"
            // xs={3}
            style={{ minHeight: '10vh', padding:'1', maxHeight:'10vh', minWidth:'40%', maxWidth: '40%'}}
          > */}
          {(!this.state.addressEntered) ? 
            <Grid
            container
            spacing={2}
            alignItems="flex-end"
            justify="center"
            style={{ maxHeight:'10vh', minWidth:'40%', maxWidth: '40%'}}
            >

              <form onSubmit={this.handleSubmit}>
              <Card style={{ 
                maxWidth: '80%'
                , minWidth: '80%'
                // , minHeight: '35vh'
                // , maxHeight: '35vh'
                , paddingLeft: 30
                ,paddingRight: 25
                , paddingTop: 10
                , paddingBottom: 30
                , borderRadius: '20px 20px 20px 20px'
                , background: '#D00D0D'
                // , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                 }}><Typography color='secondary'>Address</Typography>
              <Card elevation='0' style={{ 
                maxWidth: '80%'
                , minWidth: '80%'
                // , minHeight: '35vh'
                // , maxHeight: '35vh'
                , paddingLeft: 30
                ,paddingRight: 30
                , paddingTop: 10
                , paddingBottom:30
                , borderRadius: '10px 10px 10px 10px'
                , background: '#fceefa'
                // , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                 }}>
              <FormGroup>
              <p style={{color:'red', fontSize:24, fontStyle: 'italic'}}>{(this.state.invalidAddress)?'Invalid Address':' '}</p>
              <TextField 
                onChange={this.handleAddressChange} 
                value={this.state.traderAddress} 
                id="outlined-basic" 
                label="" 
                variant="outlined"  />
              <Button type="submit">
                Enter 
              </Button>
              
              </FormGroup>
              </Card>
              </Card>
                </form>
                </Grid>
            :      
            <NFTCardGrid 
              offeredNFTIds={this.state.askedNFTIds} 
              pullNFTOffer={this.removeNFTfromOffered} 
              pushNFTOffer={this.addNFTToOffered}
              nftType={"ask"}
              numCards={this.state.numTraderNFTs} 
              userNFTs={this.state.traderNFTs} 
              maxWidth="40%" minWidth="40%" minHeight="60vh" maxHeight="60vh"></NFTCardGrid>
          }
        
          </Grid>
        
          </div>
        </div>

      );
    } else {
      return (
        <div className="App">
          <Bar setActivePage={this.setActivePage}></Bar>
          <div>&nbsp;</div>
          <div>&nbsp;</div>

          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="flex-start"
            justify="flex-start"
            // xs={3}
            style={{ minHeight: '8vh', padding:'1'}}
          >
            <div style={{minWidth: '10%'}}></div>
            <Button style={{maxWidth:'10vh'}} color='primary' variant='outlined' onClick={()=>{this.setState({inbox: true})}}>Inbox</Button>
            &nbsp;
            <Button color='primary' variant='outlined' onClick={()=>{this.setState({inbox: false})}}>Created</Button>
          </Grid>
          

          <Grid container
            spacing={0}
            flexgrow={1}
            alignItems="flex-start"
            justify="space-evenly"
            // xs={3}
            style={{ minHeight: '0vh', padding:'0'}}
          > 
            
            
            <Card style={{ 
                maxWidth: '80%'
                , minWidth: '80%'
                , minHeight: '70vh'
                , maxHeight: '70vh'
                , paddingLeft: 0
                , paddingTop: 10
                , paddingBottom: 10
                , borderRadius: '20px 20px 20px 20px'
                , background: '#D00D0D'
                // , background: '#f01414'
                // , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                 }}>
                  <Grid container
                  flexgrow={1}
                  alignItems="flex-start"
                  justify="flex-start"
                  style={{ minHeight: '5vh'}}
                >
                  <Grid item style={{minWidth: '53%'}}><Typography color='secondary'>Give</Typography></Grid>
                  <Grid item style={{minWidth: '19%'}}><Typography color='secondary'>Receive</Typography></Grid>
                  </Grid>
                  <div>&nbsp;</div>
                <Grid container
                  flexgrow={1}
                  alignItems="center"
                  justify="space-evenly"
                  // xs={3}
                  style={{ minHeight: '10vh'}}
                >
                  {this.state.inbox?
                  <OfferList
                    type={true}
                    offerArray={this.state.offerArray}
                    acceptTrade={this.acceptTrade}
                    >
                  </OfferList>
                  :
                  <OfferList
                    type={false}
                    offerArray={this.state.askArray}
                    acceptTrade={this.cancelTrade}
                    >
                  </OfferList>
                  }
                </Grid>
            </Card>
          </Grid>
          
          
          
        </div>
        
      );
    }
  }
}

export default App;
