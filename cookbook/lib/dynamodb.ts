import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Recipe } from './types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'recipes';

export async function putRecipe(recipe: Recipe): Promise<void> {
  try {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: recipe,
      })
    );
  } catch (error) {
    console.error('Error putting recipe to DynamoDB:', error);
    throw new Error('Failed to save recipe to database');
  }
}

export async function getRecipe(recipeId: string): Promise<Recipe | null> {
  try {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { recipeId },
      })
    );
    return (result.Item as Recipe) || null;
  } catch (error) {
    console.error('Error getting recipe from DynamoDB:', error);
    throw new Error('Failed to fetch recipe from database');
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );
    return (result.Items as Recipe[]) || [];
  } catch (error) {
    console.error('Error scanning recipes from DynamoDB:', error);
    throw new Error('Failed to fetch recipes from database');
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { recipeId },
      })
    );
  } catch (error) {
    console.error('Error deleting recipe from DynamoDB:', error);
    throw new Error('Failed to delete recipe from database');
  }
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Recipe>
): Promise<Recipe> {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'recipeId') {
        updateExpression.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = updates[key as keyof Recipe];
      }
    });

    updates.updatedAt = new Date().toISOString();
    updateExpression.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = updates.updatedAt;

    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { recipeId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    const updatedRecipe = await getRecipe(recipeId);
    if (!updatedRecipe) {
      throw new Error('Recipe not found after update');
    }
    return updatedRecipe;
  } catch (error) {
    console.error('Error updating recipe in DynamoDB:', error);
    throw new Error('Failed to update recipe in database');
  }
}
