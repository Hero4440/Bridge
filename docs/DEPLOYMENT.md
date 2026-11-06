# Bridge deployment

This runbook documents the live Amplify Hosting production branch and the normal deployment loop.

## Live production app

- URL: https://main.d36gmcisbn28tb.amplifyapp.com
- AWS region: `us-east-1`
- Amplify app ID: `d36gmcisbn28tb`
- GitHub branch: `main`
- Branch stage: `PRODUCTION`
- Auto-build: enabled

The URL is stable. Every merge to `main` starts an Amplify Hosting release.
The release first deploys the Amplify Gen 2 backend, then builds and publishes the Vite
frontend from `app/`.

## Normal iteration

Work on a feature branch, then merge through the reviewed pull request:

```sh
git pull --rebase origin main
# make and verify changes
git add -A
git commit -m "describe the change"
git push origin <your-branch>
# Open a pull request into main; the merge starts the production release.
```

Watch the deployment:

```sh
aws amplify list-jobs \
  --app-id d36gmcisbn28tb \
  --branch-name main \
  --max-results 5 \
  --output table

aws amplify get-job \
  --app-id d36gmcisbn28tb \
  --branch-name main \
  --job-id <job-id> \
  --query 'job.summary.{status:status,commitId:commitId,startTime:startTime,endTime:endTime}' \
  --output json
```

`SUCCEED` means the public URL has the new commit. The first full-stack release is slow;
later releases should update the existing branch backend incrementally.

## Hosting build configuration

The app is a monorepo, so Amplify Hosting uses this build spec:

```yaml
version: 1
applications:
  - appRoot: app
    backend:
      phases:
        build:
          commands:
            - npm ci
            - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
```

`pipeline-deploy` generates the branch's `amplify_outputs.json` before Vite builds. Do not
commit that generated file; it is ignored because it contains environment configuration.
Keep `app/package-lock.json` synchronized with `app/package.json`, because Hosting uses
`npm ci`.

## One-time AWS setup (already completed)

The Hosting app is connected to `https://github.com/Hero4440/Bridge.git` and the
`main` branch. It uses the customer IAM role
`arn:aws:iam::429367298232:role/BridgeAmplifyHostingServiceRole` with AWS managed policy
`service-role/AmplifyBackendDeployFullAccess`.

If the app or role must be recreated, use an AWS Amplify **Backend Deployment** service
role, attach that managed policy, and restrict its trust policy to the Amplify principals
and this branch ARN:

```text
arn:aws:amplify:us-east-1:429367298232:apps/d36gmcisbn28tb/branches/main
```

The GitHub access token is never stored in this repository. Reconnect the repository from
the Amplify console or use a locally authenticated `gh` session when recreating the app.

## Local backend sandbox (optional)

Use a personal sandbox for local backend changes; it is separate from the live branch:

```sh
cd app
npx ampx sandbox --identifier <your-name> --once
```

This writes a local, ignored `amplify_outputs.json`. The live URL is deployed by the
Hosting pipeline, not by the local sandbox command.

## Troubleshooting

- `npm ci` says the lockfile is out of sync: run `npm install --package-lock-only` in
  `app/`, commit the lockfile, and push again.
- `BootstrapDetectionError` or `ssm:GetParameter` appears: verify the Hosting app still
  has the backend-deployment role and branch-scoped trust policy above.
- The frontend cannot find `amplify_outputs.json`: make sure the backend phase runs
  `npx ampx pipeline-deploy` before the frontend build.
