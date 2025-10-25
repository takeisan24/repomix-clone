// app/api/generate-from-source/route.ts
import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/services/geminiService'; // Import service

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, modelPreference } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const modelToUse = modelPreference || "gemini-2.5-pro";
        // Gọi service để tạo nội dung
        const aiResponse = await generateContent(modelToUse, prompt);

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error("[API_GENERATE_SOURCE_ERROR]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}