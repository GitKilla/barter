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

  var acceptTrade = (offerId) => {
    props.acceptTrade(offerId)
  }

  return (

    <Grid
        container
        spacing={5}
        alignItems="center"
        justify="center"
        style={{ maxHeight: '90%', maxWidth: '100%' }}
        >
        {printOffers(props.offerArray, props.type, acceptTrade)}
        </Grid>
        
  );
}