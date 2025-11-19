document.addEventListener('DOMContentLoaded', () => {
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

  // --- 4. Main Compressor UI Logic (Fake Implementation) ---
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

    progressContainer.style.display = 'none';
    resultArea.style.display = 'none';
    downloadBtn.classList.add('btn-disabled');
  }

  // Fake compression
  compressBtn.addEventListener('click', () => {
    if (!selectedFile) {
      alert('Please select a video file first! 🎥');
      return;
    }

    progressContainer.style.display = 'block';
    resultArea.style.display = 'none';
    progressBar.style.width = '0%';
    statusText.innerText = 'Analyzing video...';
    compressBtn.disabled = true;
    compressBtn.innerText = 'Processing...';
    compressBtn.classList.add('btn-disabled');

    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        finishCompression();
      }

      if (progress > 20 && progress < 50) statusText.innerText = 'Encoding video stream...';
      if (progress > 50 && progress < 80) statusText.innerText = 'Optimizing audio...';
      if (progress > 80) statusText.innerText = 'Finalizing...';

      progressBar.style.width = `${progress}%`;
      progressPercent.innerText = `${Math.floor(progress)}%`;
    }, 200);
  });

  function finishCompression() {
    statusText.innerText = 'Done! ✨';
    compressBtn.innerText = 'Compress Video';
    compressBtn.disabled = false;
    compressBtn.classList.remove('btn-disabled');

    resultArea.style.display = 'block';
    downloadBtn.classList.remove('btn-disabled');

    downloadBtn.onclick = (e) => {
      e.preventDefault();
      alert(`Downloading compressed version of: ${selectedFile.name}`);
    };
  }
});
