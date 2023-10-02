require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');[]
const {Web3} = require('web3');
const Bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const web3 = new Web3(process.env.ETH_RPC_GOERLI);

const TRANSFER_ABI = [{
  "inputs": [
  {"name":"dst","type":"address"},
  {"name":"rawAmount","type":"uint256"}
  ],

  "name":"transfer",
  "outputs" : [
    {"name":"","type":"bool"}
  ,
],
  "type":"function"
}];

const pushContract = new web3.eth.Contract(TRANSFER_ABI,process.env.PUSH_TOKEN_ADDRESS);

console.log(process.env.PRIVATE_KEY);
const privateKey = Web3.utils.toHex(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(privateKey);


Bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (messageText === '/start') {
    Bot.sendMessage(chatId, 'Hello, I am PushMan and I can help you to get some PUSH test tokens.');
    Bot.sendMessage(chatId, 'Just send me your Goerli testnet address and I will send you '+process.env.FAUCET_AMOUNT+' PUSH tokens .');
  } else if(web3.utils.isAddress(messageText)){
    try {
      sendPushToken(messageText,chatId);
      
    } catch (error) {
      console.log(error);
      Bot.sendMessage(chatId, 'Sorry, Something went wrong, Please try again in some time');

    }

  } else {
    Bot.sendMessage(chatId, "Sorry, I dont understand you, Please send me your Goerli testnet address and I will send you "+process.env.FAUCET_AMOUNT+" PUSH tokens .");
  }
});

function sendPushToken(toAddress,chatId){
  let data = pushContract.methods.transfer(
    toAddress,
    Web3.utils.toHex(BigInt(Web3.utils.toWei(process.env.FAUCET_AMOUNT.toString(), 'ether')))).encodeABI();

let txObj = {
  from: web3.eth.accounts.wallet[0].address,
  to: process.env.PUSH_TOKEN_ADDRESS,
  data: data,
  value: 0,
}
  
web3.eth.sendTransaction(txObj)
.on('transactionHash',function(hash){
  Bot.sendMessage(chatId, "Hurray! You got "+process.env.FAUCET_AMOUNT+" PUSH tokens. You can check the transaction here: https://goerli.etherscan.io/tx/" + hash);
})

}
