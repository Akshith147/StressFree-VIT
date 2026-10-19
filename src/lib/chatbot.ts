import chatbotData from '../data/chatbot.json';

export interface ChatTopic {
  topic: string;
  label: string;
  keywords: string[];
  replies: string[];
}

export interface ChatData {
  greeting: string;
  starters: string[];
  crisis: { keywords: string[]; reply: string };
  topics: ChatTopic[];
  fallback: string;
}

export interface BotReply {
  text: string;
  crisis: boolean; // true → the UI shows the CrisisCard
  topic: string | null; // matched topic id, null for crisis or fallback
}

// Puts messages and keywords into the same simple form so "EXAMS!!!" and "exams" compare equal.
// Apostrophes are kept so "can't" and "cant" stay separate keywords.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'") // phone keyboards type curly apostrophes
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Padding both sides with spaces means a keyword only matches as a whole word or phrase:
// " cat " is inside " my cat exam " but not inside " category ".
export function containsKeyword(normalizedMessage: string, keyword: string): boolean {
  const normalizedKeyword = normalize(keyword);
  if (normalizedKeyword === '') return false;
  return ` ${normalizedMessage} `.includes(` ${normalizedKeyword} `);
}

// Counts different keywords only, so a keyword listed twice in the file can't score twice.
function scoreTopic(normalizedMessage: string, keywords: string[]): number {
  const uniqueKeywords = new Set(keywords.map(normalize));
  let score = 0;
  for (const keyword of uniqueKeywords) {
    if (containsKeyword(normalizedMessage, keyword)) score++;
  }
  return score;
}

export function getReply(
  message: string,
  data: ChatData = chatbotData,
  random: () => number = Math.random,
): BotReply {
  const fallback: BotReply = { text: data.fallback, crisis: false, topic: null };
  const text = normalize(message);
  if (text === '') return fallback;

  // Crisis is checked before any topic so a safety reply can never be outscored.
  if (data.crisis.keywords.some((keyword) => containsKeyword(text, keyword))) {
    return { text: data.crisis.reply, crisis: true, topic: null };
  }

  let best: ChatTopic | null = null;
  let bestScore = 0;
  for (const topic of data.topics) {
    const score = scoreTopic(text, topic.keywords);
    // Only a strictly higher score replaces the leader, so ties go to the topic earlier in the file.
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  if (best === null || best.replies.length === 0) return fallback;

  // Math.min keeps the index in range even if random() ever returns exactly 1.
  const index = Math.min(Math.floor(random() * best.replies.length), best.replies.length - 1);
  return { text: best.replies[index], crisis: false, topic: best.topic };
}
