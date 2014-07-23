var fs = require('fs')
module.exports = function(s3,BUCKET_NAME, file, filename,mimetype,size, cb){

  var buffer = fs.readFileSync(file)
  var startTime = new Date()
  var partNum = 0;
  var partSize =  1024 * 1024 *5 // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
  var numPartsLeft = Math.ceil(buffer.length / partSize);

  console.log("Buffer Length: "+buffer.length)
  console.log("Num Parts: "+numPartsLeft)

  var maxUploadTries = 3
  var fileKey = Date.now()+'_'+filename
  var multiPartParams = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: mimetype
  }

  var multipartMap = {
    Parts:[]
  }
  function completeMultipartUpload(s3,doneParams){
    s3.completeMultipartUpload(doneParams,function(err,data){
      if(err){
        console.log("An error occurred while completing the multipart upload");
        console.log(err);
        //we could try the process again here or surface to the user
      }else{
        var delta = (new Date() - startTime)/1000
        console.log('Completed upload in '+delta+' seconds')
        console.log('Final upload data: '+JSON.stringify(data))
        //delete the file when we are finished
        fs.unlink(file)
      }
    })
  }//function completeMultipartUpload
  function uploadPart(s3,multipart,partParams,tryNum){
    var tryNum = tryNum || 1 //if no trys exist set it to one
    //upload the part with s3
    s3.uploadPart(partParams,function(multiErr,mData){
      if(multiErr){
        console.log('MultiPart Upload Error: ')
        console.log(multiErr)
        if(tryNum < maxUploadTries){
          console.log('Retrying upload of part: #'+partParams.PartNumber)
          uploadPart(s3,multipart,partParams, tryNum +1)
        }else{
          console.log('Failed uploading part : #'+partParams.PartNumber)
        }
        return;
      }
      multipartMap.Parts[this.request.params.PartNumber - 1 ] = {
        ETag: mData.ETag,
        PartNumber: Number(this.request.params.PartNumber)
      }
      console.log('Completed Part: #'+this.request.params.PartNumber)
      console.log('mData: '+JSON.stringify(mData))
      if(--numPartsLeft>0) return

      var doneParams = {
        Bucket:BUCKET_NAME,
        Key: fileKey,
        MultipartUpload:multipartMap,
        UploadId: multipart.UploadId
      }
      console.log('Completing Upload')
      completeMultipartUpload(s3,doneParams)
    })
  }//function uploadPart

  console.log('Creating multipart upload for: '+file)
  //create the multipart upload
  s3.createMultipartUpload(multiPartParams, function(mpErr,multipart){
    if(mpErr){
      console.log('[ERROR]:'+mpErr)
      return;
    }
    console.log('Got Upload ID: '+multipart.UploadId)
    //iterate through the buffer
    for(var rangeStart = 0; rangeStart <= buffer.length; rangeStart += partSize){
      partNum++
      var end = Math.min(rangeStart + partSize, buffer.length)
      var partParams = {
        Body: buffer.slice(rangeStart,end),
        Bucket: BUCKET_NAME,
        Key: fileKey,
        PartNumber: String(partNum),
        UploadId: multipart.UploadId
      }
      console.log('Uploading part: #'+partParams.PartNumber+' Range Start: '+ rangeStart+' Range End: '+end)
      //upload each part of the buffer
      uploadPart(s3,multipart,partParams)
    }
  })

}
