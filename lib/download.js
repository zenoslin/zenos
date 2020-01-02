const download = require("download-git-repo");

module.exports = function(url,target) {
  return new Promise((resolve, reject) => {
    download(
      url,
      target,
      err => {
        if (err) {
          reject(err);
        } else {
          resolve(target);
        }
      }
    );
  });
};
