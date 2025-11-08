// app/api/generate-video/route.ts
import { NextResponse } from 'next/server';
import { generateVideos } from '@/lib/services/geminiService';

export async function POST(request: Request) {
    try {
        // 1. Nhận dữ liệu từ client
        const body = await request.json();
        const { prompt, negativePrompt, aspectRatio, resolution } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 2. Gọi hàm service để tạo và tải video về server
        const videoBlob = await generateVideos({
            prompt,
            negativePrompt,
            aspectRatio,
            resolution,
        });

        // 3. Trả file video về cho client
        // Chúng ta gửi lại dữ liệu Blob trực tiếp.
        // Client sẽ nhận được một đối tượng Response và có thể đọc nó dưới dạng blob().
        return new NextResponse(videoBlob, {
            status: 200,
            headers: {
                'Content-Type': 'video/mp4',
            },
        });

    } catch (error) {
        console.error("[API_GENERATE_VIDEO_ERROR]", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: 'Failed to generate video', details: errorMessage }, { status: 500 });
    }
}