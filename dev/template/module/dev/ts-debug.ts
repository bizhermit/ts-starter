import * as index from "./dist/index";

console.log(index.getNumberTextSync());

index.getNumberTextAsync().then(text => {
    console.log(text);
});