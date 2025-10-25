// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/services/geminiService'; // Import service

const geminiSystemInstruction = `
    Bạn là một trợ lý viết bài cho mạng xã hội chuyên nghiệp. 
    Nhiệm vụ của bạn là giúp người dùng tạo nội dung hấp dẫn cho các nền tảng như Facebook, Twitter, Instagram, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest.
    Khi người dùng yêu cầu tạo bài đăng, hãy trả lời theo định dạng JSON sau:
    \`\`\`json
    {
      "action": "create_post",
      "platform": "Tên nền tảng (ví dụ: Facebook, Twitter)",
      "content": "Nội dung bài đăng bạn đã tạo.",
      "summary_for_chat": "Tóm tắt ngắn gọn bài đăng đã tạo để hiển thị trong khung chat (tối đa 2 câu)."
    }
    \`\`\`
    Các "Tên nền tảng" hợp lệ là: Facebook, Twitter, Instagram, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest.
    Nếu người dùng chỉ hỏi chung chung hoặc cần trợ giúp khác, hãy trả lời bằng văn bản thuần túy, thân thiện và hữu ích.
    Luôn trả lời bằng tiếng Việt.
`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { history, newMessage, modelPreference } = body;

        if (!newMessage) {
            return NextResponse.json({ error: 'New message is required' }, { status: 400 });
        }

        // Luôn chèn system instruction vào đầu cuộc trò chuyện
        const fullHistory = [
            { role: 'user', parts: [{ text: geminiSystemInstruction }] },
            { role: 'model', parts: [{ text: "Đã hiểu! Tôi sẵn sàng giúp bạn." }] },
            ...(history || [])
        ];

        const modelToUse = modelPreference || "gemini-pro";
        // Gọi service để lấy phản hồi từ Gemini
        const aiResponse = await getChatResponse(modelToUse, fullHistory, newMessage);

        // Trả phản hồi về cho client
        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error("[API_CHAT_ERROR]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}