# Saifuddin's Kitchen

A private family cookbook website for storing, browsing, and managing recipes. Built with Next.js, AWS, and deployed on Vercel.

---

## Architecture Overview

```
Browser
  └── Vercel (Next.js 15 App Router)
        ├── Static/ISR pages (CDN edge)
        ├── API routes (serverless functions)
        │     ├── DynamoDB  ──► AWS
        │     ├── S3        ──► AWS
        │     └── Bedrock   ──► AWS
        └── Auth (NextAuth.js + Google OAuth)

Infra (AWS CDK v2)
  ├── DynamoDB tables
  ├── S3 bucket
  └── IAM roles (OIDC — Vercel + GitHub Actions)
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 + Google OAuth |
| Database | AWS DynamoDB |
| File storage | AWS S3 |
| AI | AWS Bedrock (Claude Sonnet 4.6) |
| Infrastructure | AWS CDK v2 |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

---

## Project Structure

```
/
├── cookbook/               # Next.js app
│   ├── app/
│   │   ├── page.tsx                        # Home page (ISR)
│   │   ├── layout.tsx                      # Root layout, metadata, top loader
│   │   ├── not-found.tsx                   # Custom 404
│   │   ├── opengraph-image.tsx             # Home page OG image
│   │   ├── auth/signin/                    # Sign-in page
│   │   ├── recipes/
│   │   │   ├── new/                        # Create recipe page
│   │   │   └── [id]/
│   │   │       ├── page.tsx                # Recipe detail page (ISR)
│   │   │       ├── edit/                   # Edit recipe page
│   │   │       └── opengraph-image.tsx     # Per-recipe OG image
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/         # NextAuth handler
│   │   │   ├── recipes/
│   │   │   │   ├── route.ts                # GET all, POST create
│   │   │   │   └── [id]/route.ts           # GET, PUT, DELETE by ID
│   │   │   ├── import-recipe/
│   │   │   │   ├── photo/route.ts          # Import from image (Bedrock)
│   │   │   │   ├── url/route.ts            # Import from URL (Bedrock)
│   │   │   │   └── text/route.ts           # Import from raw text (Bedrock)
│   │   │   ├── estimate-macros/route.ts    # AI macro estimation (Bedrock)
│   │   │   ├── favorites/route.ts          # Toggle favorites (DynamoDB)
│   │   │   ├── search/route.ts             # Recipe search
│   │   │   └── upload/route.ts             # S3 pre-signed URL generation
│   │   └── components/                     # All React components
│   └── lib/
│       ├── types.ts                        # Shared TypeScript types
│       ├── validation.ts                   # Zod schemas
│       ├── dynamodb.ts                     # DynamoDB client + queries
│       ├── s3.ts                           # S3 client + helpers
│       ├── recipeImport.ts                 # Bedrock recipe extraction logic
│       ├── awsCredentials.ts               # OIDC credentials provider
│       ├── auth.ts                         # NextAuth config
│       └── useFavorites.ts                 # Favorites hook
└── infra/                  # AWS CDK stack
    └── lib/cookbook-stack.ts
```

---

## AWS Infrastructure

All infrastructure is defined in `infra/lib/cookbook-stack.ts` and deployed via CDK.

### DynamoDB Tables
- **`recipes`** — stores all recipe data (partition key: `recipeId`)
- **`cookbook-favorites`** — stores per-user favorites (partition key: `userId`)

Both tables use on-demand (PAY_PER_REQUEST) billing and have `RETAIN` removal policy.

### S3 Bucket
- Stores recipe photos under the `images/` prefix
- Public read access for serving images directly
- Uploads use pre-signed URLs (PUT) — the client uploads directly to S3, not through the server

### Bedrock
- Model: `us.anthropic.claude-sonnet-4-6` (cross-region inference profile)
- Used for: recipe import from photo/URL/text, macro estimation

### IAM / Authentication to AWS

Two credential paths:

**Vercel (production)**
- Uses OIDC federation via `@vercel/oidc-aws-credentials-provider`
- Vercel issues a short-lived JWT; the app exchanges it for temporary AWS credentials via `AssumeRoleWithWebIdentity`
- Role: `cookbook-vercel-app`
- OIDC provider: `https://oidc.vercel.com/asaifuddin18s-projects`

**Local development**
- Uses `~/.aws/credentials` with a named profile `cookbook`
- Set `AWS_PROFILE=cookbook` in `.env.local`
- The `getAwsClientConfig()` helper in `lib/awsCredentials.ts` returns OIDC credentials when `AWS_ROLE_ARN` is set (Vercel), or an empty object locally (SDK uses default credential chain)

**GitHub Actions (CDK deployments)**
- OIDC federation with GitHub's token issuer
- Role: `cookbook-github-actions-deploy` (AdministratorAccess)
- Triggered on pushes to `main` that modify `infra/**`

---

## Caching Strategy

Pages use **Incremental Static Regeneration (ISR)**:

- Home page and recipe detail pages are pre-rendered at build time via `generateStaticParams`
- `revalidate = 300` — stale-while-revalidate fallback every 5 minutes
- **On-demand revalidation** — `revalidatePath` is called after every create, update, and delete so changes appear on the next page load without waiting for the 5-minute window

---

## Key Features

- **Recipe management** — create, edit, delete with image upload
- **AI recipe import** — paste a URL, photo, or raw text; Claude extracts structured recipe data
- **AI macro estimation** — estimates protein/carbs/fat from ingredients
- **Filters** — by meal type, cuisine, favorites; sort by newest, alphabetical, quickest, calories, macros
- **Search** — full-text search across recipe titles and descriptions
- **Favorites** — per-user favorites persisted in DynamoDB
- **Open Graph images** — dynamic OG images for home page and each recipe
- **Overnight flag** — marks recipes that require overnight prep
- **Serving size scaler** — scales ingredient quantities dynamically

---

## Local Development

```bash
# Install dependencies
cd cookbook && npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AWS_PROFILE

# Run dev server
npm run dev
```

### Required `.env.local` variables

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AWS_PROFILE=cookbook
```

---

## Deploying the App

Vercel auto-deploys on push to `main`. Required Vercel environment variables:

```
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AWS_ROLE_ARN   # cookbook-vercel-app role ARN
```
