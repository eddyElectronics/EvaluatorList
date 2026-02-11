import { NextRequest, NextResponse } from 'next/server';

const SEND_MESSAGE_URL = 'https://api.airportthai.co.th/V1/AOTStaff/SendMessage/';
const API_KEY = 'LmBuBI2P4IrjEMLHWRrcrgh1TAQ4AwCpoNHQKLIh';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Send message request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(SEND_MESSAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    console.log('SendMessage response status:', response.status);
    
    const responseText = await response.text();
    console.log('SendMessage response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { success: response.ok, message: responseText || 'Unknown response' };
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: `Failed to send message: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
