<template>
  <div class="herbsie-container">
    <!-- Floating launcher -->
    <div v-if="!isOpen" class="floating-entry">
      <transition name="prompt-fade" mode="out-in">
        <div
          v-if="showPromptBubble"
          :key="currentPromptIndex"
          class="floating-prompt"
          @click="openChat"
        >
          <div class="prompt-text">
            {{ rotatingPrompts[currentPromptIndex] }}
          </div>

          <button
            class="prompt-close"
            type="button"
            @click.stop="dismissPrompt"
          >
            ×
          </button>
        </div>
      </transition>

      <button
        class="floating-ball"
        type="button"
        @click="openChat"
        aria-label="Open Herbsie chat"
      >
        <span class="icon">
          <img src="../assets/logo_opacity.svg" alt="Herbsie" />
        </span>
        <span class="floating-badge">❤</span>
      </button>
    </div>

    <!-- Chat window -->
    <div v-else class="chat-window">
      <div class="chat-header">
        <div class="bot-info">
          <div class="avatar-elegant">H</div>

          <div class="header-text">
            <div class="name">Herbsie</div>
            <div class="status">
              {{ faqLoading ? "Loading Q&A..." : "Clinic Assistant" }}
            </div>
          </div>
        </div>

        <button class="close-btn" type="button" @click="closeChat">×</button>
      </div>

      <div ref="scrollBox" class="chat-content">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['msg-row', msg.role]"
        >
          <div class="bubble" v-html="msg.text"></div>
        </div>
      </div>

      <div class="options-area">
        <div class="tags-header">
          <span>Quick Q&A</span>
          <span v-if="faqLoading">Loading...</span>
        </div>

        <div class="tags-scroll">
          <button
            v-for="item in faqDatabase"
            :key="item.id"
            class="tag-btn"
            type="button"
            :disabled="isSubmitting || faqLoading"
            @click="handleSelect(item)"
          >
            {{ item.q }}
          </button>

          <div
            v-if="!faqLoading && faqDatabase.length === 0"
            class="empty-tags"
          >
            No Q&A content available yet.
          </div>
        </div>
      </div>

      <div class="input-area">
        <input
          v-model="userInput"
          type="text"
          placeholder="Type your question..."
          :disabled="isSubmitting || faqLoading"
          @keyup.enter="handleSend"
        />

        <button
          class="send-btn"
          type="button"
          :disabled="isSubmitting || faqLoading"
          @click="handleSend"
        >
          <span v-if="!isSubmitting">➤</span>
          <span v-else>...</span>
        </button>
      </div>
    </div>

    <!-- Lead Popup -->
    <div v-if="showLeadModal" class="lead-modal-overlay">
      <div class="lead-modal">
        <div class="lead-modal-header">
          <div>
            <p class="lead-kicker">Contact our team</p>
            <h3>Leave your details</h3>
          </div>

          <button class="lead-close-btn" type="button" @click="handleLeadBack">
            ×
          </button>
        </div>

        <p class="lead-desc">
          We could not find a close match for your question. Please leave your
          details below and our team will get back to you.
        </p>

        <div class="lead-question-box">
          <span class="lead-question-label">Your question</span>
          <p>{{ pendingQuestion }}</p>
        </div>

        <form class="lead-form" @submit.prevent="submitLead">
          <div class="lead-field">
            <label for="lead-name">Name</label>
            <input
              id="lead-name"
              v-model.trim="leadForm.name"
              type="text"
              placeholder="Your full name"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.name" class="field-error">
              {{ fieldErrors.name }}
            </span>
          </div>

          <div class="lead-field">
            <label for="lead-email">Email</label>
            <input
              id="lead-email"
              v-model.trim="leadForm.email"
              type="email"
              placeholder="your@email.com"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.email" class="field-error">
              {{ fieldErrors.email }}
            </span>
          </div>

          <div class="lead-field">
            <label for="lead-phone">Phone</label>
            <input
              id="lead-phone"
              v-model.trim="leadForm.phone"
              type="text"
              placeholder="Your phone number"
              :disabled="isSubmitting"
            />
            <span v-if="fieldErrors.phone" class="field-error">
              {{ fieldErrors.phone }}
            </span>
          </div>

          <div class="lead-actions">
            <button
              type="button"
              class="back-btn"
              :disabled="isSubmitting"
              @click="handleLeadBack"
            >
              Back
            </button>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="!isSubmitting">Submit</span>
              <span v-else>Sending...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const isOpen = ref(false);
