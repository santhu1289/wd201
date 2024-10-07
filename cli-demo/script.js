import { ESLint } from "eslint";
//const readline = require("readline");
//const lineDetail = readline.createInterface({
// input: process.stdin,
// output: process.stdout,
//});

//lineDetail.question("Please Provide Your Name - ", (name) => {
// console.log(`Hi ${name}!`);
//lineDetail.close();
//});

//const args = process.argv;
//const operation = args[2];
//const num1 = parseInt(args[3]);
//const num2 = parseInt(args[4]);

//if (operation === "add") {
//console.log(`The result is: ${num1 + num2}`);
//} else if (operation === "subtract") {
// console.log(`The result is: ${num1 - num2}`);
//} else if (operation === "multiply") {
// console.log(`The result is: ${num1 * num2}`);
//} else {
// console.log("Unknown operation");

const args = minimist(process.argv.slice(2));

const num1 = parseInt(args.num1);
const numconst minimist = require("minimist");2 = parseInt(args.num2);
const operation = args.operation;

if (operation === "add") {
  console.log(`sum of two number = ${num1 + num2}`);
} else if (operation === "sub") {
  console.log(`Subtraction of two numers = ${num1 - num2}`);
} else {
  console.log(`unknown operation`);
}

console.log("Operation " + args.operation); // 'add'
console.log("Number 1" + args.num1); // 5
console.log("NUmber 2" + args.num2); // 10
