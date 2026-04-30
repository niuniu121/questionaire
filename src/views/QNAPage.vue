<template>
  <div class="qna-page" :style="{ background: currentBgGradient }">
    <div class="qna-page-content">
      <section
        class="qna-hero"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)"
      >
        <div class="container">
          <p class="eyebrow">{{ pageContent.hero.eyebrow }}</p>
          <h1 class="hero-title">{{ pageContent.hero.title }}</h1>
          <p class="hero-subtitle">
            {{ pageContent.hero.subtitle }}
          </p>
        </div>
      </section>

      <section
        class="qna-content"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #edf4eb 0%, #f4f8f2 40%, #f7eef1 100%)"
      >
        <div class="container">
          <div class="qna-shell">
            <div class="qna-intro-card">
              <div class="intro-icon-wrap">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#325B49"
                    stroke-width="1.8"
                  />
                  <path
                    d="M8.5 12.2L10.8 14.5L15.8 9.2"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2>{{ pageContent.beforeStart.title }}</h2>
                <p>
                  {{ pageContent.beforeStart.description }}
                </p>
              </div>
            </div>

            <div v-if="loading" class="qna-state-card">
              Loading questions and answers...
            </div>

            <div v-else-if="errorMessage" class="qna-state-card error">
              {{ errorMessage }}
            </div>

            <div
              v-else-if="pageContent.qnaItems.length === 0"
              class="qna-state-card"
            >
              QNA content will be available soon.
            </div>

            <div v-else class="qna-list">
              <article
                v-for="(item, index) in pageContent.qnaItems"
                :key="item.id || item.question || index"
                class="qna-item"
                :class="{ open: openIndex === index }"
              >
                <button
                  class="qna-question"
                  type="button"
                  @click="toggleItem(index)"
                  :aria-expanded="openIndex === index"
                >
                  <span class="qna-question-text">{{ item.question }}</span>

                  <span class="qna-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <transition name="qna-expand">
                  <div v-if="openIndex === index" class="qna-answer">
                    <template
                      v-for="(block, blockIndex) in normaliseAnswerBlocks(
                        item.answer,
                      )"
                      :key="blockIndex"
                    >
                      <p v-if="block.type === 'paragraph'">
                        {{ block.text }}
                      </p>

                      <div
                        v-else-if="block.type === 'subheading'"
                        class="answer-subheading"
                      >
                        {{ block.text }}
                      </div>

                      <ul v-else-if="block.type === 'list'" class="answer-list">
                        <li v-for="point in block.items" :key="point">
                          {{ point }}
                        </li>
                      </ul>
                    </template>
                  </div>
                </transition>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        class="qna-food-section"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #f7eef1 0%, #f7f0f3 45%, #f5dfe6 100%)"
      >
        <div class="container">
          <div class="qna-shell food-shell">
            <div class="qna-intro-card">
              <div class="intro-icon-wrap">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6.5 4.5V11.5C6.5 13 7.6 14.2 9 14.4V20"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M11.5 4.5V20"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M16 4.5C18.2 6.2 18.9 9.7 18.3 12.4C17.9 14.2 16.8 15.2 15.5 15.4V20"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2>{{ pageContent.foodSection.title }}</h2>
                <p>
                  {{ pageContent.foodSection.description }}
                </p>
              </div>
            </div>

            <div
              v-if="pageContent.avoidGroups.length === 0"
              class="qna-state-card"
            >
              Food guidance will be available soon.
            </div>

            <div v-else class="food-grid">
              <article
                v-for="group in pageContent.avoidGroups"
                :key="group.id || group.title"
                class="food-card"
              >
                <h3>{{ group.title }}</h3>
                <ul>
                  <li v-for="food in group.items" :key="food">
                    {{ food }}
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        class="qna-lifestyle-section"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #f5dfe6 0%, #efd1db 52%, #ead0d8 100%)"
      >
        <div class="container">
          <div class="qna-shell lifestyle-shell">
            <div class="qna-intro-card">
              <div class="intro-icon-wrap">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 11.66 20.9812 11.3244 20.9445 10.9942C19.7928 12.2225 18.1561 13 16.3333 13C12.8355 13 10 10.1645 10 6.66667C10 4.84394 10.7775 3.2072 12.0058 2.05548C11.6756 2.0188 11.34 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20"
                    stroke="#325B49"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2>{{ pageContent.lifestyleSection.title }}</h2>
                <p>
                  {{ pageContent.lifestyleSection.description }}
                </p>
              </div>
            </div>

            <div
              v-if="pageContent.lifestyleCards.length === 0"
              class="qna-state-card"
            >
              Lifestyle guidance will be available soon.
            </div>

            <div v-else class="lifestyle-grid">
              <article
                v-for="card in pageContent.lifestyleCards"
                :key="card.id || card.title"
                class="lifestyle-card"
              >
                <h3>{{ card.title }}</h3>
                <p>
                  {{ card.description }}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <div
        class="qna-footer-wrap"
        :ref="setSectionRef"
        data-bggradient="linear-gradient(180deg, #ead0d8 0%, #f5dfe6 52%, #efd1db 100%)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const openIndex = ref(-1);
