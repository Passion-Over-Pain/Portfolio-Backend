import { NextResponse } from 'next/server';

export async function GET(req) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  // Get repoOwner and repoName from query params
  const { repoOwner, repoName } = req.query;

  // Ensure both repoOwner and repoName are provided
  if (!repoOwner || !repoName) {
    return NextResponse.json({ error: "Missing repoOwner or repoName" }, { status: 400 });
  }

  // Encode these parameters in the state to be passed to GitHub
  const state = encodeURIComponent(JSON.stringify({ repoOwner, repoName }));

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo&state=${state}`;

  return NextResponse.redirect(githubAuthUrl);
}

