import { VirtualFileSystem } from './virtualFileSystem';

export function createDefaultFileSystem(): VirtualFileSystem {
  const fs = new VirtualFileSystem();

  // Create directory structure
  fs.mkdirp('/home/visitor/projects');
  fs.mkdirp('/home/visitor/certificates');

  // about.txt
  fs.writeFile('/home/visitor/about.txt', `Hi! I'm Abhijith V, R&D Engineer at appmaker.xyz

I'm a passionate software developer with 7+ years of experience in building
innovative solutions. I specialize in full-stack development, cloud technologies,
and creating efficient, scalable applications.

Career Objective: To improve my technical skills through eminent work culture
and thereby contributing to the industry.

I hold a copyright for an encryption algorithm in India (Diary No: 4977/2019-CO/SW).`);

  // resume.txt
  fs.writeFile('/home/visitor/resume.txt', `ABHIJITH V - RESUME
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
• 4th Prize - OneHack 1.0`);

  // skills.json
  fs.writeFile('/home/visitor/skills.json', JSON.stringify({
    programming_languages: [
      'NodeJS', 'BunJS', 'Python', 'TypeScript', 'React', 'React Native',
      'C/C++', 'PHP', 'GraphQL', 'Next.js', 'Keystone.js', 'Flask'
    ],
    databases: [
      'MySQL', 'MongoDB', 'Firebase', 'PostgreSQL', 'BigQuery', 'ClickHouse', 'Supabase'
    ],
    devops_and_cloud: [
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Hetzner', 'Vultr', 'Digital Ocean'
    ],
    interested_areas: [
      'Software Development', 'Data Analytics', 'DevOps'
    ]
  }, null, 2));

  // contact.md
  fs.writeFile('/home/visitor/contact.md', `# Contact Information

- **LinkedIn**: linkedin.com/in/abhijithv
- **GitHub**: github.com/abhisawesome
- **Instagram**: instagram.com/abhisawzm
- **Twitter**: twitter.com/abhisawzm
- **Portfolio**: abhisawesome.github.io

Feel free to reach out for collaborations or opportunities!`);

  // achievements.txt
  fs.writeFile('/home/visitor/achievements.txt', `ACHIEVEMENTS & AWARDS
======================

COPYRIGHT HOLDER
  • Encryption Algorithm in India
  • Diary No: 4977/2019-CO/SW
  • ROC No: SW-12543/2019

ACADEMIC AWARDS
  • Best Outgoing Student (GEM of CSE)
  • Best Project Award (Gvardios)

PUBLICATIONS
  • Research Paper - Kerala Technological Congress (KETCON)

HACKATHON WINS
  • 2nd Prize - Hack4People 2.0
  • 2nd Prize - HackIn50 hours
  • 4th Prize - OneHack 1.0
  • Participated - MITS Hackathon (2x)
  • Participated - India Innovation Series

LEADERSHIP
  • EXCEL Chairman (Student Association)
  • CSI Student Convener
  • Website Head - Nakshatra 2018`);

  // certifications.txt
  fs.writeFile('/home/visitor/certifications.txt', `CERTIFICATIONS & COURSES
=========================

• Database Management System - QEEE Program
• Python Programming - NPTEL
• Arduino Programming
• Introduction to Python for Data Science - DataCamp
• Python for Data Science - IBM
• Machine Learning - IBM`);

  // README.md
  fs.writeFile('/home/visitor/README.md', `# Welcome to Abhijith V's Terminal Portfolio

Type 'help' to see available commands.
Type 'ls' to explore the filesystem.

Try: cat about.txt, cat resume.txt, cd projects/`);

  // Projects
  fs.writeFile('/home/visitor/projects/directory-serve.txt', `Directory Serve
================
Stars: 430+
Tech: Node.js
Description: CLI tool to share files to phone/send/receive files on a network
GitHub: github.com/cube-root/directory-serve`);

  fs.writeFile('/home/visitor/projects/myexpense.txt', `MyExpense
=========
Stars: 10+
Tech: Next.js, TypeScript
Description: Manage personal bills using Google Sheets as backend
GitHub: github.com/cube-root/expenser
Live: www.myexpense.app`);

  fs.writeFile('/home/visitor/projects/figma-sync.txt', `FigmaSync
=========
Tech: Figma Plugin
Description: Figma plugin to sync with GitHub, enables version control for design files
GitHub: github.com/figmasync/figmasync`);

  fs.writeFile('/home/visitor/projects/proxyhub.txt', `ProxyHub
========
Tech: Node.js
Description: Proxy management tool for multiple configurations
GitHub: github.com/cube-root/proxyhub
Live: www.proxyhub.app`);

  fs.writeFile('/home/visitor/projects/gvardios.txt', `Gvardios
========
Award: Best Project Award
Description: Securing data of industry/organization`);

  fs.writeFile('/home/visitor/projects/mednet.txt', `MedNet
======
Description: Medical Encyclopedia with ML disease prediction`);

  fs.writeFile('/home/visitor/projects/smart-container.txt', `Smart Container (Envase)
========================
Description: IoT grocery container with mobile app`);

  fs.writeFile('/home/visitor/projects/delivia.txt', `Delivia
=======
Description: Food ordering website
Live: www.delivia.in`);

  fs.writeFile('/home/visitor/projects/terminal-portfolio.txt', `Terminal Portfolio
==================
Description: Interactive terminal-style portfolio website
Tech: React, TypeScript, Vite, Tailwind CSS
Live: abhisawesome.github.io/abhisawesome/`);

  // Certificates
  fs.writeFile('/home/visitor/certificates/dbms-qeee.txt', 'Database Management System - QEEE Program');
  fs.writeFile('/home/visitor/certificates/python-nptel.txt', 'Python Programming - NPTEL');
  fs.writeFile('/home/visitor/certificates/arduino.txt', 'Arduino Programming');
  fs.writeFile('/home/visitor/certificates/python-ds-datacamp.txt', 'Introduction to Python for Data Science - DataCamp');
  fs.writeFile('/home/visitor/certificates/python-ds-ibm.txt', 'Python for Data Science - IBM');
  fs.writeFile('/home/visitor/certificates/ml-ibm.txt', 'Machine Learning - IBM');

  return fs;
}
