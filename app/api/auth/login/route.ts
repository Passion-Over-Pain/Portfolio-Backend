import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  // Get intent, repoOwner, and repoName from query parameters
  const urlParams = req.nextUrl.searchParams;
  const intent = urlParams.get("intent"); // "star" or "follow"
  const repoOwner = urlParams.get("repoOwner");
  const repoName = urlParams.get("repoName");

  if (!intent) {
    return NextResponse.json(
      { error: "Missing intent (star or follow)" },
      { status: 400 }
    );
  }

  // Encode intent + optional repo details into state
  const state = encodeURIComponent(
    JSON.stringify({ intent, repoOwner, repoName })
  );

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,user:follow&state=${state}`;

  return NextResponse.redirect(githubAuthUrl);
}
