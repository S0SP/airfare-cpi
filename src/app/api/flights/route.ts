import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = Buffer.from('sumitchourasia63@gmail.com-api-client:Lx3tjnT9LlLh4ASP3FbDvdvPwqpgpERl').toString('base64');
    const res = await fetch('https://opensky-network.org/api/states/all?lamin=6.7&lamax=35.5&lomin=68.1&lomax=97.4', {
      headers: {
        'User-Agent': 'apix-prototype/1.0',
        'Authorization': `Basic ${auth}`
      },
      next: { revalidate: 15 } // Cache for 15 seconds to avoid rate limits
    });

    if (!res.ok) {
      console.error('OpenSky API failed:', res.status, res.statusText);
      return NextResponse.json({ states: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying OpenSky API:', error);
    return NextResponse.json({ states: [] }, { status: 500 });
  }
}
