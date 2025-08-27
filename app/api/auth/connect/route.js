import { makeOAuthClient } from '@/lib/qbo-client';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';
import OAuthClient from 'intuit-oauth';


export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) return Response.json({ message: 'Missing userId query param' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

    const oauthClient = makeOAuthClient();
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: JSON.stringify({ userId }),
    });
    
    return Response.redirect(authUri);
  } catch (e) {
    console.error('/connect error', e);
    return Response.json({ message: 'Failed to start OAuth' }, { status: 500 });
  }
}