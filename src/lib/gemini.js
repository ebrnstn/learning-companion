import { GoogleGenAI } from "@google/genai/web";
import { googleSearch, isGoogleSearchConfigured } from "./googleSearch";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// Tool for Google Search grounding (fallback when Custom Search API isn't configured)
const googleSearchTool = { googleSearch: {} };

export const sendMessageToGemini = async (history, message, planContext = null) => {
  if (!ai) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Build context from plan if available
  let systemContext = "";
  if (planContext) {
    systemContext = `System Context: The user is following this learning plan. Use it to answer questions contextually.\n\n${JSON.stringify(planContext)}\n\n`;
  }

  // Convert chat history to the new SDK format
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Find the index of the first user message
  const firstUserIndex = formattedHistory.findIndex(msg => msg.role === 'user');
  let validHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

  // Prepend context if available
  if (planContext && validHistory.length > 0) {
    validHistory[0].parts[0].text = systemContext + validHistory[0].parts[0].text;
  }

  // Build contents for the API call
  const contents = [...validHistory, { role: 'user', parts: [{ text: message }] }];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });

  return response.text;
};

/**
 * Search for learning resources using Google Custom Search API
 * @param {string} topic - The learning topic
 * @param {string} type - Resource type: video, article, project, exercise, quiz
 * @returns {Promise<Array>} Array of search results with title, link, snippet
 */
async function findLearningResources(topic, type) {
  const searchQueries = {
    video: `${topic} tutorial site:youtube.com`,
    article: `${topic} tutorial guide beginner`,
    project: `${topic} project tutorial hands-on`,
    exercise: `${topic} practice exercises`,
    quiz: `${topic} quiz questions practice`,
  };

  const query = searchQueries[type] || `${topic} learn ${type}`;
  
  try {
    const results = await googleSearch(query, { num: 5 });
    return results;
  } catch (error) {
    console.warn(`Search failed for "${query}":`, error.message);
    return [];
  }
}

/**
 * Enrich a learning plan with real URLs from Google Custom Search
 * @param {Object} plan - The learning plan with placeholder or empty URLs
 * @param {string} topic - The main learning topic
 * @returns {Promise<Object>} The plan with real URLs populated
 */
async function enrichPlanWithResources(plan, topic) {
  // Collect all unique step types we need to search for
  const resourceCache = {};
  
  for (const day of plan.days) {
    for (const step of day.steps) {
      const cacheKey = `${step.type}-${step.title}`;
      
      if (!resourceCache[cacheKey]) {
        // Search for resources matching this step
        const searchTopic = `${topic} ${step.title}`;
        const results = await findLearningResources(searchTopic, step.type);
        resourceCache[cacheKey] = results;
      }
      
      // Assign the first available result URL
      const resources = resourceCache[cacheKey];
      if (resources.length > 0) {
        const resource = resources.shift(); // Use and remove the first result
        step.url = resource.link;
        step.resourceTitle = resource.title;
      }
    }
  }
  
  return plan;
}

export const generateLearningPlan = async (userProfile, selectedPathways = []) => {
  if (!ai) {
    throw new Error("Gemini API Key is missing.");
  }

  const pathwayContext = selectedPathways.length > 0 
    ? `The user has chosen to focus on these specific learning pathways/directions: ${selectedPathways.join(", ")}. Ensure the curriculum heavily emphasizes these areas.`
    : "";

  // Check if Custom Search API is available
  const useCustomSearch = isGoogleSearchConfigured();
  
  const prompt = `
    You are an expert curriculum designer. Create a 7-day learning plan for:
    - Topic: ${userProfile.topic}
    - Level: ${userProfile.level}
    - Time per day: ${userProfile.timeCommitment}
    - Goal/Motivation: ${userProfile.motivation}
    
    ${pathwayContext}

    ${useCustomSearch ? `
    **Note: URLs will be populated automatically. Focus on creating descriptive step titles that will help find relevant resources.**
    For the "url" field, use an empty string "" - real URLs will be found via search.
    ` : `
    **CRITICAL INSTRUCTION: FIND REAL RESOURCES**
    Use Google Search to find high-quality, free, and accessible learning resources for each step. 
    - For "video" steps, find actual YouTube videos or free course videos.
    - For "article" steps, find reputable tutorials, documentation, or blog posts.
    - For "project" steps, find specific project ideas or tutorials.
    Double check that all URLs are real and relevant found from your search.
    `}
    
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
               "title": "Step Title - make this descriptive for searching", 
               "type": "video" | "article" | "quiz" | "exercise" | "project", 
               "duration": "15m", 
               "url": "${useCustomSearch ? '' : 'https://actual-url-found-via-search.com'}",
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: useCustomSearch ? {} : { tools: [googleSearchTool] },
    });

    const text = response.text;
    
    // Clean up markdown code blocks if present (Gemini sometimes adds them)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let plan = JSON.parse(jsonString);
    
    // If Custom Search is configured, enrich the plan with real URLs
    if (useCustomSearch) {
      console.log("Enriching plan with Google Custom Search resources...");
      plan = await enrichPlanWithResources(plan, userProfile.topic);
    }
    
    return plan;
  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw error;
  }
};

export const generateLearningPathways = async (userProfile) => {
  if (!ai) {
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
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
  if (!ai) {
    throw new Error("Gemini API Key is missing.");
  }

  // Check if Custom Search API is available
  const useCustomSearch = isGoogleSearchConfigured();

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
    
    ${useCustomSearch ? `
    **Note: URLs will be populated automatically. Focus on creating descriptive step titles.**
    For the "url" field, use an empty string "" - real URLs will be found via search.
    ` : `
    Use Google Search to find real URLs for any new or changed resources.
    `}
    
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
               "url": "${useCustomSearch ? '' : 'https://actual-url-found-via-search.com'}",
               "completed": false 
            }
          ]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: useCustomSearch ? {} : { tools: [googleSearchTool] },
    });

    const text = response.text;
    
    // Clean up markdown code blocks if present (Gemini sometimes adds them)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let revisedPlan = JSON.parse(jsonString);
    
    // If Custom Search is configured, enrich the plan with real URLs
    if (useCustomSearch) {
      console.log("Enriching revised plan with Google Custom Search resources...");
      revisedPlan = await enrichPlanWithResources(revisedPlan, userProfile.topic);
    }
    
    return revisedPlan;
  } catch (error) {
    console.error("Failed to revise plan:", error);
    throw error;
  }
};
