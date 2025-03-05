import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { repoOwner, repoName, accessToken } = await req.json();

  if (!repoOwner || !repoName || !accessToken) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.github.com/user/starred/${repoOwner}/${repoName}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${accessToken}`,
        "Content-Length": "0",
      },
    });

    if (response.status === 204) {
      return NextResponse.json({ message: "Repository liked successfully!" });
    } else {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to like repository" }, { status: 500 });
  }
}
