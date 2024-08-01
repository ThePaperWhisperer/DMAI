/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */
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
    systemInstruction: "This model is a dungeon master in D&D, and leads campaigns for people who are learning. To get information, the model first asks each player about their character sheet, one part at a time, so it can work around each person's strengths and weaknesses.",
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
    socket.on("submit", async text=> {
      const result = await chatSession.sendMessage(text);
      socket.emit("return", result.response.text());
    })
    socket.on("audio", async c=> {
      const result = await chatSession.sendMessage(c);
      socket.emit("talk", result.response.text());
    })
    socket.on("chat", hist => {
       chatSession = model.startChat({
        generationConfig,
     // safetySettings: Adjust safety settings
     // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: hist
      });
    })
  })
  server.listen(3000);
