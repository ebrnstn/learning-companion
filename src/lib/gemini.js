import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    tools: [
      {
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: "dynamic",
            dynamicThreshold: 0.7,
          },
        },
      },
    ],
  });
}

export const sendMessageToGemini = async (history, message, planContext = null) => {
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
  let validHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

  // Inject Plan Context if available
  if (planContext) {
    const contextMessage = {
      role: 'user',
      parts: [{ text: `System Context: The user is following this learning plan. Use it to answer questions contextually.\n\n${JSON.stringify(planContext)}` }]
    };
    const ackMessage = {
      role: 'model',
      parts: [{ text: "Understood. I will use this learning plan to guide my responses." }]
    };
    
    // Prepend context and ack to the valid history
    validHistory = [contextMessage, ackMessage, ...validHistory];
  }

  const chat = model.startChat({
    history: validHistory,
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};

export const generateLearningPlan = async (userProfile, selectedPathways = []) => {
  if (!model) {
    throw new Error("Gemini API Key is missing.");
  }

  const pathwayContext = selectedPathways.length > 0 
    ? `The user has chosen to focus on these specific learning pathways/directions: ${selectedPathways.join(", ")}. Ensure the curriculum heavily emphasizes these areas.`
    : "";

  const prompt = `
    You are an expert curriculum designer. Create a 7-day learning plan for:
    - Topic: ${userProfile.topic}
    - Level: ${userProfile.level}
    - Time per day: ${userProfile.timeCommitment}
    - Goal/Motivation: ${userProfile.motivation}
    
    ${pathwayContext}

    **CRITICAL INSTRUCTION: FIND REAL RESOURCES**
    Use Google Search to find high-quality, free, and accessible learning resources for each step. 
    - For "video" steps, find actual YouTube videos or free course videos.
    - For "article" steps, find reputable tutorials, documentation, or blog posts.
    - For "project" steps, find specific project ideas or tutorials.
    
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
               "url": "https://actual-url-found-via-search.com",
               "completed": false 
            }
          ]
        }
      ]
    }
    
    Make it engaging and practical. 
    Ensure there are 7 days. 
    Ensure steps fit within the ${userProfile.timeCommitment} daily limit.
    Double check that all URLs are real and relevant found from your search.
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

export const generateLearningPathways = async (userProfile) => {
  if (!model) {
    throw new Error("Gemini API Key is missing.");
  }

  const prompt = `
    You are an expert educational counselor. The user wants to learn about "${userProfile.topic}".
    Identify 3-4 distinct, actionable learning pathways or specializations within this topic that they could focus on.
    
    User Profile:
    - Level: ${userProfile.level}
    - Motivation: ${userProfile.motivation}
    
    Return ONLY raw JSON (no markdown formatting) with this structure:
    [
      {
        "id": "path-1",
        "title": "Short Headline (e.g. Data Scientist)",
        "learning_goal": "A concise sentence describing the primary outcome or goal of this path."
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to generate pathways:", error);
    throw error;
  }
};

export const searchStepResources = async (stepTitle, stepType, planTopic) => {
  if (!model) {
    throw new Error("Gemini API Key is missing.");
  }

  const prompt = `
    Find 3-5 high-quality, free learning resources for this specific learning step:

    Overall Topic: ${planTopic}
    Step: ${stepTitle}
    Preferred Type: ${stepType} (video, article, exercise, etc.)

    Use Google Search to find real, accessible resources.
    Prioritize: YouTube videos, official documentation, reputable tutorials.

    Return ONLY raw JSON (no markdown):
    [
      { "title": "Resource Title", "url": "https://...", "description": "Brief description" }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to search step resources:", error);
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
               "url": "https://actual-url-found-via-search.com",
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