const userInput = ref("");
const scrollBox = ref(null);
const isSubmitting = ref(false);
const faqLoading = ref(false);

const showLeadModal = ref(false);
const pendingQuestion = ref("");

const leadForm = ref({
  name: "",
  email: "",
  phone: "",
});

const fieldErrors = ref({
  name: "",
  email: "",
  phone: "",
});

const messages = ref([
  {
    role: "bot",
    text: "G'day — I'm Herbsie 👋<br>Please select a question below, or type your own.",
  },
]);

const rotatingPrompts = [
  "G'day — I’m Herbsie 👋",
  "Need help with herbal medicine?",
  "Ask me about granules, pills, or side effects.",
  "Quick help for common treatment questions.",
  "Not sure what to avoid while taking herbs?",
];

const currentPromptIndex = ref(0);
const showPromptBubble = ref(true);

let promptInterval = null;
let promptAutoShowTimeout = null;

const fallbackQnas = [
  {
    id: "granulated-herbs",
    q: "What are granulated herbs?",
    a: `Granulated herbs are concentrated, water-soluble extracts of Traditional Chinese Medicine herbs.

They are made by boiling raw herbs, then spray-drying the liquid into powder or granules.

They are convenient because no long boiling is required. You can dissolve them in hot water and drink.`,
  },
  {
    id: "take-granules",
    q: "How do I take granulated herbs?",
    a: `Measure the prescribed number of flat spoons into a cup.

Add around 150 ml of hot water. Do not microwave.

Stir well and drink the mixture. It is okay if some granules do not fully dissolve.

Do not take them on an empty stomach or within 1 hour before sleep.`,
  },
  {
    id: "take-pills",
    q: "How do I take herbal pills?",
    a: `Take the prescribed amount with warm water.

Timing is similar to granules: twice daily, around 40 minutes after meals, or choose two times from 10 AM, 4 PM, and 9 PM.

Avoid taking herbal pills when hungry or within 1 hour before sleep.`,
  },
  {
    id: "side-effects",
    q: "What if I experience side effects?",
    a: `Some people may experience temporary worsening of symptoms, mild allergic reactions, stomach discomfort, cramping, loose stools, or nausea.

If symptoms are unexpected or severe, stop taking the herbs and seek medical advice.`,
  },
  {
    id: "foods-to-avoid",
    q: "What foods should I avoid while taking herbs?",
    a: `It is usually best to avoid raw or cold foods, fried foods, spicy foods, alcohol, seafood, lamb, and certain hot-natured fruits such as durian, mango, lychee, pineapple, and apricots.

Depending on your condition, your practitioner may give more specific food restrictions.`,
  },
  {
    id: "sleep-lifestyle",
    q: "How should I manage sleep and lifestyle?",
    a: `Aim for at least 8 hours of sleep.

A helpful routine is sleeping by 10 PM and waking by 6 AM.

Balance work and rest, avoid overworking, keep warm after sweating, avoid smoking, and try to stay calm and relaxed.`,
  },
];

const faqDatabase = ref([]);

function openChat() {
  isOpen.value = true;
  showPromptBubble.value = false;

  if (!faqDatabase.value.length && !faqLoading.value) {
    fetchQnasFromFirestore();
  }

  scrollToBottom();
}

function closeChat() {
  isOpen.value = false;
  showLeadModal.value = false;
  resetPromptAutoShow();
}

function startPromptRotation() {
  stopPromptRotation();

  promptInterval = setInterval(() => {
    if (!isOpen.value && showPromptBubble.value) {
      currentPromptIndex.value =
        (currentPromptIndex.value + 1) % rotatingPrompts.length;
    }
  }, 3500);
}

function stopPromptRotation() {
  if (promptInterval) {
    clearInterval(promptInterval);
    promptInterval = null;
  }
}

function dismissPrompt() {
  showPromptBubble.value = false;

  if (promptAutoShowTimeout) {
    clearTimeout(promptAutoShowTimeout);
  }

  promptAutoShowTimeout = setTimeout(() => {
    if (!isOpen.value) {
      showPromptBubble.value = true;
    }
  }, 9000);
}

function resetPromptAutoShow() {
  if (promptAutoShowTimeout) {
    clearTimeout(promptAutoShowTimeout);
  }

  promptAutoShowTimeout = setTimeout(() => {
    if (!isOpen.value) {
      showPromptBubble.value = true;
    }
  }, 1200);
}

