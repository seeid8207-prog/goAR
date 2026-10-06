# EAS build automation

GoAR includes a manual GitHub Actions workflow at `.github/workflows/eas-build.yml`.

## One-time setup

1. Initialize the repository against the correct Expo/EAS project:

       npx eas-cli init

2. Commit the generated `expo.extra.eas.projectId` in the app configuration.
3. Create an Expo access token with the minimum account/project permissions needed for CI.
4. Add it to GitHub repository Actions secrets as `EXPO_TOKEN`.
5. Configure EAS environment variables/secrets for the chosen build profile.

Do not commit Expo access tokens, signing secrets, database credentials or the admin API token.

## Triggering a build

Open GitHub Actions → **GoAR EAS Build** → **Run workflow**.

Choose:
- platform: android, ios or all,
- profile: development, preview or production.

The workflow:
- refuses to run without `EXPO_TOKEN`,
- refuses to run if the repository is not linked to an EAS project,
- runs navigation tests,
- runs API security tests,
- runs the full TypeScript check,
- triggers a non-interactive EAS build.

Production EAS builds also execute the repository's `eas-build-post-install` hook, which enforces the production configuration validator.

The workflow intentionally does not submit automatically to Google Play or the App Store. Store submission should only be enabled after physical-device acceptance testing, privacy/store metadata review and signing-account setup.
