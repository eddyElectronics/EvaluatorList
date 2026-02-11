import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.airportthai.co.th/API2/eva';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/getEmployeeERP`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
