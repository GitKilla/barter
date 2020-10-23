import React, { Component } from "react";
import TestNFTContract from "../contracts/TestNFTContract.json";
import Swap from "../contracts/Swap.json";
import getWeb3 from "../getWeb3";
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import StyleButton from "./StyleButton";
import Bar from "./Bar";
import NFTCard from "./NFTCard";
import NFTCardGrid from "./NFTCardGrid";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


import "./App.css";



class Barter extends Component {
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
            askedNFTIds: []
          };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // this.handleSubmit = this.handleSubmit.bind(this);
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const primaryAddress = accounts[0];
      web3.eth.defaultAccount = web3.eth.accounts[0]

      console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")

      // Get the Test NFT contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetworkTestNFT = TestNFTContract.networks[networkId];
      const instanceTestNFT = new web3.eth.Contract(
        TestNFTContract.abi,
        "0xE36E11Cd5F920F6a4af6Db9ea8263c2C714aC706"
        // deployedNetworkTestNFT && deployedNetworkTestNFT.address,
      );

      console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
      
      // console.log(NFTIds);

      // Get the Swap contract instance.
      const deployedNetworkSwap = Swap.networks[networkId];
      const instanceSwap = new web3.eth.Contract(
        Swap.abi,
        "0x31F3fDA2A6268Fe4E48340ED144897Be2bC3718b",
      );
      console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")

      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0]
      });


      //this is an array of arrarys of size two, with NFTId and imageurl
      const userNFTs = await this.getData(accounts[0]);
      // const traderNFTs = await this.getData(accounts[1]);
      // const uI = await this.retrieveUserImages();
      // console.log(traderNFTs);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      console.log("-------------------------------------------------------");
      console.log(userNFTs);
      console.log(userNFTs.length);
      
      
      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0],
        numUserNFTs: userNFTs.length,
        userNFTs: userNFTs
        // numTraderNFTs: traderNFTs.length,
        // traderNFTs: traderNFTs
      });

      
      // console.log(this.state.numUserNFTs);
      

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  proposeTrade = async (event) => { // add approval check beforehand
    event.preventDefault();
    var offerContractArr = [];
    var askContractArr = [];
    for(var i = 0; i < this.state.offeredNFTIds.length; i++) {
      // console.log("This is what will be put in the array: "+String(this.state.contractNFT.address))
      offerContractArr[i] = "0xE36E11Cd5F920F6a4af6Db9ea8263c2C714aC706";//this.state.contractNFT.address;
    }

    for(var i = 0; i < this.state.askedNFTIds.length; i++) {
      askContractArr[i] = "0xE36E11Cd5F920F6a4af6Db9ea8263c2C714aC706";//this.state.contractNFT.address;
    }
    
    
    // console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
    // console.log("Offered NFTs"+this.state.offeredNFTIds)
    // console.log("Offer Contracts"+offerContractArr)
    // console.log("Asked NFTs"+this.state.askedNFTIds)
    // console.log("Ask Contracts"+askContractArr)
    // console.log("Trader Address"+this.state.traderAddress)
    // console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
    
    const transactionReceipt = await this.state.contractSwap.methods.addOffer(this.state.offeredNFTIds
                                                                            , offerContractArr
                                                                            ,this.state.askedNFTIds
                                                                            ,askContractArr
                                                                            ,0
                                                                            ,0
                                                                            ,this.state.traderAddress).send({from:this.state.userAddress})

    for(var i = 0; i < this.state.offeredNFTIds.length; i++) {
      this.removeNFTfromOffered("offer", this.state.offeredNFTIds[i])
    }

    for(var i = 0; i < this.state.askedNFTIds.length; i++) {
      this.removeNFTfromOffered("ask", this.state.askedNFTIds[i])
    }
  }

  addNFTToOffered = (type, nftid) => {
    if(type == "offer") {
      var arr = this.state.offeredNFTIds;
      arr.push(nftid)
      this.setState({offeredNFTIds: arr});
    } else {
      var arr = this.state.askedNFTIds;
      arr.push(nftid)
      this.setState({askedNFTIds: arr});
    }
    console.log(this.state.offeredNFTIds);
    console.log(this.state.askedNFTIds)
  };

  removeNFTfromOffered = (type, nftid) => {
    if(type == "offer") {
      var arr = this.state.offeredNFTIds;
      var ind = arr.indexOf(nftid);
      arr.splice(ind, 1);
      this.setState({offeredNFTIds: arr});
    } else {
      var arr = this.state.askedNFTIds;
      var ind = arr.indexOf(nftid);
      arr.splice(ind, 1);
      this.setState({askedNFTIds: arr});
    }
  };

  setActivePage = (pageName) => {
    this.state.activePage = pageName;
  }

  getData = async (NFTaddress) => {
    const {contractNFT, contractSwap } = this.state;
    // console.log("NFT Address to pull: "+String(NFTAddress));
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

  handleSubmit = async (event) => {
    // console.log("REGISTERED SUBMISSION");
    // console.log(event.target.value);
    event.preventDefault();
    // console.log(event.target.value);
    const traderNFTs = await this.getData(this.state.traderAddress);
    // const traderNFTs = await this.getData("0x6F594176203715e0822C342bd5D3e3857202C88F");
    this.setState({addressEntered: true, traderNFTs: traderNFTs, numTraderNFTs: traderNFTs.length});
    
  };

  handleAddressChange = async (event) => {
    // console.log("REGISTERED SUBMISSION");
    // console.log(event.target.value);
    event.preventDefault();
    // console.log(event.target.value);
    // const traderNFTs = await this.getData(event.target.value);
    // // const traderNFTs = await this.getData("0x6F594176203715e0822C342bd5D3e3857202C88F");
    this.setState({traderAddress: event.target.value});
    
  };


  render() {
//
    const useStyles = makeStyles((theme) => ({
      root: {
        flexGrow: 1,
      },
      paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
      bgs: {
        backgroundColor: "blue"
      }
    }));
    
    // const classes = useStyles();

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      
      <div className="App">
       

        <div>&nbsp;</div>
        <form onSubmit={this.proposeTrade}>
        <Button type='submit' color='primary' variant='outlined'><Typography fontSize={18} >Propose Trade</Typography></Button>
        </form>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        {/* <Button color="inherit" variant="outlined"> Test Button </Button> */}
        
        
        {/* <NFTCard userAddress={this.state.userAddress} variant="outlined"></NFTCard> */}

        


        <Grid container
          spacing={1}
          flexgrow={1}
          alignItems="flex-start"
          justify="space-evenly"
          // xs={3}
          style={{ minHeight: '10vh', padding:'1'}}
        >
        
        <NFTCardGrid 
          offeredNFTIds={this.state.offeredNFTIds} 
          pullNFTOffer={this.removeNFTfromOffered} 
          pushNFTOffer={this.addNFTToOffered}
          nftType={"offer"}
          numCards={this.state.numUserNFTs} 
          userNFTs={this.state.userNFTs} 
          maxWidth="40%"></NFTCardGrid>
        
        
        {(!this.state.addressEntered) ? 
          <Grid
          container
          spacing={2}
          alignItems="flex-end"
          justify="center"
          style={{ maxHeight:'10vh', maxWidth: '40%'}}
          >
            <form onSubmit={this.handleSubmit}>
            <FormGroup>
            <TextField onChange={this.handleAddressChange} value={this.state.traderAddress} id="outlined-basic" label="Address" variant="outlined"  />
            <Button type="submit">
              Enter 
            </Button>
            </FormGroup>
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
            maxWidth="40%" ></NFTCardGrid>
        }
        
        {/* <NFTCardGrid numCards={this.state.numTraderNFTs} userNFTs={this.state.traderNFTs} maxWidth="40%" maxHeight="10vh"></NFTCardGrid> */}
        

        
        
       
        </Grid>
      

      </div>
    );
  }
}

export default Barter;
