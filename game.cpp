#include <iostream>
#include <cstdlib>
#include <ctime>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

using namespace std;

// Computer generates a random choice
extern "C"
{
    EXPORT int getComputerChoiceCpp()
    {
        static bool seeded = false;

        if (!seeded)
        {
            srand((unsigned int)time(0));
            seeded = true;
        }

        return rand() % 3 + 1;
    }

    // Winner checking logic
    // 0 = Draw
    // 1 = Player 1 wins
    // 2 = Player 2 wins

    EXPORT int checkWinnerCpp(int pi, int ci)
    {
        if (pi < 1 || pi > 3 || ci < 1 || ci > 3)
        {
            return -1;
        }

        if (pi == ci)
        {
            return 0;
        }

        else if (
            (pi == 1 && ci == 3) ||
            (pi == 2 && ci == 1) ||
            (pi == 3 && ci == 2)
        )
        {
            return 1;
        }

        else
        {
            return 2;
        }
    }
}


// Original C++ Console Game
#ifndef __EMSCRIPTEN__

int main()
{
    int pi, ci;
    int p = 0, c = 0;
    char ch;

    do
    {
        cout << "\n===== ROCK PAPER SCISSORS =====";

        cout << "\n1. Rock";
        cout << "\n2. Paper";
        cout << "\n3. Scissors";

        cout << "\n\nEnter Your Choice: ";
        cin >> pi;

        if (pi < 1 || pi > 3)
        {
            cout << "\nInvalid Choice!";
        }
        else
        {
            ci = getComputerChoiceCpp();

            cout << "\nComputer Choice: ";

            if (ci == 1)
                cout << "Rock";
            else if (ci == 2)
                cout << "Paper";
            else
                cout << "Scissors";

            int result = checkWinnerCpp(pi, ci);

            if (result == 0)
            {
                cout << "\n\nMatch Draw!";
            }
            else if (result == 1)
            {
                cout << "\n\nYou Win!";
                p++;
            }
            else
            {
                cout << "\n\nComputer Wins!";
                c++;
            }

            cout << "\n\nYour Score: " << p;
            cout << "\nComputer Score: " << c;
        }

        cout << "\n\nPlay Again? (y/n): ";
        cin >> ch;

    } while (ch == 'y' || ch == 'Y');

    cout << "\n\n===== FINAL SCORE =====";

    cout << "\nYour Score: " << p;
    cout << "\nComputer Score: " << c;

    if (p > c)
        cout << "\n\nYou are the Winner!";
    else if (c > p)
        cout << "\n\nComputer is the Winner!";
    else
        cout << "\n\nMatch Draw!";

    return 0;
}

#endif