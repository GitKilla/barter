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
            activePage: "barter",
            offerArray: [],
            askArray: []
          };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const primaryAddress = accounts[0];
      web3.eth.defaultAccount = web3.eth.accounts[0]


      // Get the Test NFT contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetworkTestNFT = TestNFTContract.networks[networkId];
      const instanceTestNFT = new web3.eth.Contract(
        TestNFTContract.abi,
        "0xBD14449bA2e488CB84aA120E03D8b5e5A16f9047"
      );


      // Get the Swap contract instance.
      const deployedNetworkSwap = Swap.networks[networkId];
      const instanceSwap = new web3.eth.Contract(
        Swap.abi,
        "0xB341C82fEA3608dF5F459729a105d2283a0365DB",
      );
      

      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0]
      });


      //this is an array of arrarys of size two, with NFTId and imageurl
      const userNFTs = await this.getData(accounts[0]);
      
      this.setState({ web3, 
        accounts, 
        contractNFT: instanceTestNFT, 
        contractSwap: instanceSwap, 
        userAddress: accounts[0],
        numUserNFTs: userNFTs.length,
        userNFTs: userNFTs
      });

      var offerData = await this.getOffers()
      var askData = await this.getAsks()

      this.setState({
        offerArray: offerData,
        askArray: askData
      })

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

      offerContractArr[i] = "0xBD14449bA2e488CB84aA120E03D8b5e5A16f9047";//this.state.contractNFT.address;
    }

    for(var i = 0; i < this.state.askedNFTIds.length; i++) {
      askContractArr[i] = "0xBD14449bA2e488CB84aA120E03D8b5e5A16f9047";//this.state.contractNFT.address;
    }
    
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

  acceptTrade = async (offerId) => { // add approval check beforehand
    const {contractNFT, contractSwap } = this.state;
    const transactionReceipt = await this.state.contractSwap.methods.acceptOffer(offerId).send({from:this.state.userAddress})
  }

  cancelTrade = async (offerId) => { // add approval check beforehand
    const {contractNFT, contractSwap } = this.state;
    const transactionReceipt = await this.state.contractSwap.methods.cancelOffer(offerId).send({from:this.state.userAddress})
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
    this.setState({activePage: pageName});
  };

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

  getOffers = async () => {
    const {contractNFT, contractSwap } = this.state;
    const numOffers = await contractSwap.methods.offerCountByAddress(this.state.userAddress).call()

    var NFTdata_2 = [];

    for(var i = 0; i < numOffers; i++) {
      var offerId = await contractSwap.methods.offersByAddress(this.state.userAddress, i).call()
      var offerState = await contractSwap.methods.getOfferState(offerId).call()
      
      var offer = await this.getOfferData(offerId)
      var offerImages = []
      
      for(var j = 0; j < offer[0].length; j++) {
        var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(offer[0][j]));
        res = await res.json();
        offerImages.push(res.image)
      }

      var askImages = []
      for(var j = 0; j < offer[1].length; j++) {
        var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(offer[0][j]));
        res = await res.json();
        askImages.push(res.image)
      }
      
      if(offerState) {
        
        NFTdata_2.push([offer[0], offer[1], offerImages, askImages, offerId]);
      }
      
    }

    return NFTdata_2

  }

  getAsks = async () => {
    const {contractNFT, contractSwap } = this.state;
    const numOffers = await contractSwap.methods.offersCreatedCountByAddress(this.state.userAddress).call()

    var NFTdata = [];

    for(var i = 0; i < numOffers; i++) {
      var offerId = await contractSwap.methods.offersCreatedByAddress(this.state.userAddress, i).call()
      var offerState = await contractSwap.methods.getOfferState(offerId).call()
      var offer = await this.getOfferData(offerId)
      var offerImages = []
      
      for(var j = 0; j < offer[0].length; j++) {
        var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(offer[0][j]));
        res = await res.json();
        offerImages.push(res.image)
      }

      var askImages = []
      for(var j = 0; j < offer[1].length; j++) {
        var res = await fetch('https://axieinfinity.com/api/v2/axies/'+String(offer[0][j]));
        res = await res.json();
        askImages.push(res.image)
      }

      if(offerState) {
        NFTdata.push([offer[0], offer[1], offerImages, askImages, offerId]);
      }
      
    }

    return NFTdata

  }

  getOfferData = async (offerId) => {
    const {contractNFT, contractSwap } = this.state;

    // Get NFT Ids being offered to user
    const offerLength = await contractSwap.methods.getOfferLengthFromOffer(offerId).call()
    var offerIds = []
    // const numOffers = contractSwap.methods.offerCountByAddress(this.state.userAddress)
    for(var i = 0; i < offerLength; i++) {
      offerIds.push (await contractSwap.methods.getOfferFromOffer(offerId, i).call())
    }

    // Get NFT Ids being asked of the user
    const askLength = await contractSwap.methods.getOfferLengthFromAsk(offerId).call()
    var askIds = []
    // const numOffers = contractSwap.methods.offerCountByAddress(this.state.userAddress)
    for(var i = 0; i < offerLength; i++) {
      askIds.push (await contractSwap.methods.getOfferFromAsk(offerId, i).call())
    }

    return [offerIds, askIds]
  }

  handleSubmit = async (event) => {

    event.preventDefault();

    const traderNFTs = await this.getData(this.state.traderAddress);

    this.setState({addressEntered: true, traderNFTs: traderNFTs, numTraderNFTs: traderNFTs.length});
    
  };

  handleAddressChange = async (event) => {

    event.preventDefault();
    this.setState({traderAddress: event.target.value});
    
  };


  render() {
    
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if(this.state.activePage == "barter") {

      return (

        <div className="App">
          <Bar setActivePage={this.setActivePage}></Bar>
          <div>
          {/* {(this.state.activePage == "barter") ? */}
          <div>&nbsp;</div>
          <form onSubmit={this.proposeTrade}>
          <Button type='submit' color='primary' variant='outlined'><Typography fontSize={18} >Propose Trade</Typography></Button>
          </form>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
        

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
            maxWidth="40%" minWidth="40%"
            minHeight="60vh"></NFTCardGrid>
          
          
          {(!this.state.addressEntered) ? 
            <Grid
            container
            spacing={2}
            alignItems="flex-end"
            justify="center"
            style={{ maxHeight:'10vh', minWidth:'40%', maxWidth: '40%'}}
            >

              <form onSubmit={this.handleSubmit}>
              <FormGroup>
              <div>&nbsp;</div>
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
              maxWidth="40%" minWidth="40%" minHeight="60vh"></NFTCardGrid>
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
          <div>&nbsp;</div>
          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="flex-start"
            justify="space-evenly"
            // xs={3}
            style={{ minHeight: '10vh', padding:'1'}}
          > 
            
            <Card style={{ 
                maxWidth: '80%'
                , minWidth: '80%'
                , minHeight: '30vh'
                , maxHeight: '3=0vh'
                , paddingLeft: 0
                , paddingTop: 10
                , paddingBottom:10
                , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                , overflow:'auto' }}>
                  <Grid container
                  flexgrow={1}
                  alignItems="flex-start"
                  justify="flex-start"
                  // xs={3}
                  style={{ minHeight: '5vh'}}
                >
                  <Grid item style={{minWidth: '55%'}}><Typography color='secondary'>Give</Typography></Grid>
                  <Grid item style={{minWidth: '20%'}}><Typography color='secondary'>Receive</Typography></Grid>
                  </Grid>
                <Grid container
                  flexgrow={1}
                  alignItems="center"
                  justify="space-evenly"
                  // xs={3}
                  style={{ minHeight: '10vh'}}
                >
                  <OfferList
                    type={true}
                    offerArray={this.state.offerArray}
                    acceptTrade={this.acceptTrade}
                    >
                  </OfferList>

                </Grid>
            </Card>
          </Grid>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Grid container
            spacing={1}
            flexgrow={1}
            alignItems="center"
            justify="space-evenly"
            // xs={3}
            style={{ minHeight: '10vh', padding:'1'}}
          >
            <Card style={{ 
                maxWidth: '80%'
                , minWidth: '80%'
                , minHeight: '30vh'
                , maxHeight: '30vh'
                , paddingLeft: 0
                , paddingTop: 20
                , paddingBottom:30
                , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)'
                , overflow:'auto' }}>
                  <Grid container
                  flexgrow={1}
                  alignItems="flex-start"
                  justify="flex-start"
                  // xs={3}
                  style={{ minHeight: '5vh'}}
                >
                  <Grid item style={{minWidth: '55%'}}><Typography color='secondary'>Give</Typography></Grid>
                  <Grid item style={{minWidth: '20%'}}><Typography color='secondary'>Receive</Typography></Grid>
                  </Grid>
                <Grid container
                  flexgrow={1}
                  alignItems="center"
                  justify="space-evenly"
                  // xs={3}
                  style={{ minHeight: '10vh'}}
                >
                  <OfferList
                    type={false}
                    offerArray={this.state.askArray}
                    acceptTrade={this.cancelTrade}
                    >
                  </OfferList>
                </Grid>

            </Card>
            </Grid>
          
        </div>
        
      );
    }
  }
}

export default App;
