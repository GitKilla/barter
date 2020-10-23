import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';




export default function MediaCard(props) {

  // root bg = "#F9F9F9"
  // media bg = "#F1F1F1"

  const useStyles = makeStyles({
    root: {
      maxWidth: 128*0.6,
      minWidth: 128*0.6,
      backgroundColor: props.rootBackground,
      boxShadow:3
    },
    media: {
      height: 96*0.6,
      width: 128*0.6,
      objectFit: 'cover',
      //width: "33%",
      align: "center",
      backgroundColor: props.mediaBackground
    },
  });

  const classes = useStyles();


  return (
    <Card className={classes.root} styles={{boxShadow:3}}>
     
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '10vh', maxWidth:"100%" }}
        >
        <Grid item>
        <CardMedia
          className={classes.media}
          
          // image="https://lh3.googleusercontent.com/cR7AHCK1f9rD9KwUos1q5II66R5M0I8unER7O8mLELkVDXp9sysNuo9TD1Caa7L0w48D-__EGEUbQXV2sZDdRGg=s0"
          // image="https://storage.googleapis.com/assets.axieinfinity.com/axies/48133/axie/axie-full-transparent.png"
          title="Axie"
        >
          <img src={props.image} height='100%' width='100%'></img>
        </CardMedia>
        </Grid>
        <Grid item>
          <p style={{fontFamily:'Arial', fontSize:12}}>
            <b>Axie #{props.nftid}</b>
            </p>
          </Grid>
        </Grid>
      
      
    </Card>
  );
}