const loading = ref(true);
const errorMessage = ref("");

const currentBgGradient = ref(
  "linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)",
);

const sectionRefs = ref([]);
let observer = null;

const defaultPageContent = {
  hero: {
    eyebrow: "Herbal Medicine Guide",
    title: "Questions & Answers",
    subtitle:
      "Practical guidance on how to take granulated herbs and herbal pills, what to avoid, and how to support your treatment through food, rest, and daily habits.",
  },

  beforeStart: {
    title: "Before You Start",
    description:
      "Please follow your practitioner’s instructions. If you feel unwell, stop taking the herbs and seek medical advice when needed.",
  },

  qnaItems: [
    {
      id: "qna_granulated_herbs",
      question: "What are granulated herbs?",
      visible: true,
      answer: [
        {
          type: "paragraph",
          text: "Granulated herbs are concentrated, water-soluble extracts of Traditional Chinese Medicine (TCM) herbs.",
        },
        {
          type: "subheading",
          text: "They are made by:",
        },
        {
          type: "list",
          items: [
            "Boiling raw herbs into a decoction",
            "Spray-drying the liquid into powder or granules",
            "Often including a small amount of starch as a carrier",
          ],
        },
        {
          type: "subheading",
          text: "Why use them?",
        },
        {
          type: "list",
          items: [
            "Convenient alternative to traditional herbal teas",
            "No long boiling required",
            "Simply dissolve in hot water and drink",
          ],
        },
      ],
    },
    {
      id: "qna_take_granulated_herbs",
      question: "How do I take granulated herbs?",
      visible: true,
      answer: [
        {
          type: "list",
          items: [
            "Measure the prescribed number of flat spoons into a cup.",
            "Add around 150 ml of hot water. Do not microwave.",
            "Stir well and drink the mixture.",
            "It is okay if some granules do not fully dissolve.",
          ],
        },
        {
          type: "subheading",
          text: "When to take:",
        },
        {
          type: "list",
          items: [
            "Option 1: Take twice daily, 40 minutes after meals.",
            "Option 2: Choose any two times: 10 AM, 4 PM, or 9 PM.",
          ],
        },
        {
          type: "subheading",
          text: "Important:",
        },
        {
          type: "list",
          items: [
            "Do not take on an empty stomach.",
            "Do not take within 1 hour before sleep.",
          ],
        },
      ],
    },
    {
      id: "qna_herbal_pills",
      question: "How do I take herbal pills?",
      visible: true,
      answer: [
        {
          type: "paragraph",
          text: "Take the prescribed amount with warm water.",
        },
        {
          type: "subheading",
          text: "Timing options:",
        },
        {
          type: "list",
          items: [
            "Option 1: Twice daily, 40 minutes after meals.",
            "Option 2: Choose two times from 10 AM, 4 PM, or 9 PM.",
          ],
        },
        {
          type: "subheading",
          text: "Important:",
        },
        {
          type: "list",
          items: [
            "Avoid taking herbal pills when hungry.",
            "Avoid taking herbal pills within 1 hour before sleep.",
          ],
        },
      ],
    },
    {
      id: "qna_side_effects",
      question: "What if I experience side effects?",
      visible: true,
      answer: [
        {
          type: "subheading",
          text: "Some people may experience:",
        },
        {
          type: "list",
          items: [
            "Temporary worsening of symptoms",
            "Mild allergic reactions",
            "Stomach discomfort or cramping",
            "Loose stools",
            "Nausea",
          ],
        },
        {
          type: "subheading",
          text: "Rare but possible:",
        },
        {
          type: "list",
          items: [
            "Interaction with medications",
            "Effects on blood pressure, liver, or kidney function",
            "Changes in bleeding, clotting, or hormones",
          ],
        },
        {
          type: "subheading",
          text: "What to do:",
        },
        {
          type: "list",
          items: [
            "Stop taking the herbs.",
            "Seek medical advice if symptoms are unexpected or severe.",
          ],
        },
      ],
    },
    {
      id: "qna_awareness",
      question: "What should I be aware of while taking herbs?",
      visible: true,
      answer: [
        {
          type: "subheading",
          text: "Healthy eating:",
        },
        {
          type: "list",
          items: [
            "Eat warm, light, simple, and moderate meals.",
            "Warm: avoid cold food and drinks.",
            "Light: reduce salty, spicy, sweet, and sour foods.",
            "Simple: choose one main dish with one to two sides.",
            "Moderate: eat until around 70% full.",
          ],
        },
        {
          type: "subheading",
          text: "Focus on:",
        },
        {
          type: "list",
          items: ["Grains", "Vegetables", "Minimal meat"],
        },
      ],
    },
    {
      id: "qna_sleep_lifestyle",
      question: "How should I manage sleep and lifestyle?",
      visible: true,
      answer: [
        {
          type: "subheading",
          text: "Sleep well:",
        },
        {
          type: "list",
          items: [
            "Aim for at least 8 hours of sleep.",
            "The recommended routine is to sleep by 10 PM and wake by 6 AM.",
          ],
        },
      ],
    },
  ],

  foodSection: {
    title: "Foods to Avoid While Taking Herbs",
    description:
      "These foods may be unsuitable during herbal treatment depending on your condition and prescription.",
  },

  avoidGroups: [
    {
      id: "avoid_raw_cold",
      title: "Raw or cold foods (general category)",
      visible: true,
      items: [
        "Raw or cold foods",
        "Fermented glutinous rice",
        "Pickles",
        "Persimmon",
      ],
    },
    {
      id: "avoid_fried_spicy",
      title: "Fried & Spicy",
      visible: true,
      items: ["Fried foods", "Spicy foods", "Chili"],
    },
    {
      id: "avoid_poultry",
      title: "Poultry",
      visible: true,
      items: ["Chicken head", "Goose meat"],
    },
    {
      id: "avoid_seafood",
      title: "Seafood",
      visible: true,
      items: [
        "Shrimp",
        "Crab",
        "Hairtail",
        "Yellow croaker",
        "Pomfret",
        "Shellfish",
      ],
    },
    {
      id: "avoid_red_meats",
      title: "Red Meats & Exotic Meats",
      visible: true,
      items: ["Lamb", "Beef, especially for skin conditions", "Pig head meat"],
    },
    {
      id: "avoid_vegetables_herbs",
      title: "Certain Vegetables & Herbs",
      visible: true,
      items: [
        "Taro",
        "Chinese chives",
        "Mustard greens",
        "Bamboo shoots",
        "Eggplant",
      ],
    },
    {
      id: "avoid_fruits",
      title: "Tropical & Hot-Natured Fruits",
      visible: true,
      items: ["Apricots", "Durian", "Pineapple", "Mango", "Bayberry", "Lychee"],
    },
    {
      id: "avoid_alcohol",
      title: "Alcohol",
      visible: true,
      items: ["Alcoholic drinks"],
    },
  ],

  lifestyleSection: {
    title: "Rest, Lifestyle & Emotional Wellbeing",
    description:
      "Herbal treatment works best when supported by steady routines, adequate rest, and calm daily habits.",
  },

  lifestyleCards: [
    {
      id: "lifestyle_rest",
      title: "Rest & Lifestyle",
      description:
        "Balance work and rest, avoid overworking, keep warm after sweating, and avoid smoking.",
      visible: true,
    },
    {
      id: "lifestyle_emotional",
      title: "Emotional Wellbeing",
      description:
        "Maintain a positive mood, stay calm and relaxed, and avoid anger and stress where possible.",
      visible: true,
    },
  ],
};

