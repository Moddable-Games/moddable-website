import { btn, linkBtn, navbar, footer } from './mg.js';
document.getElementById('nav-root').appendChild(navbar(''));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('btn-root').appendChild(linkBtn('Back to Home', '/', 'primary'));