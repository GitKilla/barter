import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import NFTCard from './NFTCard';
import OfferIcon from './OfferIcon';
import { CardHeader } from '@material-ui/core';
import ValueIcon from './ValueIcon';
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

function printCards(numCards, userNFTs, images, val, names) {
    var cards = [];
    if(val > 0)
      cards.push(
        <Grid key={numCards} item xs={3}>
          <ValueIcon 
              ethVal={val}
              rootBackground={"#F9F9F9"}
              mediaBackground={"#F1F1F1"}
              />
        </Grid>
      )

    for(var i = 0; i < numCards; i++) {

        
      
        cards.push( <Grid key={i} item xs={3}>
            <OfferIcon 
                key={i} 
                nftid={userNFTs[i]} 
                image={images[i]}
                name={names[i]}
                rootBackground={"#F9F9F9"}
                mediaBackground={"#F1F1F1"}
                />
            </Grid>);
    }
    return cards;
}


export default function NFTCardGrid(props) {
  const classes = useStyles();

  return (
    
    <Card elevation='0' style={{ maxHeight: props.maxHeight
        , maxWidth: '40%'
        , minWidth: '40%'
        , paddingLeft: 10
        , paddingTop: 10
        , paddingBottom:15
        , background:'#F9F9F9' //'#F2A7C0' 
        , overflow:'auto'
        , borderRadius: '0px 0px 0px 0px'
        }}>
    
  
    <Grid
        container
        spacing={2}
        alignItems="center"
        justify="center"
        style={{ maxHeight: '100%', maxWidth: '100%', minWidth:'100%' }}
        >
        {/* <Card> */}
        
            {printCards(props.numCards, props.userNFTs, props.images, props.val, props.names)}
        {/* </Card> */}
            
  
        </Grid>
        </Card>
        
  );
}