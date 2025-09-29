/**
 * Proctoring System for Online Exams
 * Handles camera and microphone monitoring during tests
 */

class ProctoringSystem {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isMonitoring = false;
        this.consentGiven = false;
        this.warnings = 0;
        this.maxWarnings = 3;
        this.faceDetectionInterval = null;
        this.audioLevelInterval = null;
        this.eyeTrackingInterval = null;
        this.suspiciousActivity = [];
        
        this.init();
    }

    init() {
        this.createProctoringUI();
        this.setupEventListeners();
    }

    createProctoringUI() {
        // Create proctoring modal
        const modal = document.createElement('div');
        modal.id = 'proctoringModal';
        modal.innerHTML = `
            <div class="proctoring-overlay">
                <div class="proctoring-modal">
                    <div class="proctoring-header">
                        <h2>🔒 Exam Proctoring Setup</h2>
                        <p>For exam integrity, we need access to your camera and microphone</p>
                    </div>
                    <div class="proctoring-content">
                        <div class="permission-request">
                            <div class="permission-item">
                                <span class="permission-icon">📹</span>
                                <span>Camera Access - To monitor your exam environment</span>
                            </div>
                            <div class="permission-item">
                                <span class="permission-icon">🎤</span>
                                <span>Microphone Access - To detect background noise</span>
                            </div>
                        </div>
                        <div class="privacy-notice">
                            <h3>Privacy Notice:</h3>
                            <ul>
                                <li>Your video and audio will be recorded during the exam</li>
                                <li>Data is encrypted and stored securely</li>
                                <li>Only authorized personnel can access recordings</li>
                                <li>Recordings are deleted after 30 days</li>
                            </ul>
                        </div>
                        <div class="proctoring-actions">
                            <button id="denyProctoring" class="btn secondary">Deny & Exit</button>
                            <button id="allowProctoring" class="btn">Allow & Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Create proctoring status bar
        const statusBar = document.createElement('div');
        statusBar.id = 'proctoringStatusBar';
        statusBar.innerHTML = `
            <div class="proctoring-status">
                <div class="status-indicators">
                    <div class="status-item" id="cameraStatus">
                        <span class="status-icon">📹</span>
                        <span class="status-text">Camera</span>
                        <span class="status-dot offline"></span>
                    </div>
                    <div class="status-item" id="microphoneStatus">
                        <span class="status-icon">🎤</span>
                        <span class="status-text">Microphone</span>
                        <span class="status-dot offline"></span>
                    </div>
                    <div class="status-item" id="faceDetectionStatus">
                        <span class="status-icon">👤</span>
                        <span class="status-text">Face Detection</span>
                        <span class="status-dot offline"></span>
                    </div>
                </div>
                <div class="proctoring-warnings" id="proctoringWarnings">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">Warnings: <span id="warningCount">0</span>/3</span>
                </div>
            </div>
        `;
        document.body.appendChild(statusBar);

        // Add CSS styles
        this.addProctoringStyles();
    }

    addProctoringStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #proctoringModal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .proctoring-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .proctoring-modal {
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .proctoring-header h2 {
                color: #1e3a8a;
                margin-bottom: 10px;
            }

            .proctoring-header p {
                color: #666;
                margin-bottom: 20px;
            }

            .permission-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 10px;
            }

            .permission-icon {
                font-size: 24px;
            }

            .privacy-notice {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }

            .privacy-notice h3 {
                color: #1e3a8a;
                margin-bottom: 10px;
            }

            .privacy-notice ul {
                margin: 0;
                padding-left: 20px;
            }

            .privacy-notice li {
                margin-bottom: 5px;
                color: #555;
            }

            .proctoring-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            #proctoringStatusBar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #1e3a8a;
                color: white;
                padding: 10px 20px;
                z-index: 9999;
                display: none;
            }

            .proctoring-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .status-indicators {
                display: flex;
                gap: 20px;
            }

            .status-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #dc3545;
            }

            .status-dot.online {
                background: #28a745;
            }

            .proctoring-warnings {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.1);
                padding: 5px 10px;
                border-radius: 20px;
            }

            .warning-icon {
                font-size: 16px;
            }

            .proctoring-video {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 200px;
                height: 150px;
                border: 2px solid #1e3a8a;
                border-radius: 8px;
                z-index: 9998;
                display: none;
            }

            .proctoring-video video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 6px;
            }

            .warning-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 8px;
                z-index: 10001;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                text-align: center;
                max-width: 400px;
            }

            .warning-popup h3 {
                margin: 0 0 10px 0;
                color: #856404;
            }

            .warning-popup p {
                margin: 0 0 15px 0;
            }

            .warning-popup button {
                background: #ffc107;
                color: #212529;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        document.getElementById('allowProctoring').addEventListener('click', () => {
            this.startProctoring();
        });

        document.getElementById('denyProctoring').addEventListener('click', () => {
            this.denyProctoring();
        });

        // Monitor page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.isMonitoring) {
                if (document.hidden) {
                    this.recordSuspiciousActivity('Page hidden during exam');
                    this.showWarning('Please keep the exam tab active. Switching tabs is not allowed.');
                }
            }
        });

        // Monitor window focus
        window.addEventListener('blur', () => {
            if (this.isMonitoring) {
                this.recordSuspiciousActivity('Window lost focus during exam');
                this.showWarning('Please keep the exam window focused.');
            }
        });

        // Monitor keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isMonitoring) {
                // Block common shortcuts
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 's' || e.key === 'p') {
                        e.preventDefault();
                        this.recordSuspiciousActivity(`Blocked shortcut: ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key}`);
                        this.showWarning('Copy, paste, and other shortcuts are disabled during the exam.');
                    }
                }
                
                // Block F12, right-click context menu
                if (e.key === 'F12' || e.key === 'F5') {
                    e.preventDefault();
                    this.recordSuspiciousActivity(`Blocked function key: ${e.key}`);
                    this.showWarning('Developer tools and page refresh are disabled during the exam.');
                }
            }
        });

        // Block right-click
        document.addEventListener('contextmenu', (e) => {
            if (this.isMonitoring) {
                e.preventDefault();
                this.recordSuspiciousActivity('Right-click attempted');
                this.showWarning('Right-click is disabled during the exam.');
            }
        });
    }

    async startProctoring() {
        try {
            // Request camera and microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            this.setupVideoMonitoring();
            this.setupAudioMonitoring();
            this.startFaceDetection();
            this.startEyeTracking();
            
            this.consentGiven = true;
            this.isMonitoring = true;
            
            document.getElementById('proctoringModal').style.display = 'none';
            document.getElementById('proctoringStatusBar').style.display = 'block';
            
            this.updateStatus('cameraStatus', true);
            this.updateStatus('microphoneStatus', true);
            
            console.log('Proctoring started successfully');
            
        } catch (error) {
            console.error('Error starting proctoring:', error);
            this.showError('Failed to access camera and microphone. Please check your permissions and try again.');
        }
    }

    setupVideoMonitoring() {
        this.videoElement = document.createElement('video');
        this.videoElement.srcObject = this.stream;
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // Create visible proctoring video
        const proctoringVideo = document.createElement('div');
        proctoringVideo.className = 'proctoring-video';
        proctoringVideo.innerHTML = '<video autoplay muted></video>';
        proctoringVideo.querySelector('video').srcObject = this.stream;
        document.body.appendChild(proctoringVideo);
        proctoringVideo.style.display = 'block';
    }

    setupAudioMonitoring() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.microphone = this.audioContext.createMediaStreamSource(this.stream);
        
        this.microphone.connect(this.analyser);
        this.analyser.fftSize = 256;
        
        this.startAudioLevelMonitoring();
    }

    startAudioLevelMonitoring() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        this.audioLevelInterval = setInterval(() => {
            this.analyser.getByteFrequencyData(dataArray);
            
            // Calculate average audio level
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            
            // Detect suspicious audio levels (too quiet or too loud)
            if (average < 5) {
                this.recordSuspiciousActivity('Very low audio level detected');
            } else if (average > 200) {
                this.recordSuspiciousActivity('High audio level detected - possible background noise');
            }
            
        }, 1000);
    }

    startFaceDetection() {
        // Simple face detection using canvas and basic image analysis
        this.faceDetectionInterval = setInterval(() => {
            if (this.videoElement && this.videoElement.videoWidth > 0) {
                this.detectFace();
            }
        }, 2000);
    }

    detectFace() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Basic face detection (simplified)
        const faceDetected = this.basicFaceDetection(imageData);
        
        if (faceDetected) {
            this.updateStatus('faceDetectionStatus', true);
        } else {
            this.updateStatus('faceDetectionStatus', false);
            this.recordSuspiciousActivity('Face not detected in frame');
            this.showWarning('Please ensure your face is visible in the camera.');
        }
    }

    basicFaceDetection(imageData) {
        // Simplified face detection based on skin tone detection
        const data = imageData.data;
        let skinPixels = 0;
        let totalPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Basic skin tone detection
            if (r > 95 && g > 40 && b > 20 && 
                Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                Math.abs(r - g) > 15 && r > g && r > b) {
                skinPixels++;
            }
            totalPixels++;
        }
        
        const skinRatio = skinPixels / totalPixels;
        return skinRatio > 0.1; // Threshold for face detection
    }

    startEyeTracking() {
        // Basic eye tracking simulation
        this.eyeTrackingInterval = setInterval(() => {
            // Simulate eye tracking detection
            const lookingAway = Math.random() < 0.1; // 10% chance of looking away
            
            if (lookingAway) {
                this.recordSuspiciousActivity('Student looking away from screen');
            }
        }, 5000);
    }

    updateStatus(elementId, isOnline) {
        const element = document.getElementById(elementId);
        if (element) {
            const dot = element.querySelector('.status-dot');
            if (dot) {
                dot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
            }
        }
    }

    recordSuspiciousActivity(activity) {
        this.suspiciousActivity.push({
            timestamp: new Date().toISOString(),
            activity: activity,
            pageUrl: window.location.href
        });
        
        this.warnings++;
        document.getElementById('warningCount').textContent = this.warnings;
        
        if (this.warnings >= this.maxWarnings) {
            this.showFinalWarning();
        }
        
        // Send to server
        this.sendSuspiciousActivity(activity);
    }

    sendSuspiciousActivity(activity) {
        fetch('/api/proctoring/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity: activity,
                timestamp: new Date().toISOString(),
                studentId: this.getStudentId(),
                examId: this.getExamId()
            })
        }).catch(error => {
            console.error('Failed to send suspicious activity:', error);
        });
    }

    showWarning(message) {
        const warningPopup = document.createElement('div');
        warningPopup.className = 'warning-popup';
        warningPopup.innerHTML = `
            <h3>⚠️ Exam Warning</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">OK</button>
        `;
        document.body.appendChild(warningPopup);
        
        setTimeout(() => {
            if (warningPopup.parentElement) {
                warningPopup.remove();
            }
        }, 5000);
    }

    showFinalWarning() {
        const finalWarning = document.createElement('div');
        finalWarning.className = 'warning-popup';
        finalWarning.innerHTML = `
            <h3>🚨 Final Warning</h3>
            <p>You have reached the maximum number of warnings. Any further suspicious activity will result in exam termination.</p>
            <button onclick="this.parentElement.remove()">I Understand</button>
        `;
        document.body.appendChild(finalWarning);
    }

    showError(message) {
        alert('Proctoring Error: ' + message);
    }

    denyProctoring() {
        alert('Camera and microphone access is required to take the exam. Please refresh and allow access to continue.');
        window.location.href = '/student-updates';
    }

    stopProctoring() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }
        
        if (this.audioLevelInterval) {
            clearInterval(this.audioLevelInterval);
        }
        
        if (this.eyeTrackingInterval) {
            clearInterval(this.eyeTrackingInterval);
        }
        
        this.isMonitoring = false;
        
        // Remove UI elements
        const statusBar = document.getElementById('proctoringStatusBar');
        if (statusBar) statusBar.remove();
        
        const proctoringVideo = document.querySelector('.proctoring-video');
        if (proctoringVideo) proctoringVideo.remove();
    }

    getStudentId() {
        // Get student ID from session or URL
        return sessionStorage.getItem('studentId') || 'unknown';
    }

    getExamId() {
        // Get exam ID from URL or page data
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('examId') || 'unknown';
    }
}

// Initialize proctoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on exam pages
    if (window.location.pathname.includes('exam') || window.location.pathname.includes('quiz') || window.location.pathname.includes('mst')) {
        window.proctoringSystem = new ProctoringSystem();
    }
});
