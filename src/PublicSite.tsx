import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpLeft,
  BrainCircuit,
  Check,
  Code2,
  ExternalLink,
  FolderGit2,
  Github,
  Globe2,
  Layers3,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Printer,
  Settings2,
  Smartphone,
  Sparkles,
  Terminal,
  UserRound,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { freshDefaultCV } from './cv';
import type { CVData, Project, SkillCategory } from './cv';
import { WebsiteGenerator } from './WebsiteGenerator';
import { SmartStudio } from './SmartStudio';

const skillIcons: Record<SkillCategory['icon'], LucideIcon> = {
  web: Globe2,
  apps: Smartphone,
  ai: BrainCircuit,
  automation: Workflow,
};

const navItems = [
  { href: '#generator', label: 'أنشئ موقعك' },
  { href: '#about', label: 'من نحن' },
  { href: '#skills', label: 'التخصصات' },
  { href: '#projects', label: 'المشاريع' },
  { href: '#technologies', label: 'التقنيات' },
  { href: '#contact', label: 'تواصل' },
];

function safeExternalUrl(value?: string): string {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function SectionHeading({ number, eyebrow, title, description }: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading reveal">
      <div className="section-kicker">
        <span>{number}</span>
        <span className="kicker-line" />
        <span>{eyebrow}</span>
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const liveUrl = safeExternalUrl(project.link);
  const githubUrl = safeExternalUrl(project.github);
  const visibleFeatures = project.features.filter(Boolean).slice(0, 4);
  const extraFeatures = project.features.filter(Boolean).slice(4);

  return (
    <article className="project-card reveal">
      <div className="project-topline">
        <span className="project-number" dir="ltr">{String(index + 1).padStart(2, '0')}</span>
        {project.status && <span className="project-status">{project.status}</span>}
      </div>
      <div className="project-icon"><FolderGit2 size={23} /></div>
      <h3 dir="auto">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      {project.developer && <div className="project-developer"><UserRound size={14} /><span dir="auto">{project.developer}</span></div>}

      {project.technologies.length > 0 && (
        <div className="project-tech" dir="ltr">
          {project.technologies.filter(Boolean).map((tech) => <span key={tech}>{tech}</span>)}
        </div>
      )}

      {visibleFeatures.length > 0 && (
        <ul className="project-features">
          {visibleFeatures.map((feature) => (
            <li key={feature}><Check size={15} /> <span>{feature}</span></li>
          ))}
        </ul>
      )}

      {extraFeatures.length > 0 && (
        <details className="project-more">
          <summary>عرض {extraFeatures.length} تفاصيل إضافية <ArrowLeft size={14} /></summary>
          <ul className="project-features">
            {extraFeatures.map((feature) => (
              <li key={feature}><Check size={15} /> <span>{feature}</span></li>
            ))}
          </ul>
        </details>
      )}

      {(liveUrl || githubUrl) && (
        <div className="project-links">
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer">
              عرض المشروع <ExternalLink size={16} />
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" aria-label={`${project.title} على GitHub`}>
              GitHub <Github size={16} />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function PublicSite() {
  const [cv] = useState<CVData>(() => freshDefaultCV());
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = `${cv.profile.name} | ${cv.profile.roles[0] || 'مطور برمجيات'}`;
  }, [cv.profile.name, cv.profile.roles]);

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 24);
      setShowTop(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen);
    return () => document.body.classList.remove('menu-is-open');
  }, [menuOpen]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [cv]);

  const stats = useMemo(() => [
    { value: cv.projects.length, label: 'مشاريع ونماذج أولية' },
    { value: cv.skills.length, label: 'مجالات تخصص' },
    { value: cv.profile.employeeCount, label: 'موظف وخبير' },
  ], [cv.projects.length, cv.skills.length, cv.profile.employeeCount]);

  const githubUrl = safeExternalUrl(cv.profile.github);
  const githubHandle = githubUrl ? new URL(githubUrl).pathname.split('/').filter(Boolean)[0] : '';
  const photoUrl = safeExternalUrl(cv.profile.photoUrl);
  const whatsappNumber = cv.profile.whatsapp.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  const words = cv.profile.headline.trim().split(/\s+/);
  const highlightedWords = words.splice(-2).join(' ');
  const regularWords = words.join(' ');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: cv.profile.name,
    founder: { '@type': 'Person', name: cv.profile.owner, jobTitle: 'Founder & CEO' },
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: Number.parseInt(cv.profile.employeeCount, 10) || 0 },
    email: `mailto:${cv.profile.email}`,
    telephone: cv.profile.phone,
    address: { '@type': 'PostalAddress', addressCountry: 'EG', addressLocality: cv.profile.location },
    sameAs: githubUrl ? [githubUrl] : [],
    knowsAbout: cv.technologies,
  };

  return (
    <div className="site-shell">
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
      <a className="skip-link" href="#main-content">تخطَّ إلى المحتوى</a>

      <header className={`site-header ${headerScrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)} aria-label="العودة إلى البداية">
            <span className="brand-mark"><Code2 size={23} /></span>
            <span className="brand-copy">
              <strong>{cv.profile.name}</strong>
              <small dir="ltr">DIGITAL SOLUTIONS</small>
            </span>
          </a>

          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <a className="mobile-nav-contact" href={`mailto:${cv.profile.email}`}>راسلني الآن</a>
          </nav>

          <div className="header-actions">
            <button className="icon-button print-trigger" type="button" onClick={() => window.print()} aria-label="طباعة ملف تعريف الشركة" title="طباعة ملف الشركة">
              <Printer size={19} />
            </button>
            <a className="header-cta" href={`mailto:${cv.profile.email}`}>لنتحدث <ArrowUpLeft size={17} /></a>
            <button
              className="icon-button menu-trigger"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="home">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <div className="availability"><span /> {cv.profile.specialty}</div>
              <p className="hero-intro">مرحبًا بك في {cv.profile.name}</p>
              <h1>
                {regularWords && <span>{regularWords} </span>}
                <span className="text-gradient">{highlightedWords}</span>
              </h1>
              <p className="hero-description">{cv.profile.summary[0]}</p>
              <div className="role-list">
                {cv.profile.roles.filter(Boolean).map((role) => <span key={role} dir="auto">{role}</span>)}
              </div>
              <div className="hero-actions">
                <a className="button button-primary" href="#generator">أنشئ موقعك الآن <ArrowLeft size={19} /></a>
                {whatsappUrl && (
                  <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle size={19} /> تواصل عبر واتساب
                  </a>
                )}
              </div>
              <div className="hero-contact-line">
                <span><MapPin size={16} /> {cv.profile.location}</span>
                <a href={`mailto:${cv.profile.email}`} dir="ltr"><Mail size={16} /> {cv.profile.email}</a>
              </div>
            </div>

            <div className="hero-visual reveal">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <span className="floating-tech tech-python" dir="ltr">Python</span>
              <span className="floating-tech tech-react" dir="ltr">React</span>
              <span className="floating-tech tech-ai" dir="ltr">AI</span>
              <div className="code-window">
                <div className="window-bar" dir="ltr">
                  <div className="window-dots"><span /><span /><span /></div>
                  <span className="window-title">company.ts</span>
                  <Code2 size={17} />
                </div>
                {photoUrl && <img className="developer-photo" src={photoUrl} alt={`صورة ${cv.profile.name}`} />}
                <div className="code-content" dir="ltr">
                  <div><span className="code-muted">01</span> <span className="code-purple">const</span> <span className="code-blue">company</span> = {'{'}</div>
                  <div><span className="code-muted">02</span> &nbsp;&nbsp;name: <span className="code-green">'{cv.profile.name}'</span>,</div>
                  <div><span className="code-muted">03</span> &nbsp;&nbsp;basedIn: <span className="code-green">'{cv.profile.location}'</span>,</div>
                  <div><span className="code-muted">04</span> &nbsp;&nbsp;focus: [</div>
                  <div><span className="code-muted">05</span> &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">'Web Development'</span>,</div>
                  <div><span className="code-muted">06</span> &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">'AI & Automation'</span>,</div>
                  <div><span className="code-muted">07</span> &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">'Business Systems'</span></div>
                  <div><span className="code-muted">08</span> &nbsp;&nbsp;],</div>
                  <div><span className="code-muted">09</span> &nbsp;&nbsp;team: <span className="code-green">'{cv.profile.employeeCount}'</span></div>
                  <div><span className="code-muted">10</span> {'}'};</div>
                </div>
                <div className="code-footer">
                  <span><span className="live-dot" /> جاهزون لتحويل الفكرة إلى منتج</span>
                  <Terminal size={18} />
                </div>
              </div>
              <div className="visual-caption">
                <Zap size={17} />
                <span>حلول عملية. كود قابل للتطوير. تجربة أبسط.</span>
              </div>
            </div>
          </div>

          <div className="container hero-stats reveal">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong dir="ltr">{String(stat.value).padStart(2, '0')}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
            <a className="scroll-cue" href="#generator" aria-label="انتقل إلى مولد المواقع">
              <span>اكتشف المزيد</span>
              <ArrowLeft size={18} />
            </a>
          </div>
        </section>

        <div className="tech-marquee" aria-label="التقنيات المستخدمة">
          <div className="marquee-track" dir="ltr">
            {[...cv.technologies, ...cv.technologies].map((tech, index) => (
              <span key={`${tech}-${index}`} aria-hidden={index >= cv.technologies.length}>{tech}<i /></span>
            ))}
          </div>
        </div>

        <WebsiteGenerator whatsappNumber={whatsappNumber} />
        <SmartStudio whatsappNumber={whatsappNumber} />

        <section className="section about-section" id="about">
          <div className="container">
            <SectionHeading
              number="02"
              eyebrow="من نحن"
              title="نبني البرمجيات حول المشكلة، لا حول التعقيد."
              description="من الفكرة الأولى إلى منتج عملي، نركز على ما يصنع قيمة حقيقية للمستخدم وصاحب العمل."
            />
            <div className="about-grid">
              <div className="about-copy reveal">
                {cv.profile.summary.filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
                <div className="principles">
                  <span><Check size={16} /> سهولة الاستخدام</span>
                  <span><Check size={16} /> تصميم احترافي</span>
                  <span><Check size={16} /> تقليل التكاليف</span>
                </div>
                <div className="leader-card">
                  <span className="leader-icon"><UserRound size={22} /></span>
                  <div>
                    <small>مالك الشركة والرئيس التنفيذي</small>
                    <strong dir="auto">المهندس {cv.profile.owner}</strong>
                    <span>قيادة فريق {cv.profile.name}</span>
                  </div>
                </div>
                <button className="text-button" type="button" onClick={() => window.print()}>
                  <Printer size={18} /> طباعة أو حفظ ملف الشركة PDF
                </button>
              </div>

              <aside className="environment-card reveal">
                <div className="card-heading">
                  <span className="card-icon"><Terminal size={21} /></span>
                  <div><small>OUR WORK CULTURE</small><h3>فريق العمل وخبراتنا</h3></div>
                </div>
                <ul>
                  {cv.workEnvironment.filter(Boolean).map((item) => (
                    <li key={item}><span className="list-dot" />{item}</li>
                  ))}
                </ul>
                <div className="environment-footer" dir="ltr">
                  <span><Globe2 size={16} /> Web Development</span>
                  <span><BrainCircuit size={16} /> AI Solutions</span>
                  <span><Workflow size={16} /> Automation</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section skills-section" id="skills">
          <div className="container">
            <SectionHeading
              number="03"
              eyebrow="المهارات والتخصصات"
              title="خبرات متعددة، وهدف واحد: حل يعمل."
              description="نجمع بين تطوير الويب والأنظمة والذكاء الاصطناعي والأتمتة لبناء حلول تناسب طبيعة كل مشروع."
            />
            <div className="skills-grid">
              {cv.skills.map((skill, index) => {
                const Icon = skillIcons[skill.icon] ?? Layers3;
                return (
                  <article className="skill-card reveal" key={skill.id ?? `skill-${index}`}>
                    <div className="skill-card-top">
                      <span className="skill-icon"><Icon size={25} /></span>
                      <span className="skill-number" dir="ltr">0{index + 1}</span>
                    </div>
                    <h3>{skill.title}</h3>
                    <ul>
                      {skill.items.filter(Boolean).map((item) => <li key={item}><Check size={15} />{item}</li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section projects-section" id="projects">
          <div className="container">
            <SectionHeading
              number="04"
              eyebrow="المشاريع والأعمال"
              title="نماذج تتحول فيها الأفكار إلى تجربة حقيقية."
              description="مجموعة من المشاريع والنماذج الأولية في الويب والأنظمة والذكاء الاصطناعي والأتمتة."
            />
            <div className="projects-grid">
              {cv.projects.map((project, index) => <ProjectCard key={project.id ?? `project-${index}`} project={project} index={index} />)}
            </div>
            {githubUrl && (
              <div className="projects-footer reveal">
                <p>يمكنك متابعة الأكواد والمشروعات المفتوحة على GitHub.</p>
                <a className="button button-secondary" href={githubUrl} target="_blank" rel="noreferrer">
                  <Github size={19} /> زيارة حساب GitHub <ArrowUpLeft size={17} />
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="section technologies-section" id="technologies">
          <div className="container">
            <SectionHeading
              number="05"
              eyebrow="التقنيات والأدوات"
              title="الأدوات التي نستخدمها لبناء الحلول."
            />
            <div className="technology-cloud reveal" dir="ltr">
              {cv.technologies.filter(Boolean).map((tech, index) => (
                <span key={tech} style={{ '--tech-index': index } as React.CSSProperties}>
                  <Code2 size={15} />{tech}
                </span>
              ))}
            </div>

            <div className="goal-card reveal">
              <div className="goal-icon"><Sparkles size={30} /></div>
              <div className="goal-content">
                <span className="mini-label">هدفنا</span>
                <h2>منتجات رقمية عملية، وقابلة للنمو.</h2>
                <p>{cv.goal}</p>
                <div className="target-fields" dir="ltr">
                  {cv.targetFields.filter(Boolean).map((field) => <span key={field}>{field}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-glow" />
          <div className="container contact-inner reveal">
            <span className="contact-kicker"><MessageCircle size={18} /> تواصل معنا</span>
            <h2>عندك فكرة مشروع؟<br /><span className="text-gradient">خلّينا نحوّلها إلى حل.</span></h2>
            <p>إذا كنت تبحث عن موقع، نظام إدارة، أداة ذكاء اصطناعي أو أتمتة لعملياتك، يسعدنا في TITAN Digital أن نتحدث عن فكرتك.</p>
            <div className="contact-actions">
              <a className="button button-primary" href={`mailto:${cv.profile.email}`}><Mail size={19} /> أرسل بريدًا إلكترونيًا</a>
              {whatsappUrl && <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={19} /> محادثة واتساب</a>}
            </div>
            <div className="contact-cards">
              <a href={`mailto:${cv.profile.email}`}>
                <span><Mail size={21} /></span><small>البريد الإلكتروني</small><strong dir="ltr">{cv.profile.email}</strong>
              </a>
              <a href={`tel:${cv.profile.phone}`}>
                <span><Phone size={21} /></span><small>الهاتف وواتساب</small><strong dir="ltr">{cv.profile.phone}</strong>
              </a>
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer">
                  <span><Github size={21} /></span><small>GitHub</small><strong dir="ltr">{githubHandle ? `@${githubHandle}` : 'GitHub'}</strong>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark"><Code2 size={21} /></span>
            <span className="brand-copy"><strong>{cv.profile.name}</strong><small>{cv.profile.specialty}</small></span>
          </a>
          <p>© {new Date().getFullYear()} {cv.profile.name}. تم التطوير باهتمام بالتفاصيل.</p>
          <a className="admin-link" href="./admin.html"><Settings2 size={16} /> لوحة التحكم</a>
        </div>
      </footer>

      <button
        type="button"
        className={`back-to-top ${showTop ? 'is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة إلى أعلى الصفحة"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
