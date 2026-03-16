require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");
const { Client, GatewayIntentBits } = require("discord.js");

//const TOKEN = process.env.TOKEN;
//const CHANNEL_ID = process.env.CHANNEL_ID;

import { TOKEN, CHANNEL_ID } from "./temp.js";


if (!TOKEN || !CHANNEL_ID) {
  console.error("TOKEN ou CHANNEL_ID manquant");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {

  socket.on("sendMessage", (msg) => {
    messages.push(msg);
    saveMessages();

    socket.broadcast.emit("newMessage", msg);
  });
});

let messages = [];

if (fs.existsSync("messages.json")) {
  messages = JSON.parse(fs.readFileSync("messages.json"));
}

function saveMessages() {
  fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log("Bot connecté :", client.user.tag);
});

client.login(TOKEN);

app.get("/server-structure", async (req, res) => {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const guild = channel.guild;

  const channels = guild.channels.cache;

  const categories = [];
  const salons = [];

  channels.forEach((ch) => {
    if (ch.type === 4) {
      categories.push({
        id: ch.id,
        name: ch.name,
        position: ch.position,
      });
    }

    if (ch.type === 0) {
      salons.push({
        id: ch.id,
        name: ch.name,
        parentId: ch.parentId,
        position: ch.position,
      });
    }
  });

  const structure = categories.map((cat) => ({
    ...cat,
    channels: salons
      .filter((s) => s.parentId === cat.id)
      .sort((a, b) => a.position - b.position),
  }));

  res.json(structure);
});

app.post("/send-message", async (req, res) => {
  const { message, author, type } = req.body;

  const channel = await client.channels.fetch(CHANNEL_ID);

  await channel.send(message);

  const msg = {
    id: Date.now(),
    author,
    text: message,
    type,
  };

  console.log("Message envoyé : ", msg.text, " de ", msg.author);

  messages.push(msg);
  saveMessages();

  io.emit("newMessage", msg);

  res.json({ status: "ok" });
});

app.delete("/deleteMessage/:id", async (req, res) => {
  const messageId = req.params.id;

  try {
    await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${TOKEN}`,
        },
      },
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.get("/channel-info", async (req, res) => {
  const channel = await client.channels.fetch(CHANNEL_ID);

  res.json({
    name: channel.name,
    id: channel.id,
  });
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.author.username == "Mouse") return;


  const msg = {
    id: Date.now(),
    author: message.author.username,
    text: message.content,
    type: "discord",
  };

  console.log("Message reçu :", message.content," de ", message.author.username,);

  messages.push(msg);
  saveMessages();

  io.emit("newMessage", msg);
});

server.listen(3001, () => {
  console.log("API bot lancée sur port 3001");
});
