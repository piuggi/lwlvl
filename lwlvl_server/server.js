var express = require('./app')
var server = express.listen(3000,function(){
  console.log("Listening on port %d", server.address().port)
})
