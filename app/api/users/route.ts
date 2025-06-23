import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching users.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Import database dependencies
    const { createUser } = await import('../../../src/db/userQueries');
    const { hashPassword } = await import('../../../src/utils/passwordUtils');

    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await createUser({
      email,
      password_hash: hashedPassword,
      name,
      role_name: role || 'customer'
    } as any);

    return NextResponse.json(newUser, { status: 201 });

  } catch (error: any) {
    console.error('[API] Error creating user:', error);
    if (error.code === '23505') { // unique_violation
      return NextResponse.json(
        { error: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Error creating user.' },
      { status: 500 }
    );
  }
} 