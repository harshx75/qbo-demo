import OAuthClient from 'intuit-oauth';
import QuickBooks from 'node-quickbooks';

export function makeOAuthClient() {
  return new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: process.env.ENVIRONMENT,
    redirectUri: process.env.REDIRECT_URI,
  });
}

export async function getConnectionOrThrow(userId) {
  const { QboConnection } = await import('./models');
  const conn = await QboConnection.findOne({ userId }).sort({ updatedAt: -1 });
  if (!conn) throw new Error('No QuickBooks connection for this user');
  return conn;
}

export async function ensureFreshTokens(conn) {
  const now = new Date();
  const skewMs = 60 * 1000;
  if (conn.expiresAt && conn.expiresAt.getTime() - skewMs > now.getTime()) {
    return conn;
  }

  const oauthClient = makeOAuthClient();
  oauthClient.setToken({
    token_type: conn.tokenType || 'bearer',
    access_token: conn.accessToken,
    refresh_token: conn.refreshToken,
    expires_in: 0,
    x_refresh_token_expires_in: 0,
  });

  const refreshed = await oauthClient.refreshUsingToken(conn.refreshToken);
  const token = refreshed.getJson();

  conn.accessToken = token.access_token;
  conn.refreshToken = token.refresh_token || conn.refreshToken;
  conn.tokenType = token.token_type || 'bearer';
  const expiresAt = new Date(Date.now() + (token.expires_in || 3600) * 1000);
  conn.expiresAt = expiresAt;
  await conn.save();

  return conn;
}

export function makeQboClient(conn) {
  return new QuickBooks(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    conn.accessToken,
    false,
    conn.realmId,
    process.env.ENVIRONMENT === 'sandbox',
    true,
    null,
    '2.0',
    conn.refreshToken
  );
}