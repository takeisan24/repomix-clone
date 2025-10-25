import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const genAI_Advanced = new GoogleGenAI({ apiKey });

const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 10000,
};

const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
];

/**
 * Gửi một yêu cầu chat đến một model Gemini cụ thể.
 * @param modelName Tên model để sử dụng (ví dụ: "gemini-pro", "gemini-1.5-flash").
 * @param history Lịch sử cuộc trò chuyện.
 * @param newMessage Tin nhắn mới của người dùng.
 * @returns Phản hồi dạng text từ AI.
 */

export async function getChatResponse(modelName: string, history: any[], newMessage: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history, generationConfig, safetySettings });
        const result = await chat.sendMessage(newMessage);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Service Error (getChatResponse):", error);
        throw new Error("Failed to get response from Gemini.");
    }
}

/**
 * Gửi một prompt đơn lẻ để tạo nội dung với một model Gemini cụ thể.
 * @param modelName Tên model để sử dụng.
 * @param prompt Câu lệnh chi tiết cho AI.
 * @returns Phản hồi dạng text từ AI.
 */
export async function generateContent(modelName: string, prompt: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName});
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error(`Gemini Service Error (generateContent with ${modelName}):`, error);
        throw new Error(`Failed to generate content from ${modelName}.`);
    }
}


// --- CÁC HÀM DỊCH VỤ CHO HÌNH ẢNH (Image Generation) ---

/**
 * Tạo hình ảnh từ prompt bằng Imagen.
 * @param prompt Mô tả hình ảnh.
 * @param n Số lượng ảnh cần tạo.
 * @param size Kích thước ảnh ('1024x1024', '1792x1024', etc.).
 * @returns Mảng các đối tượng chứa dữ liệu base64 của ảnh.
 */
export async function generateImage(prompt: string, n: number, size: string, aspectRatio: string): Promise<{base64: string; mimeType: string;}[]> {
    try {
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-image" });
        const result = await imageModel.generateContent([prompt]);

        const candidates = result.response.candidates || [];

        if (candidates.length === 0) {
            throw new Error("No images generated.");
        }

        const imageParts = candidates[0].content?.parts.filter(part => part.inlineData) || [];

        if (imageParts.length === 0) {
            throw new Error("No image data found in response.");
        }
        return imageParts.map(part => ({
            base64: part.inlineData!.data,
            mimeType: part.inlineData!.mimeType,
        }));
    } catch (error) {
        console.error("Gemini Service Error (generateImage):", error);
        throw new Error("Failed to generate image from Gemini.");
    }
}

// --- CÁC HÀM DỊCH VỤ CHO VIDEO (Video Generation) ---

/**
 * Tạo video từ prompt bằng Veo.
 * @param config Cấu hình cho việc tạo video (prompt, aspectRatio, etc.).
 * @returns Đối tượng file video đã được xử lý.
 */
export async function generateVideos(config: { prompt: string; negativePrompt?: string; aspectRatio: string; resolution: string; }) {
    try {
        let operation = await genAI_Advanced.models.generateVideos({
            model: "veo-3.0-fast-generate-001", // Tên model cho Veo
            source: { prompt: config.prompt },
            config: {
                numberOfVideos: 1,
                aspectRatio: config.aspectRatio,
                resolution: config.resolution,
                negativePrompt: config.negativePrompt,
            }
        });

        // Polling để chờ kết quả
        let pollCount = 0;
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            pollCount++;
            operation = await genAI_Advanced.operations.getVideosOperation({ operation });
            if (pollCount >= 60) throw new Error("Video generation timed out after 10 minutes.");
        }

        if (!operation.response?.generatedVideos?.[0]?.video) {
            throw new Error("API did not return a valid video file.");
        }

        const videoFile = operation.response.generatedVideos[0].video;
        const videoUri = (videoFile as any).uri || (videoFile as any).fileUri;
        if (!videoUri) throw new Error("Could not find video URI in the response.");
        
        const response = await fetch(videoUri);
        if (!response.ok) throw new Error(`Failed to download video file: ${response.statusText}`);

        const videoBlob = await response.blob();
        return videoBlob;

    } catch (error) {
        console.error("Gemini Service Error (generateVideoFromApi):", error);
        throw new Error("Failed to generate video from Gemini.");
    }
 }