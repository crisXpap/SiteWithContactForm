export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!DOCTYPE html>
      <html lang="el">
      <head>
          <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZILVER PÂTISSERIE</title>
    
    <link rel="icon" type="image/png" href="/favicon.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,300;0,500;1,300&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

    <style>
        /* --- Smooth Scroll Setup --- */
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }

        :root {
            --dark-blue: #0072ce;
            --light-blue: #a9c8eb;
            --accent-font: 'Montserrat', sans-serif;
            --body-font: 'Libre Baskerville', serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--light-blue);
            color: var(--dark-blue);
            font-family: var(--body-font);
            line-height: 1.6;
            overflow-x: hidden;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar { display: none; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 5%; position: relative; }

        /* --- Navigation --- */
        nav {
            padding: 30px 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0, 114, 206, 0.15);
            position: sticky;
            top: 0;
            background-color: var(--light-blue);
            z-index: 2000;
        }

        .nav-logo img { height: 40px; width: auto; }
        .nav-tabs { display: flex; gap: 40px; list-style: none; }
        .nav-tabs a {
            text-decoration: none;
            color: var(--dark-blue);
            font-family: var(--accent-font);
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 2.5px;
            transition: opacity 0.3s ease;
        }
        .nav-tabs a:hover { opacity: 0.6; }

        /* --- Dropdown --- */
        .menu-icon-btn { 
            display: none; 
            background: none; 
            border: none; 
            color: var(--dark-blue); 
            cursor: pointer; 
            padding: 5px; 
            transition: transform 0.3s ease; 
            align-items: center;
        }
        .dropdown-menu { position: absolute; top: 100%; left: 0; width: 100%; background-color: var(--light-blue); border-bottom: 1px solid var(--dark-blue); max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.77, 0, 0.175, 1); z-index: 1999; }
        .dropdown-menu.active { max-height: 350px; }
        .dropdown-links { list-style: none; padding: 40px 0; text-align: center; }
        .dropdown-links li { margin: 20px 0; }
        .dropdown-links a { text-decoration: none; color: var(--dark-blue); font-family: var(--accent-font); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 3px; }

        /* --- Hero --- */
        header { 
            margin: 60px 0 100px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 30px; 
        }
        .hero-text-wrapper { flex: 1.6; min-width: 0; }
        
        .hero-logo {
            width: 100%;
            max-width: 600px;
            height: auto;
            margin-bottom: 30px;
            display: block;
        }

        .hero-image-wrapper { flex: 1; max-width: 450px; }
        .hero-image-wrapper img { width: 100%; height: auto; display: block; border-radius: 4px; }
        
        .hero-sub { 
            font-size: clamp(0.85rem, 2vw, 1.3rem); 
            max-width: 500px; 
            opacity: 0.8; 
            font-style: normal;
            text-align: center; 
            margin: 0 auto; 
        }

        /* --- Story --- */
        .story-section { 
            border-top: 1px solid var(--dark-blue); 
            padding-top: 80px; 
            margin-bottom: 120px; 
            display: grid; 
            grid-template-columns: 1fr 1.2fr; 
            gap: 80px; 
            align-items: center; 
        }
        .story-image-wrapper img { width: 100%; height: auto; display: block; }
        .story-section h3 { font-family: var(--accent-font); font-weight: 300; text-transform: uppercase; font-size: 1.1rem; margin-bottom: 30px; letter-spacing: 5px; }
        .story-section p { font-size: 1.15rem; line-height: 1.8; opacity: 0.9; }

        /* --- Marquee --- */
        .news-marquee-container { 
            width: 100%; border-top: 1px solid var(--dark-blue); border-bottom: 1px solid var(--dark-blue); padding: 30px 0; margin-bottom: 100px; overflow: hidden; position: relative; 
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); 
        }
        .marquee-content { display: flex; white-space: nowrap; animation: scroll 60s linear infinite; }
        .marquee-item { padding: 0 60px; text-decoration: none; color: var(--dark-blue); transition: opacity 0.3s ease; }
        .marquee-item:hover { opacity: 0.6; }
        .marquee-item span { font-family: var(--accent-font); font-size: 0.65rem; display: block; margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;}
        .marquee-item h4 { font-size: 1.4rem; font-weight: 400; font-style: italic; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* --- Wolt --- */
        .wolt-cta-section { text-align: center; margin-bottom: 160px; }
        .wolt-button { display: inline-flex; align-items: center; justify-content: center; gap: 25px; color: var(--dark-blue); padding: 18px 50px; text-decoration: none; font-family: var(--accent-font); font-size: 0.85rem; letter-spacing: 2px; border: 1px solid var(--dark-blue); border-radius: 100px; transition: all 0.5s ease; text-transform: uppercase; }
        .wolt-button:hover { background-color: var(--dark-blue); color: var(--light-blue) !important; }

        /* --- Footer --- */
        footer { border-top: 1px solid var(--dark-blue); padding: 80px 0 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 60px; position: relative; }
        .footer-title { font-family: var(--accent-font); font-size: 0.7rem; margin-bottom: 25px; display: block; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; }
        .footer-content p { font-size: 1rem; margin-bottom: 8px; }
        .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; }
        .footer-links a { display: block; color: var(--dark-blue); text-decoration: none; margin-bottom: 10px; transition: opacity 0.3s ease; }
        .footer-links a:hover { opacity: 0.6; }

        .signature { grid-column: 1 / -1; text-align: right; font-family: var(--accent-font); font-size: 0.55rem; letter-spacing: 1px; text-transform: uppercase; opacity: 0.4; margin-top: 30px; }

        /* --- RESPONSIVE UPDATES --- */
        @media (max-width: 768px) {
            .nav-tabs { display: none; }
            .menu-icon-btn { display: flex; }
            
            /* Hero stays side-by-side but shrinks gaps */
            header { gap: 15px; margin: 40px 0; }
            .hero-logo { margin-bottom: 15px; }
            .hero-text-wrapper { text-align: center; }
            .hero-sub { font-size: 0.85rem; }

            /* Story Section now performs like Hero (Side-by-Side) */
            .story-section { 
                grid-template-columns: 1fr 1.5fr; /* Keeps it side-by-side */
                gap: 20px; 
                padding-top: 40px;
            }
            .story-section h3 { font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 10px; }
            .story-section p { font-size: 0.85rem; line-height: 1.5; }

            .signature { text-align: center; }
            .marquee-item h4 { font-size: 1.1rem; }
            .hero-logo { max-width: 100%; }
        }
    </style>
      </head>
      <body>
          <nav>
        <div class="nav-logo">
            <a href="/"><img src="/logo.png" alt="Zilver Logo"></a>
        </div>
        <ul class="nav-tabs">
            <li><a href="/kat.html">Κατάλογος</a></li>
            <li><a href="/about.html">Σχετικά με εμάς</a></li>
            <li><a href="/cake.html">Δημιουργίες</a></li>
        </ul>
        <button class="menu-icon-btn" id="menu-btn">
            <span class="material-symbols-outlined" style="font-size: 32px;">menu</span>
        </button>
        <div class="dropdown-menu" id="dropdown-menu">
            <ul class="dropdown-links">
                <li><a href="/kat.html">Κατάλογος</a></li>
                <li><a href="/about.html">Σχετικά με εμάς</a></li>
                <li><a href="/cake.html">Δημιουργίες</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <header>
            <div class="hero-text-wrapper">
                <img src="/logo.png" alt="Zilver Patisserie" class="hero-logo">
                <p class="hero-sub">Μια σύγχρονη patisserie στη Φιλοθέη με σεβασμό στην παράδοση και την πρώτη ύλη.</p>
            </div>
            <div class="hero-image-wrapper">
                <img src="/title.jpg" alt="Zilver Patisserie">
            </div>
        </header>

        <section class="story-section">
            <div class="story-image-wrapper">
                <img src="/mom.jpg" alt="Inspiration - Argyro">
            </div>
            <div class="story-text-wrapper">
                <h3>Zilver / Ασήμι</h3>
                <p>Ένας διακριτικός φόρος τιμής στη μητέρα της δημιουργού, την Αργυρώ. Εδώ, το γλυκό δεν είναι απλώς ένα προϊόν, αλλά μέρος μιας καθημερινής τελετουργίας.</p>
            </div>
        </section>
    </div>

    <div class="news-marquee-container">
        <div class="marquee-content">
            <a href="https://www.athinorama.gr/restaurants/3061552/zilver-to-neo-kafe-zaxaroplasteio-tis-filotheis-kanei-ti-diafora/" target="_blank" class="marquee-item">
                <span>Athinorama</span><h4>Το νέο σημείο αναφοράς.</h4>
            </a>
            <a href="https://www.athensvoice.gr/life/geusi/themata/936822/zilver-kouklistiko-zaharoplasteio-me-kalo-gluko-apo-heri-gunaikeio/" target="_blank" class="marquee-item">
                <span>Athens Voice</span><h4>Κουκλίστικο και αυθεντικό.</h4>
            </a>
            <a href="https://www.iciao.gr/afieromata/kafes-tyropita-glyko-oi-mikres-kathimerines-apolayseis/zilver-patisserie/" target="_blank" class="marquee-item">
                <span>iCiao</span><h4>Οι μικρές καθημερινές απολαύσεις.</h4>
            </a>
            <a href="https://www.tovima.gr/2026/03/02/elliniki-kouzina/ta-aglyka-glyka-tis-elenis-pou-se-xortainoun-xoris-na-se-ligonoun/" target="_blank" class="marquee-item">
                <span>To Vima</span><h4>Η τέχνη της Ελένης.</h4>
            </a>
            <a href="https://www.athinorama.gr/restaurants/3061552/zilver-to-neo-kafe-zaxaroplasteio-tis-filotheis-kanei-ti-diafora/" target="_blank" class="marquee-item">
                <span>Athinorama</span><h4>Το νέο σημείο αναφοράς.</h4>
            </a>
            <a href="https://www.athensvoice.gr/life/geusi/themata/936822/zilver-kouklistiko-zaharoplasteio-me-kalo-gluko-apo-heri-gunaikeio/" target="_blank" class="marquee-item">
                <span>Athens Voice</span><h4>Κουκλίστικο και αυθεντικό.</h4>
            </a>
        </div>
    </div>

    <div class="container">
        <div class="wolt-cta-section">
            <a href="https://wolt.com/en/grc/athens/restaurant/zilver-patisserie" target="_blank" class="wolt-button">Order on Wolt →</a>
        </div>
    </div>

    <div class="container">
        <footer>
            <div class="footer-content">
                <span class="footer-title">Visit Us</span>
                <p>Thrakis 2, Filothei 152 37</p>
                <p style="margin-top: 15px;"><strong>T.</strong> 210 6851918</p>
            </div>
            <div class="footer-content">
                <span class="footer-title">Opening Hours</span>
                <div class="hours-grid">
                    <span>Mon - Thu</span> <span>08:30 – 20:30</span>
                    <span>Friday</span> <span>08:30 – 22:00</span>
                    <span>Sat - Sun</span> <span>09:00 – 22:00</span>
                </div>
            </div>
            <div class="footer-content">
                <span class="footer-title">Follow Us</span>
                <div class="footer-links">
                    <a href="https://www.instagram.com/zilver_patisserie/" target="_blank">Instagram</a>
                    <a href="https://www.facebook.com/p/Zilver-Patisserie-61578572153925/" target="_blank">Facebook</a>
                    <a href="https://www.tiktok.com/@zilver.patisserie" target="_blank">TikTok</a>
                </div>
            </div>
            <div class="signature">engineered by chris pappas</div>
        </footer>
    </div>

    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <script>
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        const menuBtn = document.getElementById('menu-btn');
        const dropdown = document.getElementById('dropdown-menu');
        menuBtn.addEventListener('click', () => {
            dropdown.classList.toggle('active');
            menuBtn.style.transform = dropdown.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0deg)';
        });
    </script>
      </body>
      </html>
    ` }} />
  );
}