import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import NFTCard from './NFTCard';
import OfferIcon from './OfferIcon';
import { CardHeader } from '@material-ui/core';
import Offer from './Offer';
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

function printOffers(offerArray, type, acceptTrade) {
    var cards = [];
    if(offerArray.length <= 0) {
    cards.push(<div><div>&nbsp;</div><Typography>No Offers {type?'In Inbox':'Created'}</Typography></div>)
    }
    for(var i = 0; i < offerArray.length; i++) {
        cards.push( <Offer
            key={i}
            offerIds={type?offerArray[i][0]:offerArray[i][1]}
            askIds={type?offerArray[i][1]:offerArray[i][0]}
            offerImages={type?offerArray[i][2]:offerArray[i][3]}
            askImages={type?offerArray[i][3]:offerArray[i][2]}
            offerId={offerArray[i][4]}
            offerVal={type?offerArray[i][5]:offerArray[i][6]}
            askVal={type?offerArray[i][6]:offerArray[i][5]}
            offerNames={type?offerArray[i][7]:offerArray[i][8]}
            askNames={type?offerArray[i][8]:offerArray[i][7]}
            offerContracts={type?offerArray[i][9]:offerArray[i][10]}
            askContracts={type?offerArray[i][10]:offerArray[i][9]}
            type={type}
            acceptTrade={acceptTrade}
            maxWidth="100%" maxHeight='20vh'
            minWidth="100%"
          ></Offer>)
    }
    return cards;
}


export default function NFTCardGrid(props) {
  const classes = useStyles();

  var acceptTrade = (offerId, askContracts) => {
    props.acceptTrade(offerId, askContracts)
  }

  return (

    <Grid
        container
        spacing={5}
        alignItems="center"
        justify="center"
        style={{ maxHeight: '90%', maxWidth: '100%' }}
        >
      <Card elevation='0' style={{ 
                maxWidth: '95%'
                , minWidth: '95%'
                , minHeight: '60vh'
                , maxHeight: '60vh'
                , paddingLeft: 10
                , paddingTop: 0
                , paddingBottom: 10
                , borderRadius: '20px 20px 20px 20px'
                , background: '#fceefa'
                // , background:'#f7d7f3'
                , alignItems: 'center'
                , overflow:'auto' }}>
        <Grid
        container
        spacing={5}
        alignItems="center"
        justify="center"
        style={{ maxHeight: '90%', maxWidth: '100%', paddingTop: 20, paddingBottom: 20 }}
        >          
        {printOffers(props.offerArray, props.type, acceptTrade)}
        </Grid>
        </Card>
        </Grid>
        
  );
}