const pageContent = ref(structuredClone(defaultPageContent));

const mergeWithDefaultContent = (remoteData) => {
  const remote = remoteData || {};

  return {
    hero: {
      ...defaultPageContent.hero,
      ...(remote.hero || {}),
    },

    beforeStart: {
      ...defaultPageContent.beforeStart,
      ...(remote.beforeStart || {}),
    },

    qnaItems: Array.isArray(remote.qnaItems)
      ? remote.qnaItems
          .filter((item) => item.visible !== false)
          .map((item, index) => ({
            id: item.id || `qna_${index}`,
            question: item.question || "",
            answer: Array.isArray(item.answer) ? item.answer : [],
            visible: item.visible ?? true,
          }))
          .filter((item) => item.question.trim())
      : defaultPageContent.qnaItems,

    foodSection: {
      ...defaultPageContent.foodSection,
      ...(remote.foodSection || {}),
    },

    avoidGroups: Array.isArray(remote.avoidGroups)
      ? remote.avoidGroups
          .filter((group) => group.visible !== false)
          .map((group, index) => ({
            id: group.id || `avoid_${index}`,
            title: group.title || "",
            items: Array.isArray(group.items)
              ? group.items.filter(Boolean)
              : [],
            visible: group.visible ?? true,
          }))
          .filter((group) => group.title.trim())
      : defaultPageContent.avoidGroups,

    lifestyleSection: {
      ...defaultPageContent.lifestyleSection,
      ...(remote.lifestyleSection || {}),
    },

    lifestyleCards: Array.isArray(remote.lifestyleCards)
      ? remote.lifestyleCards
          .filter((card) => card.visible !== false)
          .map((card, index) => ({
            id: card.id || `lifestyle_${index}`,
            title: card.title || "",
            description: card.description || "",
            visible: card.visible ?? true,
          }))
          .filter((card) => card.title.trim())
      : defaultPageContent.lifestyleCards,
  };
};