async function fetchQnasFromFirestore() {
  faqLoading.value = true;

  try {
    const chatbotDocRef = doc(db, "siteContent", "chatbotQNA");
    const chatbotDocSnap = await getDoc(chatbotDocRef);

    if (chatbotDocSnap.exists()) {
      const data = chatbotDocSnap.data();

      const quickQuestions = Array.isArray(data.quickQuestions)
        ? data.quickQuestions
        : [];
      const items = Array.isArray(data.items) ? data.items : [];

      const sourceItems = quickQuestions.length ? quickQuestions : items;

      if (sourceItems.length) {
        faqDatabase.value = normalizeQnaItems(sourceItems);
        return;
      }
    }

    const qnaPageDocRef = doc(db, "siteContent", "qnaPage");
    const qnaPageDocSnap = await getDoc(qnaPageDocRef);

    if (qnaPageDocSnap.exists()) {
      const data = qnaPageDocSnap.data();
      const qnaItems = extractQnasFromQnaPage(data);

      if (qnaItems.length) {
        faqDatabase.value = normalizeQnaItems(qnaItems);
        return;
      }
    }

    faqDatabase.value = normalizeQnaItems(fallbackQnas);
  } catch (error) {
    console.error("Failed to load Herbsie QNA:", error);
    faqDatabase.value = normalizeQnaItems(fallbackQnas);
  } finally {
    faqLoading.value = false;
  }
}

function extractQnasFromQnaPage(data) {
  if (Array.isArray(data.sections) && data.sections.length) {
    return data.sections
      .filter((section) => section.visible !== false && section.type === "qna")
      .flatMap((section) => (Array.isArray(section.items) ? section.items : []))
      .filter((item) => item.visible !== false);
  }

  if (Array.isArray(data.qnaItems)) {
    return data.qnaItems.filter((item) => item.visible !== false);
  }

  return [];
}

function normalizeQnaItems(items) {
  return items
    .map((item, index) => {
      const question = item.question || item.q || "";
      const rawAnswer = item.answer || item.a || "";
      const plainAnswer = answerToPlainText(rawAnswer);

      return {
        id: item.id || `qna_${index}`,
        q: question,
        a: formatAnswerForHtml(plainAnswer),
        plainAnswer,
        keywords: buildKeywords(question, plainAnswer),
      };
    })
    .filter((item) => item.q.trim() && item.plainAnswer.trim());
}

