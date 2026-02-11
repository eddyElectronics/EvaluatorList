import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.airportthai.co.th/API2/eva';

export async function POST() {
  try {
    const response = await fetch(`${API_BASE_URL}/getAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
