import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import NFTCard from './NFTCard';
// import LinearGradient from 'react-native-linear-gradient';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

function printCards(numCards, userNFTs, pushNFTOffer, pullNFTOffer, offeredNFTIds, nftType) {
    var cards = [];
    for(var i = 0; i < numCards; i++) {
        cards.push( <Grid key={i} item xs={3}>
            <NFTCard 
                pushNFTOffer={pushNFTOffer}
                pullNFTOffer={pullNFTOffer}
                offeredNFTIds={offeredNFTIds}
                nftType={nftType}
                key={i}
                nftid={userNFTs[i][0]} 
                image={userNFTs[i][1]}
                name={userNFTs[i][2]}
                contract={userNFTs[i][3]}
                rootBackground={offeredNFTIds.includes(userNFTs[i][0])?"#99FF99":"#F9F9F9"}
                mediaBackground={offeredNFTIds.includes(userNFTs[i][0])?"#33ff33":"#F1F1F1"}
                />
            </Grid>);
    }
    return cards;
}


export default function NFTCardGrid(props) {
  const classes = useStyles();

  var pushNFTOffer = (nftType, nftid, contract) => {
    props.pushNFTOffer(nftType, nftid, contract)
  }

  var pullNFTOffer = (nftType, nftid, contract) => {
      props.pullNFTOffer(nftType, nftid, contract)
  }

  return (
    
    <Card style={{ maxHeight: props.maxHeight
        , minHeight: props.minHeight
        , maxWidth: props.maxWidth
        , minWidth: props.minWidth
        , paddingLeft: 40
        , paddingRight: 40
        , paddingTop: 20
        , paddingBottom:30
        , borderRadius: '20px 20px 20px 20px'
      //  , overflow:'auto'
        , background:'linear-gradient(315deg, #f5a9ec, #f0a695 90%)' }}>
    <Grid
        container
        spacing={2}
        alignItems="flex-end"
        justify="flex-start"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        ><Grid item><Typography color='secondary'>{props.nftType=="offer"?"Your":"Their"} Items</Typography></Grid></Grid>
    <div>&nbsp;</div>
    <Grid
        container
        spacing={2}
        alignItems="center"
        justify="center"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        >
         <Card  elevation='0' style={{ maxHeight: '45vh'
        , minHeight: '45vh'
        , maxWidth: '85%'
        , minWidth: '85%'
        , paddingLeft: 40
        , paddingTop: 40
        , paddingBottom:40
        , paddingRight:40
        , overflow:'auto'
        , borderRadius: '0px 0px 0px 0px'
        , background:'#f7d7f3' }}>
        <Grid
        container
        spacing={2}
        alignItems="flex-start"
        justify="flex-start"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        >
            {printCards(props.numCards, props.userNFTs, pushNFTOffer, pullNFTOffer, props.offeredNFTIds, props.nftType)}
            </Grid>
        </Card>
            
  
        </Grid>
        </Card>
        
  );
}