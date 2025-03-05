import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");

	if (!code) {
		return NextResponse.json(
			{ error: "Authorization code not provided" },
			{ status: 400 }
		);
	}

	// Step 1: Get Access Token from GitHub
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
		}
	);

	const tokenData = await tokenResponse.json();

	if (tokenData.error) {
		return NextResponse.json(
			{ error: tokenData.error_description },
			{ status: 400 }
		);
	}

	const accessToken = tokenData.access_token;

	// Step 2: Star the Repository
	const repoOwner = "Passion-Over-Pain"; // Change this to your GitHub username/org
	const repoName = "Portfolio"; // Change this to the repo you want to star

	const starResponse = await fetch(
		`https://api.github.com/user/starred/${repoOwner}/${repoName}`,
		{
			method: "PUT",
			headers: {
				Authorization: `token ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		}
	);

	if (!starResponse.ok) {
		const errorText = await starResponse.text();
		return NextResponse.json(
			{ error: `Failed to star repo: ${errorText}` },
			{ status: starResponse.status }
		);
	}

	return NextResponse.json({
		message: "Repository starred successfully!",
		access_token: accessToken,
	});
}
