import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Admin register request body:', body);
    
    // Temporarily disable SSL verification for localhost
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Try different endpoints for admin user creation
    const endpoints = [
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ADMIN_REGISTER}`,
      `${API_CONFIG.BASE_URL}/Auth/admin/register`
    ];
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
          },
          body: JSON.stringify(body),
        });
        
        if (response.ok) {
          console.log('Success with endpoint:', endpoint);
          break;
        } else {
          console.log(`Endpoint ${endpoint} returned ${response.status}`);
          lastError = `Endpoint ${endpoint} returned ${response.status}`;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error);
        lastError = error;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`All endpoints failed. Last error: ${lastError}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Backend returned non-JSON response:', text);
      throw new Error(`Backend returned ${response.status}: ${text.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'User creation failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
