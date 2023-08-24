var spawn = require('child_process').spawn;

// Hexo 2.x
// hexo.on('new', function(path){
//   spawn('C:/Program Files/Typora/Typora.exe', [path]);
// });

// Hexo 3
hexo.on('new', function(data){
  spawn('C:/Program Files/Typora/Typora.exe', [data.path]);
});