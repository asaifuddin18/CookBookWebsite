# Future Features

Ideas and enhancements to revisit later.

## AI-powered macro estimation

When adding or editing a recipe, add an "Estimate macros" button that sends the ingredients list to the Claude API (Haiku model — fractions of a cent per request) and returns estimated protein/carbs/fat per serving. The author can then review and adjust before saving. Calories would auto-calculate as usual (protein×4 + carbs×4 + fat×9).

**Why deferred:** Manual entry works fine for now. AI estimation adds per-request cost, even if small.

**Implementation note:** Use AWS Bedrock (`@aws-sdk/client-bedrock-runtime`) to invoke Claude — consistent with the existing AWS setup, billed through the same AWS account, and the `cookbook-app` IAM user just needs `bedrock:InvokeModel` added to its policy.

## Comments and ratings

Let users leave a star rating (1–5) and a short note on a recipe (e.g. "made this, added extra garlic"). Store in a separate `comments` DynamoDB table with `recipeId` as PK and a sort key of `userId#timestamp`.

## Shopping list

Button on the recipe page to add all ingredients to a running shopping list. List accessible from the nav, stored per-user in DynamoDB. Support checking off items as you shop.

## Recipe collections

Let users group recipes into named sets (e.g. "Christmas 2025", "Weeknight Dinners"). Stored in a `collections` DynamoDB table. Shareable via link.

## Related recipes

At the bottom of a recipe page, show 2–3 recipes with the same cuisine or meal type.

## Recipe import from photo or document

On the "Add recipe" page, provide an import option with three input modes:

1. **Photo or document** — upload an image of a handwritten recipe card, a PDF, or a screenshot and have Claude extract all fields.
2. **URL** — paste a link to any recipe website and have Claude fetch and parse the page content into recipe fields.

In all cases Claude populates title, description, ingredients, instructions, times, servings, etc. and the author reviews and edits before saving.

**Why deferred:** Requires file handling (passing image/PDF bytes to Bedrock) and server-side URL fetching. Good candidate to build alongside the AI macro estimation feature.

## Print view

A clean, printer-friendly layout for a recipe — no nav, no buttons, just the hero image, ingredients, and steps. Triggered via a print button or `?print=1` query param.
