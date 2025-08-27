import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';

export async function POST(request) {
  await dbConnect();

  try {
    const { email, name } = await request.json();
    const user = await User.create({ email, name });
    return Response.json(user);
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const users = await User.find({});
    return Response.json(users);
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}