//Paste this in bucket policy of aws s3

// {
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Effect": "Allow",
//       "Principal": {
//         "AWS": "arn:aws:iam::650781539107:user/Demo-User"
//       },
//       "Action": "s3:*",
//       "Resource": [
//         "arn:aws:s3:::apnasamplegitbucket",
//         "arn:aws:s3:::apnasamplegitbucket/*"
//       ]
//     }
//   ]
// }

// const AWS = require("aws-sdk");
// AWS.config.update({ region: "ap-southeast-2" });
// const s3 = new AWS.S3();
// const S3_BUCKET = "apnasamplegitbucket";
// module.exports = { s3, S3_BUCKET };


const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const S3_BUCKET = process.env.S3_BUCKET;

module.exports = { s3, S3_BUCKET };
