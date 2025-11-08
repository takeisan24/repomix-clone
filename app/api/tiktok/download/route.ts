import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch TikTok info from third-party service');

    const data = await response.json();
    if (data.code !== 0 || !data.data?.play) {
      return NextResponse.json({ error: data.msg || 'Invalid TikTok URL or video not available' }, { status: 400 });
    }

    const videoUrl = data.data.hdplay || data.data.play;
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) throw new Error('Could not download the video file from the direct URL.');
    
    const videoBuffer = await videoResponse.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      base64: base64Video,
      mimeType: videoResponse.headers.get('content-type') || 'video/mp4',
      title: data.data.title || 'TikTok Video',
      cover: data.data.cover || '',
      size: videoBuffer.byteLength
    });

  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    return NextResponse.json({ error: 'Failed to download TikTok video', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}