
(function () {
    "use strict";
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PROMPT = 'h@0xhd:~$';

    const canvas = document.getElementById('matrix');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const chars = 'アカサタナハマヤラワ0123456789ABCDEF{}[]<>$#%&*+=/\\|;:'.split('');
        let drops, fontSize = 16;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const cols = Math.floor(canvas.width / fontSize);
            drops = Array(cols).fill(1).map(() => Math.random() * -50);
        }
        resize();
        window.addEventListener('resize', resize);
        function rain() {
            ctx.fillStyle = 'rgba(4,7,5,0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + "px monospace";
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                const y = drops[i] * fontSize;
                ctx.fillStyle = Math.random() > 0.97 ? '#aaffcc' : '#00ff66';
                ctx.fillText(ch, i * fontSize, y);
                if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        if (!reduce) setInterval(rain, 55);
    }

    function runBoot() {
        const boot = document.getElementById('boot');
        return new Promise(resolve => {
            if (!boot) return resolve();
            if (reduce) { boot.classList.add('gone'); return resolve(); }
            const lines = [
                "[ OK ] Mounting /dev/sec ...",
                "[ OK ] Starting phosphor display driver",
                "[ OK ] Loading kernel module: redteam.ko",
                "[ OK ] Spawning shell for user: hd",
                "[ OK ] Establishing encrypted tunnel ... done",
                "",
                "booting hd@0xhd terminal ..."
            ];
            let i = 0;
            boot.textContent = "";
            const tick = setInterval(() => {
                if (i < lines.length) { boot.textContent += lines[i] + "\n"; i++; }
                else {
                    clearInterval(tick);
                    boot.innerHTML += '\n<span class="blink">_</span>';
                    setTimeout(() => { boot.classList.add('gone'); setTimeout(resolve, 600); }, 450);
                }
            }, 150);
            boot.addEventListener('click', () => {
                clearInterval(tick); boot.classList.add('gone'); setTimeout(resolve, 300);
            }, { once: true });
        });
    }

    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function typeCommand(el) {
        return new Promise(resolve => {
            const text = el.getAttribute('data-cmd') || '';
            const showPrompt = el.getAttribute('data-prompt') !== 'none';
            const promptHTML = showPrompt ? '<span class="prompt">' + PROMPT + '</span> ' : '';
            if (reduce) { el.innerHTML = promptHTML + escapeHtml(text); return resolve(); }
            el.innerHTML = promptHTML + '<span class="typed"></span><span class="cursor"></span>';
            const typed = el.querySelector('.typed');
            let i = 0;
            const t = setInterval(() => {
                typed.textContent = text.slice(0, ++i);
                if (i >= text.length) { clearInterval(t); setTimeout(resolve, 220); }
            }, 55);
        });
    }

    function showOutput(out) {
        if (!out) return;
        if (out.textContent.trim() === '') out.classList.add('empty');
        else out.classList.add('show');
    }

    function revealTerminal(term) {
        if (term.dataset.revealed) return;
        term.dataset.revealed = '1';
        term.classList.add('in');
        const cmd = term.querySelector('.command');
        const out = term.querySelector('.output');
        if (cmd && cmd.hasAttribute('data-cmd')) {
            typeCommand(cmd).then(() => showOutput(out));
        } else {
            showOutput(out);
        }
    }

    function initTerminals() {
        const terms = Array.prototype.slice.call(document.querySelectorAll('.terminal'));
        if (reduce || !('IntersectionObserver' in window)) {
            terms.forEach(revealTerminal);
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { revealTerminal(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.2 });
        terms.forEach(t => io.observe(t));
    }

    window.addEventListener('load', () => { runBoot().then(initTerminals); });
})();