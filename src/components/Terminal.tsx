import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SnakeGame } from './games/SnakeGame';

interface Command {
  text: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error';
  component?: React.ReactNode;
}

export const Terminal: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>([
    {
      text: `Initializing terminal...`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `[OK] Terminal v1.0.0 loaded`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `[OK] Portfolio modules loaded`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `
Welcome to Abhijith V's Interactive Terminal Portfolio
=====================================================
R&D Engineer @appmaker.xyz | 7+ years experience

Type "help" for available commands
Type "games" to see available games`,
      timestamp: new Date(),
      type: 'output'
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add command to history
    setCommands(prev => [...prev, { text: `$ ${cmd}`, timestamp: new Date(), type: 'input' }]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Process command
    switch (trimmedCmd) {
      case 'help':
        setCommands(prev => [...prev, {
          text: `Available commands:
  help          - Show this help message
  about         - Learn about me
  resume        - View my resume
  skills        - List my technical skills
  projects      - View my projects
  contact       - Get my contact information
  certifications - View certifications and courses
  achievements  - View awards and recognitions
  games         - List available games
  snake         - Play Snake game
  theme         - Show terminal theme info
  ls/dir        - List directory contents
  pwd           - Print working directory
  clear         - Clear the terminal
  whoami        - Display current user
  date          - Show current date and time`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'about':
        setCommands(prev => [...prev, {
          text: `Hi! I'm Abhijith V, R&D Engineer at appmaker.xyz

I'm a passionate software developer with 7+ years of experience in building 
innovative solutions. I specialize in full-stack development, cloud technologies, 
and creating efficient, scalable applications.

Career Objective: To improve my technical skills through eminent work culture 
and thereby contributing to the industry.

I hold a copyright for an encryption algorithm in India (Diary No: 4977/2019-CO/SW).`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'resume':
        setCommands(prev => [...prev, {
          text: `Loading resume...
[==============================] 100%

ABHIJITH V - RESUME
===================

WORK EXPERIENCE:
----------------
• R&D Engineer | appmaker.xyz (7+ years - Ongoing)
  - Product: Convert E-Commerce sites to Native Apps without code
  - Tech: Node.js, React JS, TypeScript, Next.js, Docker, Kubernetes
  
• Full Stack Developer | Gitzberry Technologies (3+ years)
  - Order apps for restaurants and supermarkets
  - Tech: PHP, Node.js, React Native, React JS, Docker, Python

• Full Stack Developer Intern | Monlash Solutions (1 month)
  - Customer complaint and employee tracker
  - Tech: Spring Boot, React Native

EDUCATION:
----------
• Bachelor of Computer Science
  - Awarded Best Outgoing Student (GEM of CSE)
  - EXCEL Chairman & CSI Student Convener

ACHIEVEMENTS:
-------------
• Copyright holder for Encryption Algorithm (Diary No: 4977/2019-CO/SW)
• Best Project Award (Gvardios)
• Published Research Paper in Kerala Technological Congress (KETCON)
• 2nd Prize - Hack4People 2.0 & HackIn50 hours
• 4th Prize - OneHack 1.0

Type "skills" for technical skills or "projects" for project details.`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'skills':
        setCommands(prev => [...prev, {
          text: `Technical Skills:
=================

PROGRAMMING LANGUAGES:
• NodeJS           • BunJS            • Python
• TypeScript       • React            • React Native
• C/C++           • PHP              • GraphQL
• Next.js         • Keystone.js      • Flask

DATABASE TECHNOLOGIES:
• MySQL           • MongoDB          • Firebase
• PostgreSQL      • BigQuery         • ClickHouse
• Supabase

DEVOPS & CLOUD:
• Docker          • Kubernetes
• AWS             • GCP              • Azure
• Hetzner         • Vultr            • Digital Ocean

INTERESTED AREAS:
• Software Development
• Data Analytics
• DevOps`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'projects':
        setCommands(prev => [...prev, {
          text: `Featured Projects:
==================

OPEN SOURCE:
------------
1. Directory Serve ⭐ 430+
   - CLI tool to share files to phone/send/receive files on a network
   - Built with Node.js
   - GitHub: github.com/cube-root/directory-serve

2. MyExpense ⭐ 10+
   - Manage personal bills using Google Sheets as backend
   - Built with Next.js and TypeScript
   - GitHub: github.com/cube-root/expenser
   - Live: www.myexpense.app

3. Figma Sync
   - Figma plugin to sync with GitHub
   - Enables version control for design files
   - GitHub: github.com/figmasync/figmasync

4. ProxyHub
   - Proxy management tool for multiple configurations
   - Built with Node.js
   - GitHub: github.com/cube-root/proxyhub

OTHER MAJOR PROJECTS:
--------------------
• Gvardios - Securing data of industry/organization (Best Project Award)
• Generic Delivery App - Multi-store delivery solution
• MedNet - Medical Encyclopedia with ML disease prediction
• Smart Container (Envase) - IoT grocery container with mobile app
• Lopels - Shopping app with loyalty point system
• Delivia - Food ordering website (www.delivia.in)
• Nakshatra 2018 - Techno-cultural fest automation (www.nakshatra2k18.com)
• Ascend 2018 - Technical fest automation (www.ascend18.com)
• ERP Mobile - Mobile version for Adempire ERP System
• Just In Time - College bus/train timing app
• FinTip - Fingerprint transaction system
• Hospital Management System
• Sakshm - E-Learning platform with product sales`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'contact':
        setCommands(prev => [...prev, {
          text: `Contact Information:
====================

LinkedIn: linkedin.com/in/abhijithv
GitHub: github.com/abhisawesome
Instagram: instagram.com/abhisawzm
Twitter: twitter.com/abhisawzm
Portfolio: abhisawesome.github.io

Feel free to reach out for collaborations or opportunities!`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'clear':
        setCommands([]);
        break;

      case 'whoami':
        setCommands(prev => [...prev, {
          text: 'visitor@abhi-portfolio',
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'date':
        setCommands(prev => [...prev, {
          text: new Date().toString(),
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'theme':
        setCommands(prev => [...prev, {
          text: `Terminal theme: Matrix Green
Colors: Background #0a0a0a, Foreground #00ff00
Font: Fira Code

This terminal uses a classic green-on-black theme inspired by retro terminals.`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'ls':
      case 'dir':
        setCommands(prev => [...prev, {
          text: `
README.md    resume.pdf    projects/    skills.json
about.txt    contact.md    portfolio/   certificates/`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'pwd':
        setCommands(prev => [...prev, {
          text: '/home/visitor/abhi-portfolio',
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'certifications':
      case 'certs':
        setCommands(prev => [...prev, {
          text: `Certifications & Courses:
=========================

• Database Management System - QEEE Program
• Python Programming - NPTEL
• Arduino Programming
• Introduction to Python for Data Science - DataCamp
• Python for Data Science - IBM
• Machine Learning - IBM

Type "achievements" to see awards and recognitions.`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'achievements':
        setCommands(prev => [...prev, {
          text: `Achievements & Awards:
======================

🏆 COPYRIGHT HOLDER
   • Encryption Algorithm in India
   • Diary No: 4977/2019-CO/SW
   • ROC No: SW-12543/2019

🎖️ ACADEMIC AWARDS
   • Best Outgoing Student (GEM of CSE)
   • Best Project Award (Gvardios)

📝 PUBLICATIONS
   • Research Paper - Kerala Technological Congress (KETCON)

💻 HACKATHON WINS
   • 2nd Prize - Hack4People 2.0
   • 2nd Prize - HackIn50 hours
   • 4th Prize - OneHack 1.0
   • Participated - MITS Hackathon (2x)
   • Participated - India Innovation Series

👥 LEADERSHIP
   • EXCEL Chairman (Student Association)
   • CSI Student Convener
   • Website Head - Nakshatra 2018`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'games':
        setCommands(prev => [...prev, {
          text: `Available Games:
================

1. SNAKE - Classic snake game
   Command: snake
   Controls: WASD or Arrow Keys
   
More games coming soon!

Type the game name to start playing.`,
          timestamp: new Date(),
          type: 'output'
        }]);
        break;

      case 'snake':
        if (isGameActive) {
          setCommands(prev => [...prev, {
            text: 'A game is already running. Please exit the current game first.',
            timestamp: new Date(),
            type: 'error'
          }]);
        } else {
          setIsGameActive(true);
          const handleGameOver = (score: number) => {
            setIsGameActive(false);
            setCommands(prev => [...prev, {
              text: `Game Over! Your score: ${score}`,
              timestamp: new Date(),
              type: 'output'
            }]);
          };
          const handleExit = () => {
            setIsGameActive(false);
            setCommands(prev => [...prev, {
              text: 'Game exited.',
              timestamp: new Date(),
              type: 'output'
            }]);
          };
          setCommands(prev => [...prev, {
            text: '',
            timestamp: new Date(),
            type: 'output',
            component: (
              <SnakeGame 
                width={60} 
                height={20} 
                onGameOver={handleGameOver}
                onExit={handleExit}
              />
            )
          }]);
        }
        break;

      case '':
        // Empty command, do nothing
        break;

      default:
        setCommands(prev => [...prev, {
          text: `Command not found: ${cmd}. Type "help" for available commands.`,
          timestamp: new Date(),
          type: 'error'
        }]);
    }

    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [commands]);

  // Focus input on terminal click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="w-full h-screen bg-background p-4 overflow-hidden cursor-text"
      onClick={handleTerminalClick}
    >
      <div className="max-w-4xl mx-auto h-full">
        <Card className="h-full flex flex-col border-2 shadow-2xl">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-2">
                {commands.map((cmd, index) => (
                  <div key={index}>
                    {cmd.component ? (
                      <div className="my-2">{cmd.component}</div>
                    ) : (
                      <div className={cn(
                        "font-mono text-sm leading-relaxed",
                        cmd.type === 'input' && "text-primary",
                        cmd.type === 'output' && "text-foreground whitespace-pre-wrap",
                        cmd.type === 'error' && "text-destructive"
                      )}>
                        {cmd.text}
                      </div>
                    )}
                  </div>
                ))}
                
                {!isGameActive && (
                  <div className="flex items-center font-mono text-sm">
                    <span className="text-primary mr-2">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                      autoFocus
                    />
                    <span className="animate-terminal-blink text-primary">_</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};