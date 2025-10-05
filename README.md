
# Hangman: AI-Powered Edition

Welcome to a modern, supercharged twist on the classic Hangman game! This isn't your average word-guessing game. It's powered by **Google's Gemini API**, which means you get a virtually infinite number of unique puzzles on any topic you can imagine.

Built with React, TypeScript, and Tailwind CSS, this application features a sleek, responsive "claymorphism" design, engaging animations, and a dynamic gameplay experience that keeps you coming back for more.


<img width="1919" height="973" alt="Screenshot 2025-10-05 025258" src="https://github.com/user-attachments/assets/b42cf645-de11-4489-a9bf-966653d42268" />


## Key Features

-   **Infinite Puzzles**: Thanks to the Gemini API, new words and hints are generated on-the-fly for endless replayability.
-   **Custom Topics**: Play with words from any topic you can think of—from "90s Bollywood Movies" to "Quantum Physics Concepts".
-   **Multiple Difficulty Levels**: Choose between Easy, Medium, and Hard modes to match your skill level.
-   **Challenging Boss Rounds**: Survive special, timed rounds with cryptic hints for a massive score bonus.
-   **Dynamic Scoring System**: Earn points for correct guesses and wins. The tougher the challenge, the bigger the reward!
-   **Strategic Hint System**: Stuck on a word? Use your earned points to purchase hints. But be warned, hints get more expensive!
-   **Seamless Gameplay**: Rounds are pre-fetched in the background, eliminating loading times between games for a smooth, uninterrupted experience.
-   **Modern & Responsive UI**: A clean, visually appealing interface that looks and works great on any device.
-   **ntelligent Topic Handling**: Includes specialized logic for certain topics (like "Bollywood") to ensure higher-quality, factually accurate puzzles.

## Tech Stack

-   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
-   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Dependencies**: Hosted via CDN (`@google/genai`, `react`, `react-dom`)

## Getting Started

To run this project, you'll need a Google Gemini API key.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Google Gemini API Key**:

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hangman-ai.git
    cd hangman-ai
    ```

2.  **Set up your environment variable:**
    This project is configured to use an API key from the environment. The method for setting this depends on your hosting provider. For local development, you can create a `.env` file in the root of the project:

    ```
    // .env
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *Note: The current setup in `index.html` does not use a build tool to inject this variable. You will need a simple server or build process that can make this environment variable available to the browser.*

### Running the Application

This is a static web application. You can serve the `index.html` file using any simple web server. A great tool for this is `serve`.

1.  **Install `serve` globally (if you haven't already):**
    ```bash
    npm install -g serve
    ```

2.  **Run the server from the project root:**
    ```bash
    serve .
    ```

3.  Open your browser and navigate to the local address provided by `serve` (e.g., `http://localhost:3000`).

## File Structure

The project is organized into logical components and services for clarity and maintainability.

```
/
├── public/
│   └── (Static assets like favicons)
├── src/
│   ├── components/
│   │   ├── BossIntroScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── HangmanFigure.tsx
│   │   ├── Keyboard.tsx
│   │   ├── Modal.tsx
│   │   ├── SetupScreen.tsx
│   │   ├── Spinner.tsx
│   │   └── WordDisplay.tsx
│   ├── services/
│   │   └── geminiService.ts   # Logic for all Gemini API calls
│   ├── App.tsx                # Main application component and state management
│   ├── index.tsx              # Entry point for React
│   └── types.ts               # TypeScript type definitions
├── .gitignore
├── index.html                 # Main HTML file
├── metadata.json
├── README.md
└── tsconfig.json
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