const fetchQnaPageContent = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const docRef = doc(db, "siteContent", "qnaPage");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      pageContent.value = structuredClone(defaultPageContent);
      return;
    }

    pageContent.value = mergeWithDefaultContent(docSnap.data());
  } catch (error) {
    console.error("Failed to load QNA page content:", error);
    errorMessage.value =
      "Failed to load QNA content. Showing default content for now.";
    pageContent.value = structuredClone(defaultPageContent);
  } finally {
    loading.value = false;
  }
};

const normaliseAnswerBlocks = (answer) => {
  if (!Array.isArray(answer)) return [];

  return answer
    .map((block) => {
      if (!block || !block.type) return null;

      if (block.type === "paragraph") {
        return {
          type: "paragraph",
          text: block.text || "",
        };
      }

      if (block.type === "subheading") {
        return {
          type: "subheading",
          text: block.text || "",
        };
      }

      if (block.type === "list") {
        return {
          type: "list",
          items: Array.isArray(block.items) ? block.items.filter(Boolean) : [],
        };
      }

      return null;
    })
    .filter(Boolean);
};

const toggleItem = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index;
};

const closeAllAnswers = () => {
  openIndex.value = -1;
};

const setSectionRef = (el) => {
  if (el && !sectionRefs.value.includes(el)) {
    sectionRefs.value.push(el);
  }
};

onMounted(async () => {
  window.scrollTo(0, 0);
  closeAllAnswers();

  await fetchQnaPageContent();
  await nextTick();

  const observerOptions = {
    root: null,
    rootMargin: "-10% 0px -25% 0px",
    threshold: 0.15,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentBgGradient.value =
          entry.target.dataset.bggradient ||
          "linear-gradient(180deg, #dfe7dc 0%, #e7efe4 52%, #eef4ec 100%)";
      }
    });
  }, observerOptions);

  sectionRefs.value.forEach((section) => {
    if (section instanceof Element) {
      observer.observe(section);
    }
  });
});

onBeforeRouteLeave(() => {
  closeAllAnswers();
});

onUnmounted(() => {
  closeAllAnswers();

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  sectionRefs.value = [];
});
</script>

<style scoped>
.qna-page {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
  transition: background 1.05s ease-in-out;
}

.qna-page::before,
.qna-page::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.qna-page::before {
  background:
    radial-gradient(
      circle at 10% 12%,
      rgba(94, 139, 115, 0.2) 0%,
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 18%,
      rgba(214, 139, 162, 0.12) 0%,
      transparent 28%
    ),
    radial-gradient(
      circle at 72% 82%,
      rgba(94, 139, 115, 0.1) 0%,
      transparent 24%
    );
  opacity: 0.95;
}

.qna-page::after {
  backdrop-filter: blur(1px);
  opacity: 0.5;
}

.qna-page-content {
  position: relative;
  z-index: 1;
}

.container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.qna-hero {
  padding: 72px 0 32px;
  background: transparent;
}

.eyebrow {
  margin: 0 0 10px;
  color: #5e8b73;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.05;
  font-weight: 800;
  color: #1f3328;
}

.hero-subtitle {
  margin: 16px 0 0;
  max-width: 720px;
  font-size: 18px;
  line-height: 1.65;
  color: #5f6f65;
}

