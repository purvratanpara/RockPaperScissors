# RockPaperScissors
✊✋✌️ RPS Arena - Rock Paper Scissors

A neon sci-fi Rock Paper Scissors web game. The game logic is written in C++ and compiled to WebAssembly, while the interface is built with HTML, CSS and JavaScript.

✨ Features
🎮 Start screen with animated logo, neon grid and "Get Ready" intro
🤖 Computer Mode - the computer's move and the winner check both come from C++
👥 2 Player Mode - Player 1's choice stays hidden until the reveal
⏱️ 3-2-1-GO countdown before every round
🃏 3D card flip reveal of both choices
🔥 Win streak counter with best streak
⭐ XP and levels (Win +30, Draw +10, Lose +5, 100 XP per level)
📜 Last 8 rounds history (W / L / D)
🎉 Confetti, screen flash and sound effects (Web Audio, with on/off toggle)
❓ "How to Play" popup
📱 Responsive design for mobile and desktop
📁 Project Structure
├── index.html     # Page structure (start screen + game screen)
├── style.css      # Neon theme, 3D cards and animations
├── script.js      # Game flow, countdown, XP, streak, sound, confetti
├── game.cpp       # C++ game logic (source)
├── game.js        # Emscripten loader (generated)
└── game.wasm      # Compiled WebAssembly (generated)
🚀 How to Run

WebAssembly must be loaded over HTTP, so opening index.html by double-click will not work. Use a local server:

bash
# Python
python -m http.server 8000

# or Node.js
npx serve

Then open http://localhost:8000 in your browser.

🛠️ Rebuild the C++ (optional)

Install the Emscripten SDK, then run:

bash
emcc game.cpp -O2 -o game.js \
  -sMODULARIZE=1 -sEXPORT_NAME=createGameModule \
  -sEXPORTED_FUNCTIONS=_getComputerChoiceCpp,_checkWinnerCpp \
  -sENVIRONMENT=web

This regenerates game.js and game.wasm.

Play in the terminal

game.cpp also contains the original console version:

bash
g++ game.cpp -o game
./game
🌐 Deploy on GitHub Pages
Push all files to a GitHub repository.
Go to Settings → Pages.
Under Source, choose the main branch and the / (root) folder, then save.
Your game will be live at https://<your-username>.github.io/<repo-name>/.
🎯 Game Rules
Move	Beats
✊ Rock	✌️ Scissors
✋ Paper	✊ Rock
✌️ Scissors	✋ Paper
🧰 Built With

C++ · WebAssembly (Emscripten) · HTML5 · CSS3 · JavaScript

📄 License

Free to use for learning and personal projects.
