var fs = require('fs')
var aws = require('aws-sdk');
var uploader = require('s3-upload-stream').Uploader


aws.config.loadFromPath(__dirname+'/AWS_Keys.json');
var s3 = new aws.S3();
exports.s3 = s3

var multipartUpload = require(__dirname+'/S3_Multipart')

var keys = require(__dirname+'/AWS_Keys')
var BUCKET_NAME = 'im-lwlvl-collab-testing'

exports.BUCKET_NAME = BUCKET_NAME




exports.createBucket = function(bucketName){

   s3.createBucket({Bucket: bucketName}, function() {
    console.log('created the bucket[' + bucketName + ']');
    console.log(arguments);
  });

}

exports.uploadMultipart = function(file, filename, encoding, mimetype,size,cb){

  multipartUpload(s3,BUCKET_NAME, file , filename, mimetype ,size, function(err){

  })


}

exports.uploadFile = function(file, filename, encoding, mimetype,size,cb) {
  var fileBuffer = fs.readFileSync(file);
  var options = {
    ACL: 'public-read',
    Bucket: BUCKET_NAME,
    Key: Date.now()+"_"+filename,
    Body: fileBuffer,
    ContentLength: size,
    ContentType: mimetype
  }
  // s3.putObject(options, function(error, response) {
  //   if(error){
  //     console.log(error.message)
  //     cb(error)
  //   }else{
  //     console.log(response)
  //     console.log('uploaded file[' + filename + '] to [' + BUCKET_NAME + '] as [' + mimetype + ']');
  //
  //     //clean up file
  //     fs.unlinkSync(file)
  //     console.log('unlinked file['+file+']')
  //     cb(null)
  //   }
  // });


  var uploadStreamObj = new uploader({s3Client: s3},{Bucket: BUCKET_NAME, Key:filename},function(err,uploadStream){
    console.log('Uploading file ['+filename  +']')
    //console.log('Something.')
    var thefile = fs.createReadStream(file)
    if(err){
      console.log(err,uploadStream)
      cb(err)
    }else{
      uploadStream.on('error',function(data){
        console.log('error: '+data)
      })
      uploadStream.on('chunk',function(data){
        console.log(data)
      })
      uploadStream.on('uploaded',function(data){
        console.log(data)
        fs.unlinkSync(file)
        console.log('unlinked file['+file+']')
        cb(null)
      })
      console.log("Piping file ["+filename+"]")
      //console.log(file.pipe.toString())
      thefile.pipe(uploadStream)
      //cb(null,uploadStream)
    }
  })
}
