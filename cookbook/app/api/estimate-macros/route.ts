import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getAwsClientConfig } from '@/lib/awsCredentials';
import { Ingredient } from '@/lib/types';

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...getAwsClientConfig(),
});

export async function POST(req: NextRequest) {
  const { ingredients, servings } = await req.json() as { ingredients: Ingredient[]; servings?: number };

  if (!ingredients?.length) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  const ingredientList = ingredients
    .filter(i => i.name && i.quantity)
    .map(i => `- ${i.quantity}${i.unit ? ' ' + i.unit : ''} ${i.name}`)
    .join('\n');

  const prompt = `You are a precise nutrition calculator. Estimate the macronutrients for the following recipe.

IMPORTANT rules:
- Treat all quantities as exact weights in the unit specified (e.g. "210 grams" means exactly 210g, not a typical serving size)
- Use standard USDA nutrition data per 100g as your reference, then scale to the exact quantity given
- If an ingredient says "cooked", use cooked nutrition values (cooked meat is more calorie-dense per gram than raw)
- Sum all ingredients to get the total recipe macros, then divide by ${servings || 1} serving(s)
- Do not default to typical portion sizes — use the exact weights provided

Ingredients (${servings || 1} serving${(servings || 1) > 1 ? 's' : ''}):
${ingredientList}

Respond with ONLY a JSON object, no explanation:
{"protein": <grams per serving, rounded to nearest whole number>, "carbs": <grams per serving, rounded to nearest whole number>, "fat": <grams per serving, rounded to nearest whole number>}`;

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'us.anthropic.claude-sonnet-4-6',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 100,
      temperature: 0,
      system: 'You are a nutrition calculator. You ONLY respond with a valid JSON object. No explanations, no preamble, no markdown. Just the JSON.',
      messages: [{ role: 'user', content: prompt }],
    }),
  }));

  const raw = JSON.parse(new TextDecoder().decode(response.body));
  const text: string = raw.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  const macros = JSON.parse(text);

  return NextResponse.json(macros);
}
