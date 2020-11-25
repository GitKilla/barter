import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import OfferGrid from './OfferGrid';
import FormGroup from '@material-ui/core/FormGroup';
import { Button, Typography } from '@material-ui/core';

export default function Offer(props) {

  // root bg = "#F9F9F9"
  // media bg = "#F1F1F1"

  return (
    <div 
        style={{ maxHeight: '90%'
            , maxWidth: '80%'
            , minWidth: '80%'
            , paddingTop: 20
            , display:'flex'
             }}
        >
    <Card style={{ maxHeight: '13vh'
    , maxWidth: '90%'
    , minWidth: '90%'
    , paddingLeft: 5
    , paddingTop: 8
    , paddingBottom: 5
    , background:'linear-gradient(315deg, #f28de6, #ec8e79, #f28de6, #ec8e79)'//'#F1F1F1' //'#F2A7C0' 
    , alignItems:'flex'
    , justify:'space-evenly'
    }}>
        <Grid container
                  flexgrow={1}
                  alignItems="center"
                  justify="space-evenly"
                  // xs={3}
                  style={{ minHeight: '10vh'}}
                >
        <OfferGrid 
            numCards={props.askIds.length} 
            userNFTs={props.askIds}
            images={props.askImages}
            names={props.askNames}
            val={props.askVal}
            maxWidth="40%" maxHeight='10vh'></OfferGrid>
            <img width={512*0.12} height={512*0.12} src='https://i.imgur.com/6bJqAwg.png'/>
        <OfferGrid 
            numCards={props.offerIds.length} 
            userNFTs={props.offerIds} 
            images={props.offerImages}
            names={props.offerNames}
            val={props.offerVal}
            maxWidth="40%"  maxHeight='10vh'></OfferGrid>
        </Grid>
        <Grid container
                  flexgrow={1}
                  alignItems="center"
                  justify="space-evenly"
                  // xs={3}
                  style={{ minHeight: '10vh'}}
                >

            

        </Grid>
    </Card>
    <div style={{minWidth:'5%'}}></div>
    <Grid container alignItems="center" justify="space-evenly">
    <Button onClick={() => {console.log("Within offer: "+props.askContracts);props.acceptTrade(props.offerId, props.askContracts)}} type='submit' variant='outlined' color='inherit' style={{color:props.type?'#0AC41C':'#8b0000', backgroundColor:props.type?'':'', maxHeight:'5vh'}}>
                <Typography>{props.type?"Accept":"Cancel"}</Typography>
            </Button>
            </Grid>
    </div>
    
  );
}