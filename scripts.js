// ✅ KONFIGURASI
const API_KEY = "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"; // Ganti dengan API Key Anda
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat-v3.1";

// ✅ Variabel
let currentPart = 1;
let totalParts = 0;
let paragraphs = 0;
let sentences = 0;
let stories = [];
let synopses = [];

// ✅ DOM Elements
const configSection = document.getElementById("config-section");
const synopsisSection = document.getElementById("synopsis-section");
const storySection = document.getElementById("story-section");
const partNumberDisplay = document.getElementById("part-number");
const synopsisInput = document.getElementById("synopsis-input");
const allStories = document.getElementById("all-stories");

// ===============================
// ✅ Mulai Cerita
// ===============================
function startStory() {
  paragraphs = parseInt(document.getElementById("paragraphs").value);
  sentences = parseInt(document.getElementById("sentences").value);
  totalParts = parseInt(document.getElementById("totalParts").value);

  if (!paragraphs || !sentences || !totalParts) {
    alert("Semua input wajib diisi.");
    return;
  }

  configSection.style.display = "none";
  showSynopsisInput();
}

// ===============================
// ✅ Tampilkan Input Sinopsis
// ===============================
function showSynopsisInput() {
  partNumberDisplay.textContent = currentPart;
  synopsisInput.value = synopses[currentPart - 1] || "";
  synopsisSection.style.display = "block";
  storySection.style.display = "none";
}

// ===============================
// ✅ Generate Cerita dari AI
// ===============================
async function generatePart() {
  const synopsis = synopsisInput.value.trim();
  if (!synopsis) {
    alert("Sinopsis tidak boleh kosong.");
    return;
  }

  synopses[currentPart - 1] = synopsis;

  synopsisSection.style.display = "none";
  storySection.style.display = "block";

  // Ambil part sebelumnya sebagai konteks
  const previousText = stories.slice(0, currentPart - 1).join("\n\n");

  const systemPrompt = `
Kamu adalah AI penulis cerita. Tulis cerita berdasarkan sinopsis di bawah.
Gunakan ${paragraphs} paragraf, masing-masing sekitar ${sentences} kalimat.
Gunakan gaya naratif dan kreatif. Jika ada cerita sebelumnya, gunakan sebagai konteks.
`;

  const userPrompt = `
[Sinopsis Part ${currentPart}]: ${synopsis}
${previousText ? "\n\n[Bagian Sebelumnya]:\n" + previousText : ""}
`;

  const partDiv = document.createElement("div");
  partDiv.classList.add("story-part");
  partDiv.innerHTML = `<h3>Part ${currentPart}</h3><div class="story-content"><em>Menulis cerita...</em></div>`;
  if (allStories.lastChild && currentPart === stories.length) {
    allStories.removeChild(allStories.lastChild);
  }
  allStories.appendChild(partDiv);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[Gagal mengambil cerita dari AI]";
    stories[currentPart - 1] = content;

    partDiv.innerHTML = `
      <h3>Part ${currentPart}</h3>
      <div class="story-content">${content.replace(/\n/g, "<br>")}</div>
    `;
  } catch (error) {
    partDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
  }
}

// ===============================
// ✅ Revisi Cerita
// ===============================
function revisePart() {
  showSynopsisInput();
}

// ===============================
// ✅ Lanjut ke Part Selanjutnya
// ===============================
function nextPart() {
  if (currentPart >= totalParts) {
    alert("Semua part sudah selesai.");
    return;
  }
  currentPart++;
  showSynopsisInput();
}

// ===============================
// ✅ Batal Cerita dan Reset
// ===============================
function cancelStory() {
  if (confirm("Yakin ingin membatalkan cerita dan memulai ulang?")) {
    location.reload();
  }
}

// ===============================
// ✅ Export Cerita ke TXT
// ===============================
function exportStory() {
  if (stories.length === 0) {
    alert("Belum ada cerita untuk diexport.");
    return;
  }

  let output = "";
  stories.forEach((story, index) => {
    output += `Part ${index + 1}\n`;
    output += story + "\n\n";
  });

  const blob = new Blob([output], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cerita.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===============================
// 🌙 Mode Gelap
// ===============================
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Ganti emoji tombol
  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "☀️ Mode Terang";
  } else {
    themeToggle.textContent = "🌙 Mode Gelap";
  }
});
