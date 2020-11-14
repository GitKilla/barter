const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, '..', 'build');
const port = process.env.PORT || 5000;

app.use(express.static(publicPath));

// app.get('*', (req, res) => {
//    console.log("=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]=-]");
//    console.log("Req secure: "+String(req.secure))
//    console.log("Req fwd proto: "+String(req.get('x-forwarded-proto')))
//    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
//       // console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
//       // res.redirect('https://' + req.headers.host + req.url);
//       console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
//       res.sendFile(path.join(publicPath, 'index.html'));
//    } else {
//       console.log("=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>");
//       console.log("public path: "+publicPath);
//       console.log("=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>");
//       res.sendFile(path.join(publicPath, 'index.html'));
//    }
// });

app.get('*', (req, res) => {
   console.log("Got *");
   res.sendFile(path.join(publicPath, 'index.html'));
});


app.listen(port, () => {
   console.log('Server is up!');
});
