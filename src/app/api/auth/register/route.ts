import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/bcrypt';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name, email, password, year } = await req.json();
  if (!name || !email || !password || !year) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (![1,2,3,4].includes(Number(year))) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }
  const hashed = await hashPassword(password);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    password: hashed,
    year: Number(year),
    verificationToken,
    isVerified: false,
  });
  await sendVerificationEmail(email, verificationToken);
  return NextResponse.json({ message: 'Registration successful. Please verify your email.' });
}
