import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export const sendMessageToGemini = async (history, message) => {
  if (!model) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Convert chat history to Gemini format
  // Gemini requires history to start with a user message.
  // We filter out any initial model/assistant messages if they appear first.
  const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
  }));

  // Find the index of the first user message
  const firstUserIndex = formattedHistory.findIndex(msg => msg.role === 'user');
  
  // If no user messages yet, or if model messages come before the first user message, cleanup:
  const validHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

  const chat = model.startChat({
    history: validHistory,
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};

export const generateLearningPlan = async (userProfile) => {
  if (!model) {
    throw new Error("Gemini API Key is missing.");
  }

  const prompt = `
    You are an expert curriculum designer. Create a 7-day learning plan for:
    - Topic: ${userProfile.topic}
    - Level: ${userProfile.level}
    - Time per day: ${userProfile.timeCommitment}
    - Goal/Motivation: ${userProfile.motivation}

    Return ONLY raw JSON (no markdown formatting, no code blocks) with this exact structure:
    {
      "topic": "Topic Name",
      "days": [
        {
          "id": "day-1",
          "title": "Day 1: Focus Area",
          "steps": [
            { 
               "id": "d1-s1", 
               "title": "Step Title", 
               "type": "video" | "article" | "quiz" | "exercise" | "project", 
               "duration": "15m", 
               "completed": false 
            }
          ]
        }
      ]
    }
    
    Make it engaging and practical. 
    Ensure there are 7 days. 
    Ensure steps fit within the ${userProfile.timeCommitment} daily limit.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present (Gemini sometimes adds them)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw error;
  }
};

export const reviseLearningPlan = async (plan, userProfile, feedback) => {
  if (!model) {
    throw new Error("Gemini API Key is missing.");
  }

  const prompt = `
    You are an expert curriculum designer. Revise the following learning plan based on user feedback.
    
    Original plan:
    ${JSON.stringify(plan, null, 2)}
    
    User profile:
    - Topic: ${userProfile.topic}
    - Level: ${userProfile.level}
    - Time per day: ${userProfile.timeCommitment}
    - Goal/Motivation: ${userProfile.motivation}
    
    User feedback: ${feedback}
    
    Revise the plan according to the feedback while maintaining the same JSON structure. Keep the same number of days (7 days) unless the feedback specifically requests a different duration. Ensure steps fit within the ${userProfile.timeCommitment} daily limit.
    
    Return ONLY raw JSON (no markdown formatting, no code blocks) with this exact structure:
    {
      "topic": "Topic Name",
      "days": [
        {
          "id": "day-1",
          "title": "Day 1: Focus Area",
          "steps": [
            { 
               "id": "d1-s1", 
               "title": "Step Title", 
               "type": "video" | "article" | "quiz" | "exercise" | "project", 
               "duration": "15m", 
               "completed": false 
            }
          ]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present (Gemini sometimes adds them)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to revise plan:", error);
    throw error;
  }
};
