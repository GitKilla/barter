import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';



const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();



  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" onClick={() => {props.mineMint()}} className={classes.menuButton} color="inherit" aria-label="menu">
            <img src="https://i.ibb.co/Xtsrjvs/1f6cd.png" alt="Barter Finance" height="40" width="40" />
            {/* <MenuIcon /> */}
          </IconButton>
          <Typography variant="h6" className={classes.title}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button style={{fontSize:'36px', paddingTop:'0px', paddingBottom:'0px'}} onClick={() => {props.setActivePage("barter")}} color="secondary">Barter</Button>
          </Typography>
          
          <Button onClick={() => {props.setActivePage("offers")}} color="secondary">Offers</Button>
          
        </Toolbar>
      </AppBar>
    </div>
  );
}
