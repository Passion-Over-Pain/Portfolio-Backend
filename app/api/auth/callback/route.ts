import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Authorization code or state missing" },
      { status: 400 },
    );
  }

  let intent, repoOwner, repoName, source;

  try {
    const parsedState = JSON.parse(decodeURIComponent(state));
    intent = parsedState.intent;
    repoOwner = parsedState.repoOwner;
    repoName = parsedState.repoName;
    source = parsedState.source;
  } catch (e) {
    // If state is corrupted, send them to a safe default
    return NextResponse.redirect("https://tinotenda-mhedziso.pages.dev", 302);
  }
  const ALLOWED_SOURCES = [
    "https://the-atlas-six.vercel.app",
    "https://tinotenda-mhedziso.pages.dev",
    "http://localhost:3000",
  ];

  const isValidSource = ALLOWED_SOURCES.some((allowed) =>
    source.startsWith(allowed),
  );

  // 3. Determine the safe redirect base
  const safeSource = isValidSource
    ? source
    : "https://tinotenda-mhedziso.pages.dev";
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    },
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return NextResponse.json(
      { error: tokenData.error_description },
      { status: 400 },
    );
  }

  const accessToken = tokenData.access_token;

  let apiUrl: string;
  let method = "PUT";
  let successMessage: string;
  let failureMessage: string;

  if (intent === "star") {
    if (!repoOwner || !repoName) {
      return NextResponse.json(
        { error: "Missing repoOwner or repoName" },
        { status: 400 },
      );
    }

    apiUrl = `https://api.github.com/user/starred/${repoOwner}/${repoName}`;
    successMessage = `Successfully starred ${repoOwner}/${repoName}!`;
    failureMessage = `Failed to star ${repoOwner}/${repoName}`;
  } else if (intent === "follow") {
    const githubUsername = "Passion-Over-Pain";
    apiUrl = `https://api.github.com/user/following/${githubUsername}`;
    successMessage = `Now following ${githubUsername}!`;
    failureMessage = `Failed to follow ${githubUsername}`;
  } else {
    return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
  }

  // Perform API request (star or follow)
  const actionResponse = await fetch(apiUrl, {
    method,
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "YourAppName",
    },
  });

  if (!actionResponse.ok) {
    const errorText = await actionResponse.text();
    return NextResponse.json(
      { error: `${failureMessage}: ${errorText}` },
      { status: actionResponse.status },
    );
  }

  if (intent === "star") {
    return NextResponse.redirect(`${safeSource}/#star`, 302);
  } else if (intent === "follow") {
    return NextResponse.redirect(`${safeSource}/#follow`, 302);
  }

  return NextResponse.redirect(safeSource, 302);
}
