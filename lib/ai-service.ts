// ─── Abacus AI / LLM Integration ─────────────────────────────────────────────

const ABACUS_BASE_URL = process.env.ABACUS_AI_BASE_URL || 'https://routellm.abacus.ai/v1';
const ABACUS_MODEL = process.env.ABACUS_AI_MODEL || 'gemini-3-flash-preview';
const ABACUS_API_KEY = process.env.ABACUS_AI_API_KEY!;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

// ─── Core Chat Completion ─────────────────────────────────────────────────────

async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const response = await fetch(`${ABACUS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ABACUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || ABACUS_MODEL,
      messages,
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

// ─── JSON Extraction Helper ───────────────────────────────────────────────────

function extractJson(text: string): any {
  // Try to parse whole text first
  try {
    return JSON.parse(text);
  } catch {}

  // Try to find JSON block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {}
  }

  // Try to extract object/array
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {}
  }

  throw new Error('No valid JSON found in AI response');
}

// ─── Form Generation ──────────────────────────────────────────────────────────

export interface GenerationParams {
  name: string;
  description?: string;
  group_id: string;
  rank: string;
  questions_count: number;
  vibe: string;
  primary_color?: string;
  secondary_color?: string;
  instructions?: string;
}

export interface GeneratedQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[];
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string;
}

export interface GeneratedForm {
  questions: GeneratedQuestion[];
}

export async function generateApplicationForm(
  params: GenerationParams
): Promise<GeneratedForm> {
  const prompt = `You are an expert form designer for Roblox group applications.
Create a ${params.questions_count}-question application form with the following specifications:
- Application Name: ${params.name}
- Description: ${params.description || 'N/A'}
- Target Group ID: ${params.group_id}
- Target Rank: ${params.rank}
- Tone/Vibe: ${params.vibe}
${params.instructions ? `- Custom Instructions: ${params.instructions}` : ''}

Generate a diverse mix of questions using these types:
- multiple_choice: 4 options, one correct answer (index 0-3)
- short_answer: Open-ended question with grading criteria
- true_false: True/False question
- Max ${Math.min(3, Math.floor(params.questions_count / 3))} short_answer questions allowed

Rules:
1. Questions must be relevant to a Roblox group application
2. For multiple_choice: provide "options" array and "correct_answer" as index (0-3)
3. For short_answer: provide "grading_criteria" describing what a good answer looks like
4. For true_false: correct_answer is true or false (boolean)
5. Each question has max_score of 10

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "max_score": 10
    },
    {
      "id": "q2",
      "type": "short_answer",
      "text": "Open-ended question here",
      "max_score": 10,
      "grading_criteria": "What constitutes a good answer"
    },
    {
      "id": "q3",
      "type": "true_false",
      "text": "True or false statement",
      "correct_answer": true,
      "max_score": 10
    }
  ]
}`;

  const text = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { temperature: 0.75, max_tokens: 3000 }
  );

  const parsed = extractJson(text);

  // Validate and normalize
  const questions: GeneratedQuestion[] = (parsed.questions || []).map(
    (q: any, i: number) => ({
      id: q.id || `q${i + 1}`,
      type: q.type || 'multiple_choice',
      text: q.text || `Question ${i + 1}`,
      options: q.options,
      correct_answer: q.correct_answer,
      max_score: q.max_score || 10,
      grading_criteria: q.grading_criteria,
    })
  );

  return { questions };
}

// ─── Short Answer Batch Grading ───────────────────────────────────────────────

export interface ShortAnswerItem {
  id: string;
  question: string;
  answer: string;
  max_score: number;
  criteria?: string;
}

export interface GradingResult {
  id: string;
  score: number;
  feedback: string;
}

export async function batchGradeShortAnswers(
  items: ShortAnswerItem[]
): Promise<GradingResult[]> {
  if (items.length === 0) return [];

  const itemsText = items
    .map(
      (item, i) => `
ITEM ${i} (id="${item.id}")
Max Score: ${item.max_score}
Question: ${item.question}
Answer: ${item.answer}
Grading Criteria: ${item.criteria || 'General quality and relevance'}`
    )
    .join('\n\n---\n');

  const prompt = `You are an objective, fair grader for Roblox group applications.
Grade each short answer response. Be consistent and fair.

${itemsText}

Return ONLY valid JSON:
{
  "results": [
    {"id": "q1", "score": 8.5, "feedback": "Good answer, mentions key points"},
    ...
  ]
}

Rules:
- Score must be between 0 and max_score for each item
- Feedback must be 1-2 sentences, constructive and specific
- Be objective and base scoring on the criteria provided`;

  const text = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3, max_tokens: 1500 }
  );

  const parsed = extractJson(text);
  return parsed.results || [];
}
