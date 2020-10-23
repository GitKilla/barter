import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#D00D0D'
      // main: 'linear-gradient(25deg, #FE6B8B 30%, #FF8E53 90%)',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
  typography: {
    "fontFamily": ['Source Sans Pro','Times New Roman'],
    "fontSize": 24,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500
   }
});

export default theme;