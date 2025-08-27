import { makeOAuthClient } from '@/lib/qbo-client';
import dbConnect from '@/lib/dbConnect';
import { QboConnection } from '@/lib/models';

export async function GET(request) {
  await dbConnect();

  try {
    const oauthClient = makeOAuthClient();
    const { searchParams } = new URL(request.url);
    const authResponse = await oauthClient.createToken(request.url);

    const tokenJson = authResponse.getJson();
    const realmId = tokenJson.realmId || authResponse.token.realmId;

    const state = searchParams.get('state') ? JSON.parse(searchParams.get('state')) : {};
    const userId = state.userId;

    if (!userId) return Response.json({ message: 'Missing userId in state' }, { status: 400 });

    const expiresAt = new Date(Date.now() + (tokenJson.expires_in || 3600) * 1000);

    const conn = await QboConnection.findOneAndUpdate(
      { userId, realmId },
      {
        userId,
        realmId,
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        tokenType: tokenJson.token_type || 'bearer',
        expiresAt,
        environment: process.env.ENVIRONMENT,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return Response.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?userId=${userId}&connected=true`);
  } catch (err) {
    console.error('❌ Error in callback:', err);
    return Response.json({ message: 'Auth failed' }, { status: 500 });
  }
}