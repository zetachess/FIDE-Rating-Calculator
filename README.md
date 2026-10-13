<a id="readme-top"></a>

<div align="center">
  <h1>♟️ FIDE Rating Calculator</h1>
  <p>
    A transparent browser tool for estimating FIDE rating changes and initial ratings.
    <br />
    <a href="https://github.com/zetachess/FIDE-Rating-Calculator">Open the project</a>
    ·
    <a href="https://github.com/zetachess/FIDE-Rating-Calculator/issues">Report a problem</a>
    ·
    <a href="https://github.com/zetachess/FIDE-Rating-Calculator/issues">Request an improvement</a>
  </p>

  <p>
    <a href="https://github.com/zetachess/FIDE-Rating-Calculator/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License"></a>
    <a href="https://vite.dev/"><img src="https://img.shields.io/badge/built%20with-Vite-646cff.svg" alt="Built with Vite"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/language-TypeScript-3178c6.svg" alt="TypeScript"></a>
    <a href="https://handbook.fide.com/chapter/B022024"><img src="https://img.shields.io/badge/reference-FIDE%20regulations-111827.svg" alt="FIDE regulations reference"></a>
  </p>
</div>

![FIDE Rating Calculator preview](public/rating-calculator-preview.png)

## Table of Contents

- [About the Project](#about-the-project)
- [What It Does](#what-it-does)
- [Who It Is For](#who-it-is-for)
- [Important Scope Note](#important-scope-note)
- [Getting Started](#getting-started)
- [Calculation Model](#calculation-model)
- [Privacy](#privacy)
- [Technology](#technology)
- [Contributing](#contributing)
- [License](#license)

## About the Project

FIDE Rating Calculator is an open-source web tool for estimating rating changes for rated players and initial ratings for unrated players. It provides a visible calculation path instead of treating the result as a black box.

The interface supports English and Spanish, multiple opponents, game results, expected scores, rating progression, and a game-by-game breakdown.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## What It Does

- Calculates estimated rating changes for players who already have a FIDE rating.
- Estimates an initial rating for unrated players.
- Supports multiple opponents and individual game results.
- Shows expected scores and rating progression.
- Provides a game-by-game calculation breakdown.
- Includes the rating lookup tables used by the calculation engine.
- Provides English and Spanish interfaces.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Who It Is For

- Chess arbiters checking rating calculations.
- Players estimating the impact of tournament results.
- Tournament organizers reviewing expected changes.
- Developers and chess communities building transparent rating tools.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Important Scope Note

This is an independent estimation tool, not an official FIDE service. It does not publish official ratings, replace FIDE systems, or represent FIDE.

The calculation model is based on the [FIDE Rating Regulations](https://handbook.fide.com/chapter/B022024). Regulations and official lists can change, so formal tournament or rating decisions must use the latest official FIDE documentation and applicable federation guidance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- Node.js with pnpm available.
- A modern browser for using the calculator.

### Installation

```bash
git clone https://github.com/zetachess/FIDE-Rating-Calculator.git
cd FIDE-Rating-Calculator
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

### Quality checks

```bash
pnpm test
pnpm lint
pnpm build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Calculation Model

The calculator keeps the calculation flow visible:

```text
player rating and history
        │
        ▼
opponent ratings and game results
        │
        ▼
expected scores and rating tables
        │
        ▼
estimated change or initial rating
        │
        ▼
game-by-game explanation
```

Calculation logic and supporting tables live in:

- [`src/lib/fideRating.ts`](src/lib/fideRating.ts)
- [`src/lib/fideTables.ts`](src/lib/fideTables.ts)
- [`src/lib/fideRating.test.ts`](src/lib/fideRating.test.ts)

When changing rating logic, update or add tests and verify the relevant FIDE regulation reference.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Privacy

Calculations run in the browser. The app may store calculator state in local storage so input can be restored during a later visit. No FIDE account or login is required.

Do not enter passwords, access tokens, or unrelated private information into the calculator.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Technology

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Country Flag Icons
- Vercel Analytics

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions, calculation corrections, translation updates, accessibility improvements, and documentation changes are welcome.

1. Create a focused branch.
2. Add or update tests when changing calculation logic.
3. Keep FIDE-related claims tied to the current official regulations.
4. Run the test, lint, and build commands.
5. Open a pull request with a clear description of the change and verification steps.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Released under the MIT License. See [LICENSE](LICENSE).

<p align="right">(<a href="#readme-top">back to top</a>)</p>