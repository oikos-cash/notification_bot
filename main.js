import * as ethers from 'ethers';
import {formatEther } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { SwapEventABI, LendingVaultEvents } from "./assets/abi.js";
import { commify, sqrtPriceX96ToPrice } from "./utils.js";
import { Client, GatewayIntentBits, Partials } from 'discord.js';
dotenv.config();

// Initialize a new Discord client with necessary intents and partials
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages 
    ],
    partials: [Partials.Channel]
});


// List of server IDs to check for membership
const allowedChannelIds = [
    process.env.CHAN_ID_TRADING,
    process.env.CHAN_ID_LOANS
];

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(console.error);

// Configuración del nodo Web3
const RPC_URL = process.env.INFURA_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL);
// Dirección del contrato
const contractAddress = process.env.CONTRACT_ADDRESS;

const vaultAddress = process.env.VAULT_ADDRESS;

// Crear una instancia del contrato
const contract = new ethers.Contract(contractAddress, SwapEventABI, provider);
const lendingContract = new ethers.Contract(vaultAddress, LendingVaultEvents, provider);

const chatId = process.env.CHAT_ID;

const bscScanContractLink = `https://bscscan.com/address/${contractAddress}`
const twitterLink = 'https://x.com/oikos_cash'; // Enlace de Twitter
const presaleLink = 'https://app.oikos.cash';   // Enlace de Twitter
const imageUrl = './assets/header.png';         // Reemplaza con la URL de la imagen

// Configuración del bot de Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const uniswapV4Router = "0x1906c1d672b88cD1B9aC7593301cA990F94Eae07";
const oikosExchange = "0x366C257f84e46105a76F53391B260717aac80D70";

async function handleBorrow(who, borrowAmount, duration, event) {
    const txHash = event.log.transactionHash;
    const bscScanTxLink = `https://bscscan.com/tx/${txHash}`;
    
    const msg = `
📢**New Loan incoming**📢

👉 **Address:** ${who}
🏦 **Borrowed:** ${commify(Number(formatEther(`${borrowAmount}`)), 4)} BNB
⏳ **For:** ${Number(`${duration}`) / 86400} days

<<>><<>><<>><<>><<>><<>><<>><<>
`;

  const discordChannel = await client.channels.fetch(allowedChannelIds[1]);
  // ✅ Discord
  try {
    if (discordChannel) {
        await discordChannel.send({ content: msg });
        console.log('✅ Notificación enviada a Discord');
        } else {
        console.log('❌ Canal de Discord no encontrado');
        }
    } catch (error) {
        console.error('❌ Error al enviar el mensaje a Discord:', error);
    }    
}

async function handleSwap(sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) {
    
    let type, protocol;

    if (sender == uniswapV4Router || recipient == uniswapV4Router) {
        protocol = "Uniswap"
    } else if (sender == oikosExchange || recipient == oikosExchange) {
        protocol = "Oikos Exchange"
    } else {
        protocol = "Other (Unknown)"
    }

    const txHash = event.log.transactionHash;
    const bscScanTxLink = `https://bscscan.com/tx/${txHash}`;

    if (Number(formatEther(amount0)) < 0) {
        type = "purchase";
    } else {
        type = "sale"
    }

    const purchaseMsg = `
📢**New ${type} Incoming**📢

🏦 **Protocol:** ${protocol}
🔹 **Purchased:** ${commify(Number(formatEther(amount0)) * -1, 4)} OKS
💰 **Spent:** ${commify(Number(formatEther(amount1)), 4)} BNB
💵 **Price:** ${commify(Number(formatEther(amount1)) / Number(formatEther(amount0)) * -1, 7)} BNB    
📈 **Spot Price:** ${commify(sqrtPriceX96ToPrice(sqrtPriceX96), 7)} BNB    
    `
    const saleMsg = `
📢**New ${type} Incoming**📢

🏦 **Protocol:** ${protocol}
🔹 **Sold:** ${commify(Number(formatEther(amount0)), 4)} OKS
💰 **For:** ${commify(Number(formatEther(amount1)) * -1, 7)} BNB
💵 **Price:** ${commify(Number(formatEther(amount1)) / Number(formatEther(amount0)) * -1, 7)} BNB    
📈 **Spot Price:** ${commify(sqrtPriceX96ToPrice(sqrtPriceX96), 7)} BNB    
`
    const messageTelegram = `${
        type === "purchase" ? purchaseMsg : saleMsg
    }

[🛒 Buy Now](${presaleLink}) | [🔗 Tx](${bscScanTxLink}) | [🌐 X](${twitterLink}) | [📝 Contract](${bscScanContractLink})
    `;    

    const messageDiscord = `${
        type === "purchase" ? purchaseMsg : saleMsg
    }
    
<<>><<>><<>><<>><<>><<>><<>><<>
    `;

    console.log(`[🛒 Buy Now](${presaleLink}) | [🔗 Tx](${event.log.transactionHash}) | [🌐 X](${twitterLink}) | [📝 Contract](${bscScanContractLink})`)
    try {
        // Enviar una foto con el mensaje como descripción
        await bot.sendPhoto(chatId, imageUrl, { caption: messageTelegram, parse_mode: 'Markdown' });
        console.log('✅ Notificación enviada con imagen');
    } catch (error) {
        console.error('❌ Error al enviar el mensaje con imagen a Telegram:', error);
    }

    const discordChannel = await client.channels.fetch(allowedChannelIds[0]);
  // ✅ Discord

  try {
    if (discordChannel) {
        await discordChannel.send({ content: messageDiscord });
        console.log('✅ Notificación enviada a Discord');
        } else {
        console.log('❌ Canal de Discord no encontrado');
        }
    } catch (error) {
        console.error('❌ Error al enviar el mensaje a Discord:', error);
    }    
}

async function listenEvents() {
    console.log('🚀 Bot de monitoreo compras iniciado. Esperando eventos...');
    contract.on("Swap", handleSwap); // Escuchar evento
    lendingContract.on("Borrow", handleBorrow);
}

listenEvents();
