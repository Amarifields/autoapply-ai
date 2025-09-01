# AutoApply AI

AI-powered automation tool that generates tailored job applications from any posting. Transform your job search with intelligent, personalized cover letters and resume snippets generated in seconds.

![AutoApply AI Preview](public/preview.png)

## ✨ Features

- **Dark UI Design** - Modern, glassy interface with Cursor + OpenAI aesthetic
- **One-Click Application** - Generate professional applications instantly
- **Responsive Design** - Optimized for desktop and mobile devices
- **Powered by OpenAI** - Advanced AI for contextually relevant content
- **Smooth Animations** - Framer Motion powered transitions
- **Professional Output** - Ready-to-use cover letters and resume snippets

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom glass effects
- **AI Integration**: OpenAI GPT-4 API
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **Deployment**: Vercel ready

## 📦 Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/autoapply-ai.git
cd autoapply-ai
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` environment variable in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application is built with Next.js and can be deployed to any platform that supports Node.js applications.

## 🎨 Design System

- **Background**: `#0f1117` - Deep dark background
- **Surface**: `#1c1f26` - Glassy card backgrounds
- **Accent**: `#3b82f6` - Blue accent with glow effects
- **Typography**: Inter font family throughout
- **Effects**: Frosted glass, subtle gradients, glowing borders

## 📱 Usage

1. **Landing Page** - Paste any job posting into the input field
2. **Generate** - Click "Generate My Application" to process with AI
3. **Results** - View your tailored cover letter and resume snippet
4. **Copy & Use** - Copy the generated content for your applications

## 🔧 API Endpoints

### POST `/api/generate`

Generates tailored job application materials.

**Request Body:**

```json
{
  "jobDescription": "Your job posting text here"
}
```

**Response:**

```json
{
  "coverLetter": "Generated cover letter content...",
  "resumeSnippet": "Generated resume snippet content..."
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and OpenAI
- Inspired by modern AI-powered productivity tools
- Designed for job seekers and career professionals

---

**AutoApply AI** - Transform your job search with AI-powered automation.
