import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken, repo } = await req.json();

  if (!accessToken || !repo) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // GitHub API request to star the repo
  const response = await fetch(`https://api.github.com/user/starred/${repo}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (response.status === 204) {
    return NextResponse.json({ success: "Repo starred!" });
  } else {
    return NextResponse.json({ error: "Failed to star repo" }, { status: 400 });
  }
}
