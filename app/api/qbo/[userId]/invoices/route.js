import dbConnect from '@/lib/dbConnect';
import { getConnectionOrThrow, ensureFreshTokens, makeQboClient } from '@/lib/qbo-client';

export async function GET(request, { params }) {
    try {
        const { userId } = params;

        await dbConnect();
        const baseConn = await getConnectionOrThrow(userId);
        const freshConn = await ensureFreshTokens(baseConn);
        const qbo = makeQboClient(freshConn);

        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start') || firstDayLastMonth.toISOString().split('T')[0];
        const end = searchParams.get('end') || lastDayLastMonth.toISOString().split('T')[0];

        return new Promise((resolve) => {
            qbo.findInvoices({ limit: 10 }, (err, invoices) => {
                if (err) {
                    console.error('❌ Error fetching invoices:', err);
                    resolve(Response.json({ error: err }, { status: 500 }));
                } else {
                    const sorted = invoices.QueryResponse.Invoice?.sort((a, b) =>
                        new Date(b.MetaData.CreateTime) - new Date(a.MetaData.CreateTime)
                    );
                    resolve(Response.json(sorted));
                }
            });
        });

    } catch (e) {
        console.error('Invoices error', e);
        return Response.json({ message: e.message || 'No QuickBooks connection' }, { status: 400 });
    }
}
