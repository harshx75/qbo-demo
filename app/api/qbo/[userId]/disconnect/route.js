import dbConnect from '@/lib/dbConnect';
import { QboConnection } from '@/lib/models';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await QboConnection.deleteMany({ userId: params.userId });
    return Response.json({ message: 'Disconnected from QuickBooks' });
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Failed to disconnect' }, { status: 500 });
  }
}