import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part} from "@google/generative-ai";
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
 * Gửi một prompt (đơn giản hoặc đa phương thức) để tạo nội dung.
 * @param modelName Tên model để sử dụng.
 * @param promptParts Một chuỗi đơn giản hoặc một mảng các "Part" (text, fileData).
 * @returns Phản hồi dạng text từ AI.
 */
export async function generateContent(modelName: string, promptParts: (string | Part)[] | string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName});
        const result = await model.generateContent(promptParts);
        return result.response.text();
    } catch (error) {
        console.error(`Gemini Service Error (generateContent with ${modelName}):`, error);
        throw new Error(`Failed to generate content from ${modelName}.`);
    }
}


// --- CÁC HÀM DỊCH VỤ CHO HÌNH ẢNH (Image Generation) ---

/**
 * Tạo hình ảnh từ prompt bằng model Gemini có khả năng tạo ảnh.
 * @param prompt Mô tả hình ảnh.
 * @param n Số lượng ảnh cần tạo (Lưu ý: model có thể không trả về chính xác số lượng yêu cầu).
 * @param size Kích thước (hiện tại không được hỗ trợ trực tiếp, sẽ được xác định bởi model).
 * @param aspectRatio Tỷ lệ khung hình (hiện tại không được hỗ trợ trực tiếp, sẽ được xác định bởi model).
 * @returns Mảng các đối tượng chứa dữ liệu base64 và mimeType của ảnh.
 */

/**
 * Tạo hình ảnh từ prompt bằng model Gemini có khả năng tạo ảnh.
 * @param prompt Mô tả hình ảnh.
 * @param n Số lượng ảnh cần tạo (Lưu ý: model có thể không trả về chính xác số lượng yêu cầu).
 * @param size Kích thước ảnh (tham số này mang tính gợi ý cho model).
 * @param aspectRatio Tỷ lệ khung hình (tham số này mang tính gợi ý cho model).
 * @returns Mảng các đối tượng chứa dữ liệu base64 và mimeType của ảnh.
 */
export async function generateImage(prompt: string, n: number, size: string, aspectRatio: string): Promise<{base64: string; mimeType: string;}[]> {
    try {
        // BƯỚC 1: Đổi sang model có khả năng tạo ảnh mạnh mẽ nhất
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        // BƯỚC 2: Tạo một prompt đa phần rõ ràng, ra lệnh cho AI
        // Phần đầu là chỉ dẫn, phần sau là nội dung của người dùng.
        const promptParts = [
            `Generate ${n} high-quality, photorealistic image(s) based on the following description. Adhere to the requested aspect ratio of ${aspectRatio}. The style should be modern and clean. Do not include any text in the image unless explicitly asked. The user's description is: `,
            prompt
        ];

        const result = await imageModel.generateContent(promptParts);
        const response = result.response;
        
        // BƯỚC 3: Xử lý phản hồi một cách an toàn hơn
        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            // Trường hợp này hiếm, nhưng cần kiểm tra
            throw new Error("API không trả về bất kỳ ứng viên (candidate) nào.");
        }

        // Lấy các "parts" từ ứng viên đầu tiên
        const contentParts = candidates[0].content?.parts;
        if (!contentParts) {
             // Nếu model từ chối hoặc chỉ trả về text, nó sẽ không có 'parts' chứa 'inlineData'
            const refusalText = response.text(); // Lấy lý do từ chối (nếu có)
            console.error("Phản hồi của Gemini không chứa 'parts':", refusalText);
            throw new Error(`Model đã từ chối tạo ảnh hoặc có lỗi xảy ra. Phản hồi: "${refusalText}"`);
        }

        // Lọc ra chính xác các part là hình ảnh
        const imageParts = contentParts.filter(part => part.inlineData && part.inlineData.data && part.inlineData.mimeType.startsWith('image/'));

        // Dòng 105 sẽ được kiểm tra ở đây
        if (!imageParts || imageParts.length === 0) {
            const refusalText = response.text();
            console.error("Đã nhận được phản hồi, nhưng không tìm thấy dữ liệu hình ảnh. Phản hồi text từ AI:", refusalText);
            throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi. Model có thể đã từ chối yêu cầu vì chính sách an toàn hoặc prompt không rõ ràng.");
        }

        return imageParts.map(part => {
            // TypeScript biết chắc chắn part.inlineData tồn tại ở đây
            return {
                base64: part.inlineData!.data,
                mimeType: part.inlineData!.mimeType,
            };
        });

    } catch (error) {
        console.error("Lỗi trong Gemini Service (generateImage):", error);
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định khi tạo ảnh.";
        throw new Error(`Tạo ảnh thất bại: ${errorMessage}`);
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