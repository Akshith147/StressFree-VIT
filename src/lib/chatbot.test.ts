import { describe, expect, it } from 'vitest';
import { containsKeyword, getReply, normalize, type ChatData } from './chatbot';
import realData from '../data/chatbot.json';

// Small fixed data set so these tests don't break when the real content changes.
const fixture: ChatData = {
  greeting: 'Test greeting',
  starters: ['one', 'two', 'three', 'four'],
  crisis: {
    keywords: ['want to die', 'kill myself'],
    reply: 'CRISIS REPLY',
  },
  topics: [
    {
      topic: 'exam_stress',
      label: 'Exam stress',
      keywords: ['exam', 'exams', 'cat', 'study pressure'],
      replies: ['exam reply 1', 'exam reply 2', 'exam reply 3'],
    },
    {
      topic: 'sleep',
      label: 'Sleep',
      keywords: ['sleep', "can't sleep", 'tired'],
      replies: ['sleep reply'],
    },
    {
      topic: 'lonely',
      label: 'Loneliness',
      keywords: ['lonely', 'alone'],
      replies: ['lonely reply'],
    },
  ],
  fallback: 'FALLBACK REPLY',
};

// Always picks the first reply, so results are predictable.
const first = () => 0;

describe('normalize', () => {
  it('lowercases, strips punctuation and collapses spaces', () => {
    expect(normalize('  EXAMS!!!   are   HARD.  ')).toBe('exams are hard');
  });

  it('keeps apostrophes and turns curly ones into straight ones', () => {
    expect(normalize('I can’t sleep')).toBe("i can't sleep");
  });

  it('turns hyphens into spaces', () => {
    expect(normalize('self-harm')).toBe('self harm');
  });
});

describe('containsKeyword', () => {
  it('matches whole words only', () => {
    expect(containsKeyword('my cat exam', 'cat')).toBe(true);
    expect(containsKeyword('this category is hard', 'cat')).toBe(false);
    expect(containsKeyword('i have two cats', 'cat')).toBe(false);
  });

  it('matches a phrase at the start or end of the message', () => {
    expect(containsKeyword('study pressure is too much', 'study pressure')).toBe(true);
    expect(containsKeyword('so much study pressure', 'study pressure')).toBe(true);
  });

  it('normalizes the keyword too', () => {
    expect(containsKeyword('so much study pressure', 'Study-Pressure')).toBe(true);
  });

  it('never matches an empty keyword', () => {
    expect(containsKeyword('hello there', '')).toBe(false);
    expect(containsKeyword('hello there', '!!')).toBe(false);
  });
});

describe('getReply', () => {
  it('returns the crisis reply for a crisis keyword', () => {
    expect(getReply('I want to die.', fixture, first)).toEqual({
      text: 'CRISIS REPLY',
      crisis: true,
      topic: null,
    });
  });

  it('puts crisis ahead of a matching topic', () => {
    const reply = getReply('exams are making me want to die', fixture, first);
    expect(reply.crisis).toBe(true);
    expect(reply.topic).toBeNull();
  });

  it('matches a topic', () => {
    const reply = getReply("I'm so stressed about my exam", fixture, first);
    expect(reply).toEqual({ text: 'exam reply 1', crisis: false, topic: 'exam_stress' });
  });

  it('ignores case and punctuation', () => {
    expect(getReply('EXAMS!!!', fixture, first).topic).toBe('exam_stress');
  });

  it('does not match part of a word', () => {
    expect(getReply('this category is hard', fixture, first).topic).toBeNull();
  });

  it('matches a phrase keyword', () => {
    expect(getReply('so much study pressure', fixture, first).topic).toBe('exam_stress');
  });

  it('picks the topic with the most different keywords', () => {
    // sleep matches "tired", "can't sleep" and "sleep" (3); exam_stress matches "exam" (1)
    const reply = getReply("I'm tired and can't sleep before my exam", fixture, first);
    expect(reply.topic).toBe('sleep');
  });

  it('gives a tie to the topic that comes first in the file', () => {
    expect(getReply('lonely before my exam', fixture, first).topic).toBe('exam_stress');

    const reversed: ChatData = { ...fixture, topics: [...fixture.topics].reverse() };
    expect(getReply('lonely before my exam', reversed, first).topic).toBe('lonely');
  });

  it('does not count the same keyword twice', () => {
    // "lonely" twice in the message still scores 1, so the tie still goes to exam_stress
    expect(getReply('lonely lonely exam', fixture, first).topic).toBe('exam_stress');
  });

  it('returns the fallback when nothing matches', () => {
    expect(getReply('hello there', fixture, first)).toEqual({
      text: 'FALLBACK REPLY',
      crisis: false,
      topic: null,
    });
  });

  it('returns the fallback for an empty or punctuation-only message', () => {
    expect(getReply('', fixture, first).text).toBe('FALLBACK REPLY');
    expect(getReply('   !!!  ', fixture, first).text).toBe('FALLBACK REPLY');
  });

  it('uses random to choose the reply', () => {
    expect(getReply('exam', fixture, () => 0).text).toBe('exam reply 1');
    expect(getReply('exam', fixture, () => 0.99).text).toBe('exam reply 3');
  });

  it('uses the real chatbot.json when no data is passed', () => {
    expect(getReply('').text).toBe(realData.fallback);
  });
});

// Catches mistakes when new content is pasted into chatbot.json.
describe('chatbot.json content', () => {
  const data: ChatData = realData;

  it('has a greeting and a fallback', () => {
    expect(data.greeting.trim()).not.toBe('');
    expect(data.fallback.trim()).not.toBe('');
  });

  it('has at least 4 starters', () => {
    expect(data.starters.length).toBeGreaterThanOrEqual(4);
  });

  it('has crisis keywords and a crisis reply', () => {
    expect(data.crisis.keywords.length).toBeGreaterThan(0);
    expect(data.crisis.reply.trim()).not.toBe('');
  });

  it('gives every topic a unique id', () => {
    const ids = data.topics.map((t) => t.topic);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(data.topics.map((t) => [t.topic, t] as const))(
    'topic %s has an id, a label, keywords and replies',
    (_id, topic) => {
      expect(topic.topic.trim()).not.toBe('');
      expect(topic.label.trim()).not.toBe('');
      expect(topic.keywords.length).toBeGreaterThan(0);
      expect(topic.replies.length).toBeGreaterThan(0);
      for (const reply of topic.replies) expect(reply.trim()).not.toBe('');
    },
  );

  // Whole-word matching misses other word forms, so the list needs them spelled out.
  // If one of these fails after a content change, the helpline card would stop showing for it.
  it.each([
    'I feel suicidal',
    "I'm tired of living",
    'I keep thinking about killing myself',
    'i wanna die',
    'I’ve been self-harming',
    "I don't want to live anymore",
    "Honestly I'd be better off dead",
  ])('treats "%s" as a crisis', (message) => {
    expect(getReply(message, data).crisis).toBe(true);
  });

  it('has no empty keywords', () => {
    const allKeywords = [...data.crisis.keywords, ...data.topics.flatMap((t) => t.keywords)];
    // normalize() so "  " or "!!" also count as empty
    expect(allKeywords.filter((k) => normalize(k) === '')).toEqual([]);
  });
});
