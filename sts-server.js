var express = require('express');
var chalk = require('chalk');
var STS = require('ali-oss').STS;
var co = require('co');
var fs = require('fs');
var secret = require('./secret/index')
var app = express();

function getProlicy (path, strUser) {
  var dir = path + strUser
  return JSON.stringify({
    "Statement": [
      {
        "Action": [
          "oss:GetObject",
          "oss:PutObject",
          "oss:ListParts",
          "oss:AbortMultipartUpload",
        ],
        "Effect": "Allow",
        "Resource": ["acs:oss:*:*:" + dir, "acs:oss:*:*:" + dir + '*']
      }
    ],
    "Version": "1"
  })
}

var client = new STS({
  accessKeyId: secret.aliOSS.accessKeyId,
  accessKeySecret: secret.aliOSS.accessKeySecret,
});
var ossRegion = 'oss-cn-beijing'
//  默认的bucket，文件附件位于这个bucket
var ossBucket = 'rishiqing-file'
//  图片的bucket
var ossImageBucket = 'rishiqing-images'
//  默认的bucket中的根目录
var ossRootPath = 'dingtalk/'
//  自定义的封面的目录
var ossCustomerCoverImagePath = 'cover/custom/'
var roleArn = secret.aliOSS.roleArn
var sessionName = 'qywxAppUser'
var expiration = 900
var port = 8300

//  跨域访问
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

//  根目录
app.get('/', function(req, res) {
    res.end('index')
});

//  存活检测
app.get('/check', function(req, res) {
   res.end('success')
});

app.get('/sts/:userId', function (req, res) {
  var userId = req.params.userId
  if (!userId) {
    return res.status(400)
  }
  var policy = getProlicy(ossBucket + '/' + ossRootPath, userId)

  co(function* () {
    var result = yield client.assumeRole(roleArn, policy, expiration, sessionName);
    console.log(result);

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-METHOD', 'GET');
    res.json({
      AccessKeyId: result.credentials.AccessKeyId,
      AccessKeySecret: result.credentials.AccessKeySecret,
      SecurityToken: result.credentials.SecurityToken,
      Expiration: result.credentials.Expiration
    });
  }).then(function () {
    // pass
  }).catch(function (err) {
    console.log(err);
    res.status(400).json(err.message);
  });
});

app.get('/sts/cover/custom/kanban/:userId', function (req, res) {
    var userId = req.params.userId
    if (!userId) {
        return res.status(400)
    }
    //  公共读写，不使用userId
    var policy = getProlicy(ossImageBucket + '/' + ossCustomerCoverImagePath + 'kanban/', '')

    co(function* () {
        var result = yield client.assumeRole(roleArn, policy, expiration, sessionName);
        console.log(result);

        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-METHOD', 'GET');
        res.json({
            AccessKeyId: result.credentials.AccessKeyId,
            AccessKeySecret: result.credentials.AccessKeySecret,
            SecurityToken: result.credentials.SecurityToken,
            Expiration: result.credentials.Expiration
        });
    }).then(function () {
        // pass
    }).catch(function (err) {
        console.log(err);
        res.status(400).json(err.message);
    });
});

app.listen(port, function () {
  console.log(chalk.blue('>>app started at port:' + port))
});
