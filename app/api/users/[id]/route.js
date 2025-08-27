import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const user = await User.findById(params.id);
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
    return Response.json(user);
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}