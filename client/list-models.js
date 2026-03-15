
async function listAllModels() {
  const apiKey = 'AIzaSyBTa8KKBfIX1BbFFI4lczaU_iSU3n1lUl0';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Fetching available models for provided API key...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Error fetching models:");
      console.error(JSON.stringify(data.error, null, 2));
      return;
    }

    if (data.models) {
      console.log("✅ Available Models:");
      data.models.forEach(m => {
        console.log(`- ${m.name} (${m.displayName})`);
        console.log(`  Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
      });
    } else {
      console.log("No models found for this key.");
    }
  } catch (e) {
    console.error("❌ Fetch failed:", e.message);
  }
}

listAllModels();
