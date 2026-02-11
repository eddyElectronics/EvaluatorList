import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.airportthai.co.th/API2/eva';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Save data request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/EvaSaveData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    
    const responseText = await response.text();
    console.log('Backend response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If not JSON, wrap in response object
      data = { success: response.ok, message: responseText || 'Unknown response' };
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving evaluation data:', error);
    return NextResponse.json(
      { success: false, message: `Failed to save evaluation data: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
