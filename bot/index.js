require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");
const { Client, GatewayIntentBits } = require("discord.js");

//const TOKEN = process.env.TOKEN;
//const CHANNEL_ID = process.env.CHANNEL_ID;

const { TOKEN, CHANNEL_ID } = require("./temp.js");


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

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
  });

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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
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

app.get("/members/:guildId", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(req.params.guildId);

    const members = await guild.members.fetch();

    const formatted = members.map((member) => {
      const status = member.presence?.status || "offline";

      return {
        id: member.id,
        username: member.user.username,
        status: status,
      };
    });

    const active = formatted.filter((m) => m.status !== "offline");
    const inactive = formatted.filter((m) => m.status === "offline");

    console.log("Guild ID reçu :", req.params.guildId);

    res.json({
      active,
      inactive,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// app.post("/send-message", async (req, res) => {
//   const { message, author, type } = req.body;

//   const channel = await client.channels.fetch(CHANNEL_ID);

//   await channel.send(message);

//   const msg = {
//     id: Date.now(),
//     author,
//     text: message,
//     type,
//   };

//   console.log("Message envoyé : ", msg.text, " de ", msg.author);

//   messages.push(msg);
//   saveMessages();

//   io.emit("newMessage", msg);

//   res.json({ status: "ok" });
// });

app.post("/send-message/:channelId", async (req, res) => {
  const channelId = req.params.channelId;
  const { message, author, type } = req.body;

  try {
    const channel = await client.channels.fetch(channelId);

    const discordMessage = await channel.send(message);

    const msg = {
      id: discordMessage.id,
      author,
      text: message,
      type,
      channelId,
    };

    

    console.log("Message envoyé : ",msg.text," de ", msg.author,"(",msg.type,")");

    messages.push(msg);
    saveMessages();

    io.to(msg.channelId).emit("newMessage", msg);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// app.delete("/deleteMessage/:id", async (req, res) => {
//   const messageId = req.params.id;

//   try {
//     await fetch(
//       `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${messageId}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bot ${TOKEN}`,
//         },
//       },
//     );

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });

app.delete("/deleteMessage/:channelId/:messageId", async (req, res) => {
  const { channelId, messageId } = req.params;

  try {
    const channel = await client.channels.fetch(channelId);
    const msg = await channel.messages.fetch(messageId);

    if (messageId.length < 17) {
      return res.json({ success: false });
    }

    await msg.delete();

    messages = messages.filter((m) => m.id !== messageId);
    saveMessages();

    io.to(msg.channelId).emit("deleteMessage", messageId);
    //io.emit("deleteMessage", messageId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

app.get("/messages/:channelId", async (req, res) => {
  const channelId = req.params.channelId;
  const before = req.query.before;

  try {
    const channel = await client.channels.fetch(channelId);

    const options = { limit: 30 };

    if (before) {
      options.before = before;
    }

    const discordMessages = await channel.messages.fetch(options);

    const formatted = discordMessages.map((m) => ({
      id: m.id,
      author: m.author.username,
      text: m.content,
      type: m.author.username === "Mouse" ? "user" : "discord",
      channelId,
    }));

    res.json(formatted.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
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
  if (!message.guild) return;
  if (message.author.username == "Mouse") return;

  const msg = {
    id: message.id,
    author: message.author.username,
    text: message.content,
    type: "discord",
    channelId: message.channel.id,
  };

  console.log("Message reçu :",message.content," de ",message.author.username,"(",msg.type,")");

  messages.push(msg);
  saveMessages();

  //io.emit("newMessage", msg);
  io.to(msg.channelId).emit("newMessage", msg);
});

server.listen(3001, () => {
  console.log("API bot lancée sur port 3001");
});
