import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, userResume } = body as {
      jobDescription?: string;
      userResume?: string;
    };

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!userResume || !userResume.trim()) {
      return NextResponse.json(
        { error: "Your resume is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert career coach and resume writer. Analyze this job posting and the user's resume to create a powerful, personalized application that will get them an interview.

Job Posting:
${jobDescription}

User's Resume:
${userResume}

Please provide your response in exactly this format:

COVER LETTER:
[Write a compelling 2-3 paragraph cover letter that shows genuine enthusiasm for this specific role, connects their unique background to the job requirements, demonstrates understanding of the company's needs, uses natural conversational language, and ends with a strong call to action. Make it feel authentic and human, not AI-generated. Start with "Dear Hiring Manager" and end with a professional closing like "Sincerely" or "Best regards".]

TAILORED RESUME:
[Create a complete, professional resume with the following structure:

NAME
[Full name in large, bold font]

CONTACT INFORMATION
[Email, phone, location, LinkedIn if available]

PROFESSIONAL SUMMARY
[2-3 sentences highlighting key qualifications and career objectives for this specific role]

PROFESSIONAL EXPERIENCE
[Company Name, Location] | [Job Title] | [Dates]
• [Quantified achievement with action verbs]
• [Quantified achievement with action verbs]
• [Quantified achievement with action verbs]

[Company Name, Location] | [Job Title] | [Dates]
• [Quantified achievement with action verbs]
• [Quantified achievement with action verbs]
• [Quantified achievement with action verbs]

TECHNICAL SKILLS
[Relevant technical skills organized by category]

EDUCATION
[Degree] | [Institution] | [Graduation Year]

CERTIFICATIONS
[Relevant certifications with dates]

Use bullet points, clear section headers, and professional formatting. Focus on quantifiable achievements and skills relevant to the job posting. Make it ready to use immediately.]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a master career strategist who creates applications that consistently get interviews. You understand what hiring managers want to see and how to present candidates in the most compelling way. Always respond with the exact format requested and create professional, well-structured documents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "";

    console.log("Raw AI response:", response);

    let coverLetter = "";
    let resumeSnippet = "";

    const coverLetterMatch = response.match(
      /COVER LETTER:\s*([\s\S]*?)(?=TAILORED RESUME:|$)/i
    );
    const resumeMatch = response.match(/TAILORED RESUME:\s*([\s\S]*?)$/i);

    if (coverLetterMatch) {
      coverLetter = coverLetterMatch[1].trim();
    }

    if (resumeMatch) {
      resumeSnippet = resumeMatch[1].trim();
    }

    if (!coverLetter) {
      const lines = response.split("\n");
      let inCoverLetter = false;
      let coverLetterLines = [];
      let foundResume = false;

      for (const line of lines) {
        const lowerLine = line.toLowerCase();

        if (
          lowerLine.includes("cover letter") ||
          lowerLine.includes("dear hiring") ||
          lowerLine.includes("dear sir") ||
          lowerLine.includes("dear madam")
        ) {
          inCoverLetter = true;
        }

        if (
          inCoverLetter &&
          (lowerLine.includes("resume") ||
            lowerLine.includes("experience") ||
            lowerLine.includes("skills") ||
            lowerLine.includes("education"))
        ) {
          foundResume = true;
          break;
        }

        if (inCoverLetter && !foundResume) {
          coverLetterLines.push(line);
        }
      }

      if (coverLetterLines.length > 0) {
        coverLetter = coverLetterLines.join("\n").trim();
      }
    }

    if (!resumeSnippet) {
      const lines = response.split("\n");
      let inResume = false;
      let resumeLines = [];

      for (const line of lines) {
        const lowerLine = line.toLowerCase();

        if (
          lowerLine.includes("resume") ||
          lowerLine.includes("experience") ||
          lowerLine.includes("skills") ||
          lowerLine.includes("education") ||
          lowerLine.includes("summary") ||
          lowerLine.includes("objective")
        ) {
          inResume = true;
        }

        if (inResume) {
          resumeLines.push(line);
        }
      }

      if (resumeLines.length > 0) {
        resumeSnippet = resumeLines.join("\n").trim();
      }
    }

    console.log("Parsed cover letter:", coverLetter);
    console.log("Parsed resume:", resumeSnippet);

    if (!coverLetter && !resumeSnippet) {
      coverLetter = response;
      resumeSnippet = "Complete tailored resume for this position.";
    }

    const result = {
      coverLetter,
      resumeSnippet,
    };

    console.log("Final result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating application:", error);
    return NextResponse.json(
      { error: "Failed to generate application" },
      { status: 500 }
    );
  }
}
