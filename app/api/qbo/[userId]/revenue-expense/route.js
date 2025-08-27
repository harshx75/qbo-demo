import dbConnect from '@/lib/dbConnect';
import { getConnectionOrThrow, ensureFreshTokens, makeQboClient } from '@/lib/qbo-client';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const baseConn = await getConnectionOrThrow(params.userId);
    const freshConn = await ensureFreshTokens(baseConn);
    const qbo = makeQboClient(freshConn);

    // Get month parameter from query string
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    
    // Parse the selected month (YYYY-MM format)
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1); // First day of the month
    const endDate = new Date(year, monthNum, 0); // Last day of the month

    return new Promise((resolve, reject) => {
      qbo.reportProfitAndLoss(
        {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
        (err, report) => {
          if (err) {
            console.error('❌ Error fetching P&L:', err);
            reject(Response.json({ message: 'Error fetching revenue/expense' }, { status: 500 }));
          }
          
          const rows = (report.Rows && report.Rows.Row) || [];
          const data = {};
          console.log(rows)
          
          rows.forEach((row) => {
            if (row.Summary && row.Summary.ColData) {
              const name = row.Summary.ColData[0]?.value;
              const value = row.Summary.ColData[1]?.value;
              if (name) data[name] = value;
            }
          });
          
          resolve(Response.json({
            start: report.Header?.StartPeriod,
            end: report.Header?.EndPeriod,
            revenue_expense: data,
          }));
        }
      );
    });
  } catch (e) {
    console.error('Revenue expense error', e);
    return Response.json({ message: e.message || 'No QuickBooks connection' }, { status: 400 });
  }
}