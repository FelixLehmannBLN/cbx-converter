var child_process = require('child_process');
var path = require('path');


var cbr = function cbr (source, destination, callback) {
  var unrar = '../bin/win/UnRAR.exe';

  // Reset the path if platform is darwin
  if (process.platform == "darwin") {
    unrar = '../bin/darwin/unrar';
  }

  destination = path.normalize(path.join(destination, "/"));


  child_process.execFile( path.join(__dirname, unrar), ['e', '-y', source, destination], function (error, stdout, stderr) {
    if (error) {
      return callback(error);
    }
    callback(null, stdout);
  })
}

module.exports = cbr;
