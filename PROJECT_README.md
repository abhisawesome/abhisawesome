# Terminal Portfolio

An interactive terminal-style portfolio website for Abhijith V. Built with React, TypeScript, Vite, and shadcn/ui.

🔗 Live Demo: [https://abhisawesome.github.io/abhisawesome/](https://abhisawesome.github.io/abhisawesome/)

## Features

- 🖥️ Interactive terminal interface
- ⌨️ Command-based navigation
- 🎨 ASCII art banner
- 📱 Responsive design
- 🌑 Dark terminal theme with green accents
- ⏪ Command history (use arrow keys)
- 🎯 Auto-scrolling output
- 💅 Styled with shadcn/ui components

## Available Commands

- `help` - Show available commands
- `about` - Learn about Abhijith V
- `resume` - View resume and work experience
- `skills` - List technical skills
- `projects` - View featured projects
- `contact` - Get contact information
- `certifications` - View certifications and courses
- `achievements` - View awards and recognitions
- `banner` - Display ASCII art banner
- `theme` - Show terminal theme info
- `ls/dir` - List directory contents
- `pwd` - Print working directory
- `clear` - Clear the terminal
- `whoami` - Display current user
- `date` - Show current date and time

## Development

### Prerequisites

- Node.js 22.16.0 or higher
- npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Deployment

### Automatic Deployment via GitHub Actions (Recommended)

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy your site
3. Go to Settings → Pages in your repository
4. Set Source to "GitHub Actions"
5. Your site will be available at https://abhisawesome.github.io/abhisawesome/

### Manual Deployment

You can also deploy manually using the gh-pages package:

```bash
npm run deploy
```

This will:
1. Build the project
2. Deploy the `dist` folder to the `gh-pages` branch

### Configuration

- The `base` in `vite.config.ts` is set to `/abhisawesome/` to match the repository name
- Update this if you change your repository name

## Customization

To customize this portfolio for your own use:

1. Update the personal information in `src/components/Terminal.tsx`
2. Modify the ASCII art banner
3. Update the command responses with your information
4. Change the contact details
5. Add or remove commands as needed
6. Customize the terminal theme in `src/index.css`

## Project Structure

```
terminal-portfolio/
├── src/
│   ├── components/
│   │   ├── Terminal.tsx      # Main terminal component
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment
├── public/                 # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - React component library
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## License

MIT

## Author

**Abhijith V**  
R&D Engineer @appmaker.xyz

- LinkedIn: [/in/abhijithv](https://linkedin.com/in/abhijithv)
- GitHub: [@abhisawesome](https://github.com/abhisawesome)
- Twitter: [@abhisawzm](https://twitter.com/abhisawzm)
- Instagram: [@abhisawzm](https://instagram.com/abhisawzm)