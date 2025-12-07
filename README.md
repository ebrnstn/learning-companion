# AI Learning Companion

Your personalized AI tutor that creates, tracks, and adapts custom 7-day learning plans for any topic.

![Learning Companion](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2667&auto=format&fit=crop)

## Features

- **Personalized Planning**: Generates comprehensive 7-day learning schedules based on your topic, time commitment, and experience level.
- **Interactive Chat Companion**: Built-in AI tutor powered by Google Gemini to answer questions and explain concepts in real-time.
- **Adaptive Revision**: Not happy with the plan? Request changes (e.g., "Make it harder", "Focus on videos") and watch it adapt instantly.
- **Progress Tracking**: Track your completion of daily modules and steps.
- **Smart UI**: Dark-mode focused, responsive design with multi-expandable modules for easy review.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Icons**: Lucide React
- **Markdown**: React Markdown

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd learning-companion
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## Usage

1.  **Onboarding**: Enter your desired topic (e.g., "Python", "Knitting"), time availability, and current level.
2.  **Review**: Check the generated plan. Expand days to see details.
3.  **Revise**: If needed, ask for adjustments.
4.  **Start Learning**: Click "Looks good!" to enter the dashboard and start tracking your progress.
