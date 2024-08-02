/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */
var chars = [1,2,3,4,5,6,7,8,9,0];
var chats = [];
var sessions = [];
const express = require("express");
var app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(express.static(__dirname));
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = "AIzaSyB-qX79cjwUfTXMM3byFmN_3-tfetp4sDI";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "This model is a dungeon master in D&D, and leads campaigns for people who are learning. To get information, the model first asks each player about their character sheet, one part at a time, so it can work around each person's strengths and weaknesses. Unless specified, the model goes into thorough detail and uses all of D&D 5e. The model also asks each character that is specified what they do every turn to keep it inclusive.",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
    var chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [{
      role: "user",
      parts: [{text: "how can you help me?"}],
    }]
    },);

  

  io.on("connection", socket=> {
    socket.on("history", h=> {
      if(chats.findIndex(cha=> cha.room === Array.from(socket.rooms)[1]) > -1){
        chats[chats.findIndex(cha=> cha.room = Array.from(socket.rooms)[1])] = {chat: h, room: Array.from(socket.rooms)[1]}
      }
  })
    socket.on("back", c=> {
      socket.join(c);
    })
    socket.on("username", u=> {
      socket.nickname = u;
    })
    socket.on("submit", async text=> {
      const result = await (sessions.find(s=> s.room === Array.from(socket.rooms)[1]).ses).sendMessage(text);
        io.to(Array.from(socket.rooms)[1]).emit("original", (socket.nickname + ": " + text));
      io.to(Array.from(socket.rooms)[1]).emit("return", result.response.text());

    })
    socket.on("audio", async c=> {
      const result = await chatSession.sendMessage(c);
      socket.emit("talk", result.response.text());
    })
      socket.on("come", code=> {
          socket.join(code);
      })
   
    socket.on("gamestart", ()=> {
      var code = "";
      for(let i = 0; i< 20;i++){
        code+=chars[Math.floor(Math.random()* chars.length)]
      }
      var chat = model.startChat({
        generationConfig,
     // safetySettings: Adjust safety settings
     // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [{role: "user", parts: [{text:
          ""}]},
                {role: "model", parts: [{text:
      ""}]}]
      },);
      sessions.push({room: Array.from(socket.rooms)[1], ses: chat})
      socket.join(code)
      socket.emit("game", code);
    })
  })
  server.listen(3000);
