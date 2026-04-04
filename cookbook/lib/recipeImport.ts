import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface ImportedRecipe {
  title: string;
  description?: string;
  ingredients: { name: string; quantity: string; unit?: string }[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  mealType?: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack'>;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Japanese' | 'Other';
  tags?: string[];
}

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information and return ONLY a JSON object with no explanation or markdown.

The JSON must follow this exact structure:
{
  "title": string,
  "description": string (optional, 1-2 sentences),
  "ingredients": [{ "name": string, "quantity": string, "unit": string (optional) }],
  "instructions": string[] (each step as a separate string),
  "prepTime": number (minutes, optional),
  "cookTime": number (minutes, optional),
  "servings": number (optional),
  "mealType": array containing any of "Breakfast","Lunch","Dinner","Dessert","Snack" (optional),
  "difficulty": "Easy" or "Medium" or "Hard" (optional),
  "cuisine": one of "American","Indian","Thai","Italian","Chinese","Korean","Mexican","Japanese","Other" (optional),
  "tags": string[] (optional, short descriptive tags)
}

For ingredients, split quantity and unit clearly. For example "2 cups flour" → name: "flour", quantity: "2", unit: "cups".
Return ONLY the JSON object, no markdown code fences.`;

export async function extractRecipeFromContent(
  content: { type: 'text'; text: string } | { type: 'image'; base64: string; mediaType: string },
  instructions?: string
): Promise<ImportedRecipe> {
  const instructionsNote = instructions?.trim() ? `\n\nAdditional instructions from the user: ${instructions.trim()}` : '';

  const messageContent = content.type === 'image'
    ? [
        {
          type: 'image',
          source: { type: 'base64', media_type: content.mediaType, data: content.base64 },
        },
        { type: 'text', text: `Extract the recipe from this image.${instructionsNote}` },
      ]
    : [{ type: 'text', text: `Extract the recipe from the following content:\n\n${content.text}${instructionsNote}` }];

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'us.anthropic.claude-sonnet-4-6',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: messageContent }],
    }),
  }));

  const raw = JSON.parse(new TextDecoder().decode(response.body));
  const text: string = raw.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(text) as ImportedRecipe;
}
