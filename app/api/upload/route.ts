import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const data = await pdf(buffer);
        return NextResponse.json({ text: data.text });
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { error: "Failed to parse PDF" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Only PDF resumes are accepted" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
