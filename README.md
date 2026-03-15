# npm.bet

A beautiful, interactive npm package download statistics visualizer built with Next.js 16, React 19, and Recharts.

## Features

- **Multi-package comparison** - Compare download trends across multiple npm packages simultaneously
- **Flexible time ranges** - View data from the last week to all-time statistics
- **Smart grouping** - Aggregate data by day, week, or month for better insights
- **Interactive charts** - Built with Recharts for smooth, responsive visualizations
- **Screenshot export** - Download charts as high-resolution PNG images
- **SVG embed** - Generate embeddable SVG charts with code snippets (Markdown, HTML, or direct URL) for your documentation
- **Dark mode support** - Seamless theme switching with next-themes
- **Real-time search** - Search and add npm packages with autocomplete
- **Responsive design** - Works perfectly on desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Charts**: [Recharts](https://recharts.org)
- **Date Handling**: [date-fns](https://date-fns.org) with timezone support
- **Data Fetching**: [SWR](https://swr.vercel.app)
- **State Management**: [nuqs](https://nuqs.47ng.com) for URL state
- **Code Quality**: [Ultracite](https://github.com/biomejs/ultracite) (Biome preset)
- **UI Components**: Custom components built on [Radix UI](https://www.radix-ui.com)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/vercel/npm.bet.git
cd npm.bet

# Install dependencies
pnpm install

# Run the development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the production application
- `pnpm check` - Check for code quality issues
- `pnpm fix` - Automatically fix code quality issues

## Usage

1. **Search for packages**: Use the search bar to find npm packages by name
2. **Select time range**: Choose from predefined ranges (last week, month, year, 2 years, 5 years, or all-time)
3. **Adjust grouping**: Switch between daily, weekly, or monthly aggregation
4. **Compare packages**: Add multiple packages to compare their download trends
5. **Export chart**: Click the camera icon to download the chart as a PNG
6. **Embed SVG**: Click the code icon to get embeddable SVG snippets for your README or website

## Project Structure

```
npm.bet/
├── actions/          # Server actions for data fetching
│   └── package/      # Package search and download data
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/           # Reusable UI components (Radix-based)
│   ├── chart.tsx     # Main chart component
│   ├── header.tsx    # Application header
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── providers/        # React context providers
```

## API Integration

This project uses the official [npm Registry API](https://github.com/npm/registry/blob/master/docs/download-counts.md) to fetch package download statistics:

- Package search: `https://registry.npmjs.com/-/v1/search`
- Download stats: `https://api.npmjs.org/downloads/range/{period}/{package}`

Data is cached for 1 hour to reduce API load and improve performance.

## Code Quality

This project uses **Ultracite**, a zero-config Biome preset for automated code formatting and linting. Key standards include:

- TypeScript strict mode with explicit types
- React 19 best practices (ref as prop, no forwardRef)
- Accessibility-first approach (ARIA attributes, semantic HTML)
- Modern JavaScript/TypeScript patterns
- No console.log or debugger statements in production

Run `npx ultracite doctor` to verify your setup.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npx ultracite fix` to ensure code quality
5. Commit your changes with a descriptive message
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- npm Registry API for providing download statistics
- Vercel for hosting and deployment
- The React and Next.js teams for amazing frameworks
- Radix UI for accessible component primitives

---

Built with ❤️ by [Vercel](https://github.com/vercel)
