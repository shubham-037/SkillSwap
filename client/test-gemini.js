
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const apiKey = 'AIzaSyBTa8KKBfIX1BbFFI4lczaU_iSU3n1lUl0';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-3-flash', // As requested by user
    'gemini-1.5-pro'
  ];

  console.log("Starting model diagnostic test...");
  
  for (const m of models) {
    console.log(`--- Testing model: ${m} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Respond with 'OK' and nothing else.");
      const response = await result.response;
      const text = response.text();
      console.log(`✅ Success with ${m}: [${text.trim()}]`);
    } catch (e) {
      console.error(`❌ Failed with ${m}:`);
      console.error(`   Message: ${e.message}`);
      if (e.status) console.error(`   Status: ${e.status}`);
    }
  }
}

testModels();
