import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Sử dụng TikTok API hoặc third-party service để download video
    // Ví dụ: sử dụng tikwm.com API (miễn phí)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok video info');
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data?.play) {
      return NextResponse.json({ error: 'Invalid TikTok URL or video not available' }, { status: 400 });
    }

    // Lấy direct video URL (watermark-free nếu có)
    const videoUrl = data.data.hdplay || data.data.play;
    const videoTitle = data.data.title || 'TikTok Video';
    const videoCover = data.data.cover || '';

    // Download video và convert sang base64
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      base64: base64Video,
      mimeType: 'video/mp4',
      title: videoTitle,
      cover: videoCover,
      size: videoBuffer.byteLength
    });

  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    return NextResponse.json(
      { error: 'Failed to download TikTok video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
