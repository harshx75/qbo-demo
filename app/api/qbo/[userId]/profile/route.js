import dbConnect from '@/lib/dbConnect';
import { getConnectionOrThrow, ensureFreshTokens, makeQboClient } from '@/lib/qbo-client';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const baseConn = await getConnectionOrThrow(params.userId);
    const freshConn = await ensureFreshTokens(baseConn);
    const qbo = makeQboClient(freshConn);

    return new Promise((resolve, reject) => {
      qbo.getCompanyInfo(freshConn.realmId, (err, company) => {
        if (err) {
          console.error('❌ Error fetching company info:', err);
          reject(Response.json({ message: 'Error fetching company info' }, { status: 500 }));
        }
        resolve(Response.json(company));
      });
    });
  } catch (e) {
    console.error('Profile error', e);
    return Response.json({ message: e.message || 'No QuickBooks connection' }, { status: 400 });
  }
}