function answerToPlainText(answer) {
  if (typeof answer === "string") {
    return answer;
  }

  if (!Array.isArray(answer)) {
    return "";
  }

  return answer
    .map((block) => {
      if (!block) return "";

      if (block.type === "paragraph" || block.type === "subheading") {
        return block.text || "";
      }

      if (block.type === "list" && Array.isArray(block.items)) {
        return block.items.map((item) => `• ${item}`).join("\n");
      }

      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function formatAnswerForHtml(answer) {
  const safe = escapeHtml(answer);

  return safe
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br>")
    .replaceAll("<br><br><br>", "<br><br>");
}

function buildKeywords(question, answer) {
  const combined = `${question} ${answer}`.toLowerCase();

  const words = combined
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => word.length >= 3);

  return [...new Set(words)].slice(0, 40);
}

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function getWords(text) {
  return normalize(text).split(" ").filter(Boolean);
}

function findFaqMatch(rawText) {
  const text = normalize(rawText);
  const words = getWords(rawText);

  let bestMatch = null;
  let bestScore = 0;

  for (const item of faqDatabase.value) {
    let score = 0;
    const questionText = normalize(item.q);
    const answerText = normalize(item.plainAnswer || item.a);

    if (questionText && text.includes(questionText)) {
      score += 10;
    }

    if (text && questionText.includes(text)) {
      score += 5;
    }

    for (const keyword of item.keywords || []) {
      const normalizedKeyword = normalize(keyword);
      if (!normalizedKeyword) continue;

      if (text.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(" ").length > 1 ? 4 : 2;
      }
    }

    for (const word of words) {
      if (word.length >= 4 && questionText.includes(word)) {
        score += 1;
      }

      if (word.length >= 5 && answerText.includes(word)) {
        score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

function pushUserMessage(text) {
  messages.value.push({
    role: "user",
    text: escapeHtml(text),
  });
}

function pushBotMessage(text) {
  messages.value.push({
    role: "bot",
    text,
  });
}

function handleSelect(item) {
  if (isSubmitting.value) return;

  pushUserMessage(item.q);

  setTimeout(async () => {
    pushBotMessage(item.a);
    await scrollToBottom();
  }, 250);
}

async function handleSend() {
  const raw = userInput.value.trim();
  if (!raw || isSubmitting.value) return;

  if (!faqDatabase.value.length && !faqLoading.value) {
    await fetchQnasFromFirestore();
  }

  pushUserMessage(raw);
  userInput.value = "";

  const matchedItem = findFaqMatch(raw);

  setTimeout(async () => {
    if (matchedItem) {
      pushBotMessage(matchedItem.a);
    } else {
      pendingQuestion.value = raw;
      resetLeadForm();

      pushBotMessage(
        `I couldn't find a close match for that question.<br><br>Please leave your details in the form and our team will contact you directly.`,
      );

      showLeadModal.value = true;
    }

    await scrollToBottom();
  }, 250);
}

function handleLeadBack() {
  showLeadModal.value = false;
  resetLeadForm();
}

function resetLeadForm() {
  leadForm.value = {
    name: "",
    email: "",
    phone: "",
  };

  fieldErrors.value = {
    name: "",
    email: "",
    phone: "",
  };
}

function validateLeadForm() {
  const errors = {
    name: "",
    email: "",
    phone: "",
  };

  if (!leadForm.value.name || leadForm.value.name.length < 2) {
    errors.name = "Please enter your full name.";
  }

  if (!isValidEmail(leadForm.value.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!isValidPhone(leadForm.value.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  fieldErrors.value = errors;

  return !errors.name && !errors.email && !errors.phone;
}

async function submitLead() {
  if (!validateLeadForm()) return;

  try {
    isSubmitting.value = true;

    await addDoc(collection(db, "chatbotLeads"), {
      name: leadForm.value.name,
      email: leadForm.value.email,
      phone: leadForm.value.phone,
      question: pendingQuestion.value,
      source: "HerbsieBot",
      status: "new",
      pageUrl: window.location.href,
      createdAt: serverTimestamp(),
    });

    showLeadModal.value = false;

    pushBotMessage(
      `Thank you — your enquiry has been sent successfully.<br><br>Our team will contact you soon via email or phone.`,
    );

    pendingQuestion.value = "";
    resetLeadForm();
    await scrollToBottom();
  } catch (error) {
    console.error("Failed to save lead:", error);

    pushBotMessage(
      `Sorry, something went wrong while sending your enquiry.<br><br>Please try again, or contact us directly.`,
    );

    await scrollToBottom();
  } finally {
    isSubmitting.value = false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[+\d\s()-]{6,20}$/.test(value);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function scrollToBottom() {
  await nextTick();

  if (scrollBox.value) {
    scrollBox.value.scrollTop = scrollBox.value.scrollHeight;
  }
}

onMounted(() => {
  startPromptRotation();
  fetchQnasFromFirestore();
});

onBeforeUnmount(() => {
  stopPromptRotation();

  if (promptAutoShowTimeout) {
    clearTimeout(promptAutoShowTimeout);
  }
});
</script>

<style scoped>
.herbsie-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: Inter, "Helvetica Neue", Arial, sans-serif;
}

.floating-entry {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.floating-prompt {
  position: absolute;
  right: 14px;
  bottom: 78px;
  min-width: 250px;
  max-width: 300px;
  background: #2ca56f;
  color: #ffffff;
  border-radius: 24px;
  padding: 16px 48px 16px 22px;
  box-shadow:
    0 18px 34px rgba(16, 69, 44, 0.22),
    0 6px 16px rgba(10, 62, 46, 0.1);
  cursor: pointer;
  user-select: none;
  border: 1px solid rgba(10, 45, 32, 0.08);
  backdrop-filter: blur(6px);
}

.floating-prompt::after {
  content: "";
  position: absolute;
  right: 34px;
  bottom: -10px;
  width: 18px;
  height: 18px;
  background: #2ca56f;
  transform: rotate(45deg);
  border-radius: 4px;
}

.prompt-text {
  font-size: 16px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: normal;
}

.prompt-close {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(230, 237, 251, 0.35);
  color: #ffffff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 18px rgba(17, 55, 35, 0.2);
}

.floating-ball {
  position: relative;
  width: 66px;
  height: 66px;
  background: #2f5b43;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow:
    0 14px 26px rgba(19, 61, 38, 0.28),
    0 4px 12px rgba(0, 0, 0, 0.16);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  animation: herbsieFloat 3.2s ease-in-out infinite;
}

.floating-ball:hover {
  transform: scale(1.06);
  box-shadow:
    0 18px 34px rgba(44, 87, 194, 0.34),
    0 8px 18px rgba(0, 0, 0, 0.18);
}

@keyframes herbsieFloat {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-7px);
  }

  100% {
    transform: translateY(0px);
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-ball img {
  width: 38px;
  height: 38px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.15));
}

.floating-badge {
  position: absolute;
  top: -4px;
  right: -3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  color: #2ca56f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
  border: 2px solid #d9f5e5;
}

.chat-window {
  width: 360px;
  height: 550px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.chat-header {
  background: #325b49;
  color: white;
  padding: 15px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-elegant {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #478067, #1e382d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  font-size: 20px;
  font-style: italic;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.status {
  font-size: 12px;
  color: #aebdb6;
}

.close-btn {
  background: none;
  border: none;
  color: #aebdb6;
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.chat-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f7f9f8;
}

.msg-row {
  margin-bottom: 12px;
  display: flex;
}

.msg-row.bot {
  justify-content: flex-start;
}

.msg-row.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.bot .bubble {
  background: white;
  color: #325b49;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.user .bubble {
  background: #325b49;
  color: white;
  border-bottom-right-radius: 2px;
}

.options-area {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background: white;
}

.tags-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #72856e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tags-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 130px;
  overflow-y: auto;
  padding-right: 5px;
}

.tags-scroll::-webkit-scrollbar {
  width: 4px;
}

.tags-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tags-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tags-scroll::-webkit-scrollbar-thumb:hover {
  background: #325b49;
}

.tag-btn {
  background: white;
  border: 1px solid #325b49;
  color: #325b49;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: #325b49;
  color: white;
}

.tag-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.empty-tags {
  color: #789083;
  font-size: 13px;
  line-height: 1.5;
  padding: 8px 2px;
}

.input-area {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  display: flex;
  background: white;
}

.input-area input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 9px 14px;
  outline: none;
  font-size: 14px;
  color: #325b49;
}

.input-area input:focus {
  border-color: #325b49;
}

.input-area input:disabled {
  background: #f4f4f4;
  cursor: not-allowed;
}

.send-btn {
  width: 38px;
  height: 38px;
  margin-left: 8px;
  border-radius: 50%;
  border: none;
  background: #325b49;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.lead-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22, 35, 28, 0.32);
  backdrop-filter: blur(6px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lead-modal {
  width: min(440px, 100%);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 26px 70px rgba(25, 55, 40, 0.2);
  border: 1px solid rgba(50, 91, 73, 0.08);
}

.lead-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.lead-kicker {
  margin: 0 0 5px;
  color: #6c8977;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.lead-modal h3 {
  margin: 0;
  color: #2f5b43;
  font-size: 24px;
}

.lead-close-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: #edf1ed;
  color: #325b49;
  cursor: pointer;
  font-size: 20px;
}

.lead-desc {
  margin: 0 0 16px;
  color: #64796c;
  font-size: 14px;
  line-height: 1.6;
}

.lead-question-box {
  border-radius: 18px;
  background: #f5f8f5;
  border: 1px solid rgba(50, 91, 73, 0.08);
  padding: 12px 14px;
  margin-bottom: 16px;
}

.lead-question-label {
  display: block;
  color: #6d8276;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.lead-question-box p {
  margin: 0;
  color: #325b49;
  font-size: 14px;
  line-height: 1.5;
}

.lead-form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lead-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lead-field label {
  color: #325b49;
  font-size: 13px;
  font-weight: 700;
}

.lead-field input {
  border: 1px solid #d6e0d9;
  border-radius: 14px;
  padding: 11px 13px;
  color: #325b49;
  font-size: 14px;
  outline: none;
}

.lead-field input:focus {
  border-color: #325b49;
  box-shadow: 0 0 0 3px rgba(50, 91, 73, 0.08);
}

.field-error {
  color: #c35f77;
  font-size: 12px;
}

.lead-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.back-btn,
.submit-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.back-btn {
  background: #edf1ed;
  color: #325b49;
}

.submit-btn {
  background: #325b49;
  color: white;
}

.back-btn:disabled,
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.prompt-fade-enter-active,
.prompt-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.prompt-fade-enter-from,
.prompt-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 600px) {
  .herbsie-container {
    right: 14px;
    bottom: 14px;
  }

  .chat-window {
    width: calc(100vw - 28px);
    height: min(560px, calc(100vh - 40px));
  }

  .floating-prompt {
    min-width: 220px;
    max-width: 260px;
  }
}
</style>
