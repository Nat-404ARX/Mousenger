require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Client, GatewayIntentBits } = require("discord.js");


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


function formatMessage(message) {
  const isCommand = message.content?.startsWith("\\");

  let image = null;

  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    image = attachment.url;
  }

  return {
    id: message.id,
    text: message.content,
    author: message.author.username,
    avatar: message.author.displayAvatarURL(),
    channelId: message.channel.id,
    type: isCommand ? "command" : message.author.bot ? "bot" : "discord",
    image,
  };
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

io.on("connection", (socket) => {
  socket.on("joinChannel", (channelId) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }

    socket.join(channelId);
    console.log("Client rejoint :", channelId);
  });
});

let botAFK = false;

function handleCommand(message, client) {
  const content = message.content.slice(1);
  const [cmd, ...args] = content.split(" ");
  const fullText = args.join(" ");
  console.log("IO =", io);
  

  if (botAFK && cmd !== "afk") {
    return {
      text: "Mouse est actuellement AFK...",
    };
  }

  switch (cmd) {
    case "?":
      return {
        text: `Commandes disponibles :
\\ping
\\roll [max]
\\flip
\\smile [message]
\\bold [message]
`, 
/*
\\info [username]
\\afk*/
      };

    case "ping":
      return {
        text: `Pong (${Date.now() - message.createdTimestamp}ms)`,
      };

    case "roll":
      const max = parseInt(args[0]) || 100;
      const roll = Math.floor(Math.random() * max) + 1;
      return {
        text: `Résultat : ${roll} / ${max}`,
      };

    case "flip":
      return {
        text: Math.random() < 0.5 ? "Pile !" : "Face !",
      };

    case "smile":
      return {
        text: `${fullText} :)`,
      };

    case "bold":
      return {
        text: `**${fullText}**`,
      };
    /*
    case "afk":
      
      if (!client || !client.user) {
        return { text: "Mouse n'est pas prêt" };
      }

      const isAFK = client.user.presence?.status === "idle";

      if (isAFK) {
        client.user.setPresence({
          status: "online",
          activities: [{ name: "Mousenger" }],
        });

        return { text: "Mouse est de retour !" };
      } else {
        client.user.setPresence({
          status: "idle",
          activities: [{ name: "AFK" }],
        });

        return { text: "Mouse est passé en mode AFK" };
      }

    case "info":
      const target = args[0];

      if (!target) {
        return { text: "Utilisation : \\info [username]" };
      }
      const user = client.users.cache.find(
        (u) => u.username.toLowerCase() === target.toLowerCase(),
      );

      if (!user) {
        return { text: "Utilisateur introuvable" };
      }

      return {
        text: `${user.username}`,
        avatar: user.displayAvatarURL(),
        bio: user.bio || "Pas de bio",
        type: "info",
      };
    */
    default:
      return { text: `Commande inconnue : ${cmd}` };
  }
}


client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  /*
  if (
    !message.content &&
    message.attachments.size === 0 &&
    message.stickers.size === 0
  ) {
    return;
  }

  if (attachment) {
    const type = attachment.contentType || "";

    if (type.startsWith("video/") || type.startsWith("audio/")) {
      return {
        text: "Fichier non supporté",
      };
    }
  }

  if (message.stickers.size > 0) {
    return {
      text: "Sticker",
    };
  }

  if (message.poll) {
    return {
      text: "Sondage",
    };
  }
  */
  if (message.content.startsWith("\\")) {
    const response = handleCommand(message, io);

    if (response) {
      const reply = await message.reply(response.text);

      const msg = formatMessage(reply);
      io.to(msg.channelId).emit("newMessage", msg);
    }

    return;
  }
  const filtre = ["@", "|", "/"];
  let invalide = false;

  for (const element of filtre) {
    if (message.content.includes(element)) {
      invalide = true;
      break;
    }
  }

  if (invalide) {
    console.log("Message bloqué :", message.content, "de", message.author.username);
    return;
  }

  const msg = formatMessage(message);

  console.log("Message reçu :", msg.text, "de", msg.author, "(", msg.type, ")");

  io.to(msg.channelId).emit("newMessage", msg);
});


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
    guildId: guild.id, 
    channels: salons
      .filter((s) => s.parentId === cat.id)
      .sort((a, b) => a.position - b.position),
  }));

  res.json(structure);
});


let lastFetch = 0;

app.get("/members/:guildId", async (req, res) => {
  try {
    const now = Date.now();

    const guild = await client.guilds.fetch(req.params.guildId);

    if (now - lastFetch > 60000) {
      await guild.members.fetch();
      lastFetch = now;
    }

    const active = [];
    const inactive = [];

    guild.members.cache.forEach((member) => {
      if (member.user.bot) return;

      const user = {
        id: member.id,
        username: member.user.username,
        avatar: member.user.displayAvatarURL(),
      };

      if (member.presence?.status === "online") {
        active.push(user);
      } else {
        inactive.push(user);
      }
    });

    res.json({ active, inactive });
  } catch (err) {
    console.error("Erreur /members:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-message/:channelId", async (req, res) => {
  const { message } = req.body;
  const { channelId } = req.params;

  try {
    const channel = await client.channels.fetch(channelId);

    // commande
    if (message.startsWith("\\")) {
      const response = handleCommand({ content: message });

      const sent = await channel.send(response.text);

      const msg = formatMessage(sent);

      io.to(channelId).emit("newMessage", msg);

      return res.json({ success: true });
    }

    // message
    const sent = await channel.send(message);

    const msg = formatMessage(sent);

    io.to(channelId).emit("newMessage", msg);

    console.log("Message envoyé :", msg.text," de ", msg.author,"(",msg.type,")");

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

app.delete("/deleteMessage/:channelId/:messageId", async (req, res) => {
  const { channelId, messageId } = req.params;

  try {
    const channel = await client.channels.fetch(channelId);
    const msg = await channel.messages.fetch(messageId);

    if (messageId.length < 17) {
      return res.json({ success: false });
    }

    await msg.delete();

    io.to(channelId).emit("deleteMessage", messageId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});


app.get("/messages/:channelId", async (req, res) => {
  const { channelId } = req.params;
  const before = req.query.before;

  try {
    const channel = await client.channels.fetch(channelId);

    const options = { limit: 30 };
    if (before) options.before = before;

    const msgs = await channel.messages.fetch(options);

    const formatted = msgs.map(formatMessage);

    res.json(formatted.reverse());
  } catch (err) {
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

server.listen(3001, () => {
  console.log("API bot lancée sur port 3001");
});

