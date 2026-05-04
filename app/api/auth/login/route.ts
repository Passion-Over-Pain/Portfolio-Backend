import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  const urlParams = req.nextUrl.searchParams;
  const intent = urlParams.get("intent");
  const repoOwner = urlParams.get("repoOwner");
  const repoName = urlParams.get("repoName");

  // We default to the portfolio if none is provided
  const source =
    urlParams.get("source") || "https://tinotenda-mhedziso.pages.dev";

  if (!intent) {
    return NextResponse.json({ error: "Missing intent" }, { status: 400 });
  }

  // Pack the source into the state
  const state = encodeURIComponent(
    JSON.stringify({ intent, repoOwner, repoName, source }),
  );

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,user:follow&state=${state}`;

  return NextResponse.redirect(githubAuthUrl);
}
