var express = require('express');
var router = express.Router();

var util = require('util')
var os = require('os')
var path = require('path')
var fs = require('fs')

var tmp = require('tmp')

var Busboy = require('busboy');

var S3 = require('../modules/S3')

var TITLE = 'cirrostratus @ lWlVl'

// tmp.dir({ template: '/tmp/tmp-XXXXXX' }, function _tempDirCreated(err, path) {
//   if (err) throw err;
//
//   console.log("Dir: ", path);
// });
// tmp.setGracefulCleanup();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: TITLE, message: 'Please upload your video now.' });
});
/* POST home page. */
router.post('/',function(req,res){
  //res.jsonp({whoa:'daddy'})
  var saveTo
  //Making our bucket once - this can be used to make any number of buckets
  //S3.createBucket('im-lwlvl-collab-testing')
   var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename);
      //don't pipe the file if it doesn't exist
      if(filename != ''){
        //only pipe if its a video type
        if(mimetype == 'video/avi' ||
           mimetype == 'video/mp4'||
           mimetype == 'video/mpeg' ||
           mimetype== 'video/quicktime'){
          //tmp.tmpName({ template: '/tmp/tmp-XXXXXX', keep: true }, function _tempNameGenerated(err, _path) {

            saveTo = path.join(__dirname, path.basename(filename));//_path
            console.log(saveTo)

            var fstream = fs.createWriteStream(saveTo);
            //pipe the file to a writeable stream
            file.pipe(fstream);
            fstream.on('close', function () {
                //res.redirect('back');
                console.log('fstream Completed')
            });
            fstream.on('error',function(){
              console.log('Stream Error')
              res.render('index', {title: TITLE, message:'<span style="color:red; font-weight:bold;">There was an error uploading your file, please try again.</span>'})
              return ''
            })
            //console.log(saveTo)
            //if (err) throw err;

            console.log("Created temporary filename: ", path);
          //});
        }else{
          console.log('mime type error: '+mimetype)
          res.render('index', {title: TITLE, message:'<span style="color:red; font-weight:bold;">Unaccepted file type '+mimetype+', please try again.</span>'})
          return ''
        }//end mimetype
      }//end no filename

      var totalSize = 0;
      file.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        totalSize += data.length
      });
      file.on('end', function() {
        //once we've handled the whole file print the data and finish up
        console.log('File [' + fieldname + '] Finished');
        console.log('Filename: '+filename);
        console.log('Encoding: '+encoding);
        console.log('MIMEtype: '+mimetype);
        console.log('Length: '+totalSize)
        if(totalSize > 0){
          //console.log('Greater Than 0')
          //if the file size is greater than 0 attempt a multipart upload to s3
          res.render('index', { title: TITLE, message: 'Thank you for your submission' });
          S3.uploadMultipart(saveTo, filename, encoding, mimetype, totalSize,function(err){
            if(!err) res.render('index', { title: TITLE, message: 'Thank you for your submission' });
            else res.render('index', {title: TITLE, message:'<span style="color:red; font-weight: bold;">There was an error uploading your file, please try again.</span>'})
          })
        }else{
          //console.log('Less Than 0')
          //if the file size is 0 we have a bad file so serve an error

          res.render('index', {title: TITLE, message:'<span style="color:red; font-weight:bold;">There was an error uploading your file, please try again.</span>'})
        }

      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + util.inspect(val));
    });
    //when bus boy has finished parsing the form.
    //in this case we only have one file in the form
    //so we don't need to support this callback.
    busboy.on('finish', function() {
      console.log('Done parsing form!');
      // res.writeHead(303, { Connection: 'close', Location: '/' });
      // res.end();
    });
  //pipe the incoming request to our busboy object for parsing
  req.pipe(busboy);

})

module.exports = router;
