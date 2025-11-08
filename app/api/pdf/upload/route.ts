import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ API Key của Gemini chưa được cấu hình!');
}

// Khởi tạo SDK với API key
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(request: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: 'API key chưa được cấu hình trên server.' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Không có file nào được cung cấp' }, { status: 400 });
        }
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'File phải là định dạng PDF' }, { status: 400 });
        }
        const MAX_SIZE = 20 * 1024 * 1024; // 20MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: `Kích thước file phải nhỏ hơn ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 });
        }

        console.log(`Đang upload file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)...`);

        // --- ĐÂY LÀ PHẦN THAY ĐỔI QUAN TRỌNG ---
        // Chúng ta sẽ không gọi trực tiếp genAI.uploadFile
        // Thay vào đó, chúng ta sẽ dùng REST API nhưng một cách an toàn hơn với fetch
        // SDK @google/generative-ai dường như tập trung vào việc tạo nội dung hơn là quản lý file.
        // Cách gọi REST API này là cách chính thức được Google hướng dẫn.

        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;

        // 1. Gửi request đầu tiên chỉ chứa metadata để lấy upload URI
        const metadataHeaders = new Headers();
        metadataHeaders.append("X-Goog-Upload-Protocol", "resumable");
        metadataHeaders.append("X-Goog-Upload-Command", "start");
        metadataHeaders.append("X-Goog-Upload-Header-Content-Type", file.type);
        metadataHeaders.append("Content-Type", "application/json");

        const metadataBody = JSON.stringify({
            file: {
                display_name: file.name,
            }
        });

        const initResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: metadataHeaders,
            body: metadataBody,
        });

        if (!initResponse.ok) {
            const errorText = await initResponse.text();
            throw new Error(`Khởi tạo upload thất bại: ${initResponse.status} ${errorText}`);
        }

        const uploadUri = initResponse.headers.get("X-Goog-Upload-URL");
        if (!uploadUri) {
            throw new Error("Không nhận được upload URL từ API.");
        }

        // 2. Gửi request thứ hai chứa dữ liệu file đến upload URI
        const uploadHeaders = new Headers();
        uploadHeaders.append("X-Goog-Upload-Protocol", "resumable");
        uploadHeaders.append("X-Goog-Upload-Command", "upload, finalize");
        uploadHeaders.append("Content-Type", file.type);
        uploadHeaders.append("X-Goog-Upload-Offset", "0");
        
        const fileBytes = await file.arrayBuffer();

        const uploadResponse = await fetch(uploadUri, {
            method: 'POST',
            headers: uploadHeaders,
            body: fileBytes,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload file thất bại: ${uploadResponse.status} ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        const uploadedFile = uploadResult.file;
        
        console.log(`✅ Upload thành công: ${uploadedFile.displayName} với URI: ${uploadedFile.uri}`);

        return NextResponse.json({
            success: true,
            fileUri: uploadedFile.uri,
            fileName: uploadedFile.displayName,
            mimeType: uploadedFile.mimeType,
        });

    } catch (error) {
        console.error('Lỗi khi upload file PDF lên Gemini:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        return NextResponse.json(
            { 
                error: 'Upload file PDF thất bại', 
                details: errorMessage 
            },
            { status: 500 }
        );
    }
}