.qna-content,
.qna-food-section,
.qna-lifestyle-section {
  padding: 22px 0 80px;
}

.qna-shell {
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 32px;
  box-shadow:
    0 20px 50px rgba(31, 51, 40, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 26px;
}

.qna-intro-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  background: linear-gradient(180deg, #f8faf7 0%, #f2f6f1 100%);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 24px;
  margin-bottom: 18px;
}

.intro-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 139, 115, 0.12);
  flex-shrink: 0;
}

.qna-intro-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #1f3328;
}

.qna-intro-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #64756a;
}

.qna-state-card {
  padding: 40px 24px;
  border-radius: 22px;
  text-align: center;
  color: #60776b;
  background: rgba(255, 255, 255, 0.7);
  border: 1px dashed rgba(50, 91, 73, 0.16);
  font-size: 16px;
}

.qna-state-card.error {
  color: #b55067;
  background: rgba(255, 240, 242, 0.82);
  border-color: rgba(181, 80, 103, 0.2);
}

.qna-list {
  display: grid;
  gap: 14px;
}

.qna-item {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(50, 91, 73, 0.08);
  border-radius: 22px;
  overflow: hidden;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease;
}

.qna-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(31, 51, 40, 0.08);
  border-color: rgba(50, 91, 73, 0.18);
}

.qna-item.open {
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(31, 51, 40, 0.1);
  border-color: rgba(50, 91, 73, 0.2);
}

.qna-question {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 22px 22px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.qna-question-text {
  font-size: 20px;
  line-height: 1.45;
  font-weight: 700;
  color: #24392d;
}

.qna-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(94, 139, 115, 0.1);
  color: #325b49;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease;
}

.qna-item.open .qna-icon {
  transform: rotate(180deg);
  background: rgba(94, 139, 115, 0.16);
}

.qna-answer {
  padding: 0 22px 22px;
  color: #4c5e54;
}

.qna-answer p {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.85;
}

.answer-subheading {
  margin: 16px 0 8px;
  color: #325b49;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 700;
}

.answer-subheading:first-child {
  margin-top: 0;
}

.answer-list {
  margin: 0 0 12px;
  padding-left: 20px;
  color: #4c5e54;
}

.answer-list li {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.75;
}

.answer-list li:last-child {
  margin-bottom: 0;
}

.food-shell,
.lifestyle-shell {
  margin-top: 0;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.food-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(50, 91, 73, 0.08);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(31, 51, 40, 0.08);
  border-color: rgba(50, 91, 73, 0.18);
}

.food-card h3 {
  margin: 0 0 12px;
  color: #24392d;
  font-size: 17px;
  line-height: 1.4;
}

.food-card ul {
  margin: 0;
  padding-left: 18px;
  color: #4c5e54;
}

.food-card li {
  margin-bottom: 7px;
  font-size: 15px;
  line-height: 1.65;
}

.food-card li:last-child {
  margin-bottom: 0;
}

.lifestyle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.lifestyle-card {
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(50, 91, 73, 0.08);
}

.lifestyle-card h3 {
  margin: 0 0 10px;
  color: #24392d;
  font-size: 20px;
  line-height: 1.4;
}

.lifestyle-card p {
  margin: 0;
  color: #4c5e54;
  font-size: 16px;
  line-height: 1.8;
}

.qna-footer-wrap {
  position: relative;
}

.qna-expand-enter-active,
.qna-expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.qna-expand-enter-from,
.qna-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 1024px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .qna-hero {
    padding: 56px 0 24px;
  }

  .container {
    width: min(100% - 24px, 1180px);
  }

  .qna-content,
  .qna-food-section,
  .qna-lifestyle-section {
    padding: 18px 0 64px;
  }

  .qna-shell {
    padding: 16px;
    border-radius: 22px;
  }

  .qna-intro-card {
    align-items: flex-start;
    padding: 18px;
    border-radius: 18px;
  }

  .intro-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .qna-question {
    padding: 18px 16px;
    gap: 12px;
  }

  .qna-question-text {
    font-size: 17px;
  }

  .qna-answer {
    padding: 0 16px 18px;
  }

  .qna-answer p,
  .answer-list li,
  .lifestyle-card p {
    font-size: 15px;
    line-height: 1.75;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .food-grid,
  .lifestyle-grid {
    grid-template-columns: 1fr;
  }

  .food-card,
  .lifestyle-card {
    padding: 18px;
    border-radius: 18px;
  }
}
</style>
