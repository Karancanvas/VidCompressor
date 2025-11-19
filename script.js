document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Initialize FFmpeg ---
    // We bring these in from the CDN scripts loaded in HTML
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    // --- 1. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Scroll Animations (Intersection Observer) ---
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- 3. FAQ Accordion Logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // --- 4. Main Compressor UI Logic (REAL IMPLEMENTATION) ---
    const dropZone = document.getElementById('dropZone');
    const videoInput = document.getElementById('videoInput');
    const fileInfo = document.getElementById('fileInfo');
    const compressBtn = document.getElementById('compressBtn');
    const progressContainer = document.getElementById('progressContainer');
    const statusText = document.getElementById('statusText');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const resultArea = document.getElementById('resultArea');
    const downloadBtn = document.getElementById('downloadBtn');

    let selectedFile = null;

    // Click to open file chooser
    dropZone.addEventListener('click', () => videoInput.click());

    // Handle file selection
    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            displayFileInfo(selectedFile);
        }
    });

    // Drag + drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'rgba(255, 255, 255, 0.5)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'rgba(255, 255, 255, 0.5)';

        if (e.dataTransfer.files.length > 0) {
            selectedFile = e.dataTransfer.files[0];
            displayFileInfo(selectedFile);
        }
    });

    function displayFileInfo(file) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `<i class="fa-solid fa-film"></i> ${file.name} <span style="color:var(--text-light); font-weight:400;">(${sizeMB} MB)</span>`;

        // Reset UI states
        progressContainer.style.display = 'none';
        resultArea.style.display = 'none';
        downloadBtn.classList.add('btn-disabled');
        // Remove any previous click listeners on download button
        downloadBtn.onclick = null; 
    }

    // --- REAL FFmpeg Compression ---
    compressBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Please select a video file first! 🎥');
            return;
        }

        // UI Updates: Locking down the interface
        progressContainer.style.display = 'block';
        resultArea.style.display = 'none';
        progressBar.style.width = '0%';
        progressPercent.innerText = '0%';
        statusText.innerText = 'Loading compression engine...';
        
        compressBtn.disabled = true;
        compressBtn.innerText = 'Processing...';
        compressBtn.classList.add('btn-disabled');

        try {
            // 1. Load FFmpeg (only needs to happen once)
            if (!ffmpeg.isLoaded()) {
                await ffmpeg.load();
            }

            // 2. Write file to browser memory (virtual file system)
            statusText.innerText = 'Reading file...';
            const { name } = selectedFile;
            ffmpeg.FS('writeFile', name, await fetchFile(selectedFile));

            // 3. Determine Quality Settings
            // CRF: Lower is better quality. 18=High, 23=Balanced, 28=Small
            let crf = '23'; 
            const qualitySelect = document.getElementById('qualitySelect');
            if (qualitySelect) {
                const val = qualitySelect.value;
                if(val === 'high') crf = '18';
                if(val === 'small') crf = '28';
            }

            // 4. Track Progress
            ffmpeg.setProgress(({ ratio }) => {
                const percent = Math.round(ratio * 100);
                if(percent >= 0 && percent <= 100) {
                    progressBar.style.width = `${percent}%`;
                    progressPercent.innerText = `${percent}%`;
                    statusText.innerText = `Compressing... ${percent}%`;
                }
            });

            // 5. Run Compression Command
            statusText.innerText = 'Compressing video... (Do not close tab)';
            // -preset ultrafast: sacrificing a tiny bit of size for much faster speed
            await ffmpeg.run('-i', name, '-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast', 'output.mp4');

            // 6. Read the result
            statusText.innerText = 'Finalizing...';
            const data = ffmpeg.FS('readFile', 'output.mp4');

            // 7. Create Download Link
            const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
            
            // Update UI to "Done"
            downloadBtn.href = url;
            downloadBtn.download = `compressed_${name}`;
            downloadBtn.classList.remove('btn-disabled');
            
            // Show Success Area
            resultArea.style.display = 'block';
            statusText.innerText = 'Done! ✨';
            
            // Reset Button
            compressBtn.innerText = 'Compress Another';
            compressBtn.disabled = false;
            compressBtn.classList.remove('btn-disabled');

            // 8. Cleanup Memory (Important for browser performance)
            ffmpeg.FS('unlink', name);
            // We keep output.mp4 in memory briefly so the download works, 
            // but ideally you'd clear it if the user starts over.

        } catch (error) {
            console.error(error);
            statusText.innerText = 'Error occurred!';
            alert('Error: If you are on GitHub Pages, make sure `coi-serviceworker.js` is loaded and you refreshed twice.');
            
            // Reset Button so they can try again
            compressBtn.disabled = false;
            compressBtn.innerText = 'Compress Video';
            compressBtn.classList.remove('btn-disabled');
        }
    });
});
