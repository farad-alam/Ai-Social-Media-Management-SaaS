# Social Media Management SaaS 🚀

A powerful, AI-driven Social Media Management SaaS built with **Next.js 15**, **Gemini AI**, and **Supabase**. Effortlessly create, schedule, and automate your social media content across multiple platforms.

---

## ✨ Features

- **🤖 AI-Powered Content Generation**: Leverage Google Gemini AI to generate engaging captions and content ideas.
- **📅 Smart Post Scheduling**: Visualize and manage your content strategy with an interactive calendar view.
- **📱 Multi-Platform Integration**: Connect and manage Instagram and TikTok accounts seamlessly.
- **🎥 Media Processing**: Built-in FFmpeg support for video handling and processing.
- **🔐 Secure Authentication**: Integrated with Clerk for robust and secure user management.
- **☁️ Scalable Storage & DB**: Powered by Supabase for lightning-fast database queries and media storage.
- **🎭 Modern UI/UX**: Crafted with Tailwind CSS and Radix UI primitives for a premium feel.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/)
- **Database**: [Prisma](https://www.prisma.io/) with [PostgreSQL (Supabase)](https://supabase.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Media Handling**: [@ffmpeg/ffmpeg](https://ffmpeg.org/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)
- Supabase account
- Clerk account
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd "Social Media Content Mangement"
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```


4. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

- `app/` - Next.js App Router (pages and API routes)
- `components/` - Reusable UI components
- `lib/` - Shared utility functions and third-party clients (Prisma, Supabase, Instagram)
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `scripts/` - Maintenance and utility scripts

---

## 📄 License

This project is licensed under the MIT License.
