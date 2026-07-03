import { useState } from 'react'
import { BrainCircuit, ClipboardList, FileText, HelpCircle, Sparkles } from 'lucide-react'

const tools = [
  { id: 'summary', label: 'Summarize Notes', icon: FileText },
  { id: 'quiz', label: 'Generate Quiz', icon: HelpCircle },
  { id: 'explain', label: 'Explain Topic Simply', icon: BrainCircuit },
  { id: 'plan', label: 'Create Study Plan', icon: ClipboardList },
]

const stopWords = new Set([
  'about',
  'after',
  'also',
  'because',
  'before',
  'could',
  'from',
  'have',
  'into',
  'like',
  'notes',
  'study',
  'that',
  'their',
  'then',
  'there',
  'this',
  'topic',
  'what',
  'when',
  'where',
  'with',
  'would',
])

const questionTemplates = [
  'What is the simplest definition of {keyword}?',
  'Why does {keyword} matter for the bigger topic?',
  'What is one example that proves you understand {keyword}?',
  'Which step in {keyword} is easiest to mix up?',
  'How would you explain {keyword} to a younger student?',
  'What detail about {keyword} should become a flashcard?',
  'What is a common mistake people make with {keyword}?',
  'How does {keyword} connect to {other}?',
  'What problem could you solve using {keyword}?',
  'What would change if {keyword} were missing?',
  'Which formula, date, term, or rule anchors {keyword}?',
  'What is one question your teacher might ask about {keyword}?',
]

const summaryOpeners = [
  'The core idea is',
  'The notes are mostly pointing toward',
  'A cleaner way to frame this is',
  'The useful pattern hiding in the notes is',
]

function extractKeywords(input) {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))

  const counts = words.reduce((map, word) => {
    map.set(word, (map.get(word) || 0) + 1)
    return map
  }, new Map())

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .map(([word]) => word)
    .slice(0, 6)
}

function titleCase(value) {
  return value
    .split(/[\s-]+/)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function pick(items, seed) {
  return items[Math.abs(seed) % items.length]
}

function fillQuestion(template, keywords, seed) {
  const keyword = titleCase(keywords[seed % keywords.length])
  const other = titleCase(keywords[(seed + 1) % keywords.length] || keywords[0])
  return template.replace('{keyword}', keyword).replace('{other}', other)
}

function buildMockResponse(tool, input, generationCount) {
  const cleanInput = input.trim()
  const keywords = extractKeywords(cleanInput)
  const safeKeywords = keywords.length ? keywords : ['main idea', 'practice', 'review']
  const topic = titleCase(safeKeywords.slice(0, 3).join(' '))
  const seed = generationCount + cleanInput.length + safeKeywords.join('').length

  if (tool === 'summary') {
    const opener = pick(summaryOpeners, seed)
    return `${opener} ${topic}.\n\n1. Main idea: ${titleCase(safeKeywords[0])} is the anchor to review first.\n2. Supporting detail: connect ${titleCase(safeKeywords[1] || safeKeywords[0])} to a concrete example.\n3. Possible gap: check whether ${titleCase(safeKeywords[2] || safeKeywords[0])} needs a formula, date, definition, or diagram.\n4. Next move: turn the hardest sentence into one flashcard and one practice question.`
  }

  if (tool === 'quiz') {
    const rotated = questionTemplates.slice(seed % questionTemplates.length).concat(questionTemplates.slice(0, seed % questionTemplates.length))
    return `Quick quiz for ${topic}:\n\n${rotated
      .slice(0, 6)
      .map((template, index) => `${index + 1}. ${fillQuestion(template, safeKeywords, seed + index)}`)
      .join('\n')}`
  }

  if (tool === 'explain') {
    return `${topic}, simply:\n\nStart with ${titleCase(safeKeywords[0])}. Treat it like the first link in a chain. Once that link makes sense, connect it to ${titleCase(safeKeywords[1] || 'the next detail')}, then test the idea with a tiny example. If you can explain the example out loud without looking, the topic is starting to stick.`
  }

  return `Study plan for ${topic}:\n\n1. Warm up: spend 8 minutes rewriting the definition of ${titleCase(safeKeywords[0])} in your own words.\n2. Build: spend 15 minutes making examples for ${titleCase(safeKeywords[1] || safeKeywords[0])}.\n3. Test: answer three quiz questions about ${titleCase(safeKeywords[2] || safeKeywords[0])} without notes.\n4. Repair: mark the one part that still feels fuzzy and make it tomorrow's first task.\n5. Close: write a two-sentence summary so your future self has a clean starting point.`
}

function MockAITools() {
  const [activeTool, setActiveTool] = useState('summary')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [generationCount, setGenerationCount] = useState(0)

  const generateResponse = () => {
    const next = generationCount + 1
    setGenerationCount(next)
    setOutput(buildMockResponse(activeTool, input, next))
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">AI study tools mock</span>
          <h2>Topic-aware helpers without API calls</h2>
          <p className="section-support">
            Local templates extract keywords and vary the output each time you generate.
          </p>
        </div>
        <Sparkles size={24} aria-hidden="true" />
      </div>

      <div className="tool-tabs" role="tablist" aria-label="Mock AI tools">
        {tools.map((tool) => {
          const Icon = tool.icon

          return (
            <button
              key={tool.id}
              role="tab"
              aria-selected={activeTool === tool.id}
              className={`tool-tab ${activeTool === tool.id ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setActiveTool(tool.id)
                setOutput('')
              }}
            >
              <Icon size={17} />
              {tool.label}
            </button>
          )
        })}
      </div>

      <textarea
        className="form-control"
        rows="5"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste a topic, messy notes, or a chapter goal..."
        aria-label="Study text for mock AI tool"
      />
      {!input.trim() ? <p className="inline-alert">No notes yet? Generate anyway for a useful fallback plan.</p> : null}
      <button className="btn glow-btn mt-3" type="button" onClick={generateResponse}>
        <Sparkles size={17} />
        Generate Mock Response
      </button>

      {output ? (
        <div className="ai-output" aria-live="polite">
          <strong>Generated response</strong>
          <pre>{output}</pre>
        </div>
      ) : null}
    </section>
  )
}

export default MockAITools
