import { Injectable } from '@angular/core';

export interface Skill {
  name: string;
  pct: number;
  cat: string;
  icon: string;
}

export interface Project {
  title: string;
  desc: string;
  tech: string[];
  cat: string;
  live: string;
  github: string;
  img: string;
  imgSmall?: string;
  featured: boolean;
}

export interface Service {
  icon: string;
  title: string;
  desc: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  getProfile() {
    return {
      name: 'Abdul Samad',
      title: 'Full Stack Web Developer',
      bio: 'I am a passionate web developer from Karachi with  building modern web applications.',
      bioExtended: 'I specialize in PHP, MySQL, HTML, CSS, and JavaScript with a keen eye for design and user experience.',
      email: 'syedddsamadd@gmail.com',
      phone: '03160260319',
      location: 'Baldia Town, Karachi, Pakistan',
      github: 'https://github.com/syedddsamadd-hub',
      linkedin: 'https://www.linkedin.com/in/abdul-samad-40691236a/',
      twitter: 'https://twitter.com',
      expYears: 2,
      projects: 15,
      clients: 10,
      image: 'img/abdulsamad.jpg'
    };
  }

  getSkills(): Skill[] {
    return [
      { name:'HTML5/CSS3',    pct:95,
        cat:'Frontend', icon:'fab fa-html5' },
      { name:'JavaScript',    pct:80,
        cat:'Frontend', icon:'fab fa-js-square' },
      { name:'Bootstrap 5',   pct:85,
        cat:'Frontend', icon:'fab fa-bootstrap' },
      { name:'React.js',      pct:70,
        cat:'Frontend', icon:'fab fa-react' },
      { name:'PHP 8',         pct:88,
        cat:'Backend',  icon:'fab fa-php' },
      { name:'MySQL',         pct:85,
        cat:'Backend',  icon:'fas fa-database' },
      { name:'ASP.NET CORE (MVC)',       pct:65,
        cat:'Backend',  icon:'fab fa-node-js' },
      { name:'Laravel',      pct:80,
        cat:'Backend',  icon:'fas fa-code' },
      { name:'Git & GitHub',  pct:90,
        cat:'Tools',    icon:'fab fa-git-alt' },
      { name:'Figma',         pct:70,
        cat:'Tools',    icon:'fab fa-figma' },
      { name:'VS Code',       pct:95,
        cat:'Tools',    icon:'fas fa-code' },
      { name:'XAMPP',         pct:92,
        cat:'Tools',    icon:'fas fa-server' },
    ];
  }

  getProjects(): Project[] {
    return [
      {
        title: 'Specor Affiliate Web App',
        desc: 'Modern portfolio with glassmorphism UI, 3D animations and complete PHP MySQL admin dashboard.',
        tech: ['PHP','MySQL','HTML','CSS','JavaScript'],
        cat: 'Web App',
        live: 'https://specora.lovestoblog.com/',
        github: '#', img: 'img/specora-960.webp',
        imgSmall: 'img/specora-480.webp', featured: true
      },
      {
        title: 'E-Commerce Jenny Store',
        desc: 'Full-featured online store with cart, payment integration and inventory management.',
        tech: ['PHP','MySQL','Bootstrap','AJAX','HTML','CSS'],
        cat: 'Web App',
        live: 'https://jenny1-store.lovestoblog.com/',
         github: '#', img: 'img/jenny-960.webp',
        imgSmall: 'img/jenny-480.webp', featured: true
      },
      {
        title: 'Doctor Appointment System',
        desc: 'Complete DAS with patient records, doctor appointments and billing dashboard.',
        tech: ['PHP','MySQL','HTML','CSS','JS'],
        cat: 'Web App',
        live: 'https://health-care1.lovestoblog.com/index.php',
         github: '#', img: 'img/medical-960.webp',
        imgSmall: 'img/medical-480.webp', featured: true
      },
      {
        title: 'Petbot',
        desc: 'Website for manufacturing recycle material that are used daily in our live like dispossible glass, jars and box with interactive Ui.',
        tech: ['HTML','CSS','JS'],
        cat: 'Front end',
        live: '',
         github: '#', img: 'img/petbot-960.webp',
        imgSmall: 'img/petbot-480.webp', featured: true
      },
            {
        title: 'Budget Basic',
        desc: 'A website for student of school,college or university to manage their money thier mony carefully not just spilled it on unnecassary things with clean and responsive Ui.',
        tech: ['HTML','CSS','Angular','TypeScript'],
        cat: 'Front end',
        live: 'https://budgetbasic-chi.vercel.app/',
         github: '#', img: 'img/budget-960.webp',
        imgSmall: 'img/budget-480.webp', featured: true
      },
    ];
  }

  getServices(): Service[] {
    return [
      {
        icon: 'fas fa-laptop-code',
        title: 'Frontend Development',
        desc: 'Pixel-perfect responsive UIs using HTML5, CSS3, JavaScript and Bootstrap.'
      },
      {
        icon: 'fas fa-server',
        title: 'Backend Development',
        desc: 'Secure PHP 8 applications with optimized MySQL database architecture.'
      },
      {
        icon: 'fas fa-layer-group',
        title: 'Full Stack Web Apps',
        desc: 'Complete end-to-end web app development from database to deployment.'
      },
      {
        icon: 'fas fa-database',
        title: 'Database Design',
        desc: 'Efficient MySQL database design, normalization and optimization.'
      },
      {
        icon: 'fas fa-tachometer-alt',
        title: 'Performance Optimization',
        desc: 'Speed audits, lazy loading and code optimization for faster websites.'
      },
      {
        icon: 'fas fa-headset',
        title: 'Website Maintenance',
        desc: 'Ongoing support, bug fixes and feature enhancements.'
      }
    ];
  }
}
