// app/api/generate-image/route.ts
import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/services/geminiService';

export async function POST(request: Request) {
    try {
        // 1. Nhận dữ liệu từ client
        const body = await request.json();
        const { prompt, n = 1, size = '1024x1024', aspectRatio = '1:1' } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 2. Gọi hàm service để thực hiện công việc nặng nhọc
        const images = await generateImage(prompt, n, size, aspectRatio);

        // 3. Trả về kết quả thành công cho client
        return NextResponse.json({ images });

    } catch (error) {
        console.error("[API_GENERATE_IMAGE_ERROR]", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: 'Failed to generate image', details: errorMessage }, { status: 500 });
    }
}