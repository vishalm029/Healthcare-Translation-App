const startRecordBtn = document.getElementById('start-record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const originalTranscript = document.getElementById('original-transcript');
const translatedTranscript = document.getElementById('translated-transcript');
const speakBtn = document.getElementById('speak-btn');
const reRecordBtn = document.getElementById('re-record-btn'); // Reference to the re-record button
const languageSelect = document.getElementById('language-select');

let recognition;
let isRecording = false;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        originalTranscript.value = transcript; // Set the transcript in the textarea
        await translateText(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
    };

    recognition.onend = () => {
        // This event is triggered when the recognition service has stopped
        isRecording = false;
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        reRecordBtn.disabled = false; // Enable re-record button after stopping
    };
}

startRecordBtn.addEventListener('click', () => {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
        startRecordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        reRecordBtn.disabled = true; // Disable re-record button while recording
    }
});

stopRecordBtn.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop(); // This will trigger the onend event
    }
});

// Logic for re-recording
reRecordBtn.addEventListener('click', () => {
    originalTranscript.value = ''; // Clear the original transcript
    translatedTranscript.textContent = ''; // Clear the translated transcript
    recognition.stop(); // Stop any ongoing recording
    isRecording = false; // Reset recording state
    startRecordBtn.disabled = false; // Enable start button
    stopRecordBtn.disabled = true; // Disable stop button
    reRecordBtn.disabled = true; // Disable re-record button while starting new recording
    recognition.start(); // Start recording again
});

// Translation function
async function translateText(text) {
    const targetLanguage = languageSelect.value;
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`);
    const data = await response.json();
    translatedTranscript.textContent = data.responseData.translatedText;
    speakBtn.disabled = false;
}

speakBtn.addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(translatedTranscript.textContent);
    utterance.lang = languageSelect.value;
    window.speechSynthesis.speak(utterance);
});