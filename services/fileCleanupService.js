const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const GENERATED_DIR = path.join(__dirname, "../generated");

// qancha vaqtdan eski fayl o‘chadi (ms)
const MAX_AGE = 60 * 60 * 1000; // 1 soat

function cleanDirectory(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Read dir error:", err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dirPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Stat error:", err);
          return;
        }

        const now = Date.now();
        const fileAge = now - stats.mtimeMs;

        if (fileAge > MAX_AGE) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error("Delete error:", err);
            } else {
              console.log("Deleted:", filePath);
            }
          });
        }
      });
    });
  });
}

function runCleanup() {
  console.log("Running file cleanup...");

  cleanDirectory(UPLOADS_DIR);
  cleanDirectory(GENERATED_DIR);
}

module.exports = { runCleanup };