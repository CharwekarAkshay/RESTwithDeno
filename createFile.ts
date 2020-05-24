const encode = new TextEncoder();

const greetText = encode.encode('Hello World\nMy name is Akshay');

await Deno.writeFile('greet.txt',greetText).then();