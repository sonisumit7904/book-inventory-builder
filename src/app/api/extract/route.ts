import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Initialize Google AI with API key from environment variables
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get the uploaded image file from form data
    const data = await request.formData();
    const file: File | null = data.get("image") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No image file found" }, { status: 400 });
    }

    // Convert the image file to buffer and then to base64
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a detailed prompt for the AI model
    const prompt = `
      Analyze the following image of a book cover.
      Extract the following details:
      - Title: The main title of the book
      - Author(s): The author name(s)
      - Grade Level: Any grade level information if visible (e.g., "Grades 3-5", "Ages 8-12")
      - Subject: The subject or genre (e.g., Fantasy, Science Fiction, History, Education, Fiction, Non-Fiction, Mystery, Romance, Biography, etc.)
      - Series: If this book is part of a series, mention the series name

      Return the response ONLY as a valid JSON object with the following keys:
      "title", "author", "gradeLevel", "subject", "series".
      If a piece of information is not found or not applicable, return an empty string "" for that key.
      Do not include any other text, explanations, or markdown formatting in your response.
      The response must be valid JSON that can be parsed directly.
    `;

    // Prepare the image data for the AI model
    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type,
      },
    };

    // Send the request to Google Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown code block formatting
    text = text.replace(/```json\n/g, "").replace(/```/g, "").trim();

    // Parse the JSON response
    const bookDetails = JSON.parse(text);

    // Validate that all required fields are present
    const requiredFields = ['title', 'author', 'gradeLevel', 'subject', 'series'];
    const validatedDetails: Record<string, string> = {};
    
    for (const field of requiredFields) {
      validatedDetails[field] = bookDetails[field] || "";
    }

    return NextResponse.json(validatedDetails);

  } catch (error) {
    console.error("Error in extract API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
