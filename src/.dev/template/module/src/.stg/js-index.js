const index = require("./dist/index");

console.log(index.getNumberTextSync());

index.getNumberTextAsync().then(text => {
  console.log(text);
});