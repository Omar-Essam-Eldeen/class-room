import { useState } from 'react'
import { BrainCircuit, ClipboardList, FileText, HelpCircle, Sparkles } from 'lucide-react'

const tools = [
  { id: 'summary', label: 'Summarize Notes', icon: FileText },
  { id: 'quiz', label: 'Generate Quiz', icon: HelpCircle },
  { id: 'explain', label: 'Explain Topic Simply', icon: BrainCircuit },
  { id: 'plan', label: 'Create Study Plan', icon: ClipboardList },
]

function getPreviewTopic(input) {
  return input.trim().split(/\s+/).slice(0, 10).join(' ')
}

function buildMockResponse(tool, input) {
  const topic = getPreviewTopic(input)

  if (tool === 'summary') {
    return `Here is a cleaner version of your notes about ${topic}:\n\n1. Main idea: focus on the core definition first.\n2. Key detail: connect each example to one rule or formula.\n3. Review move: turn the hardest sentence into a flashcard.`
  }

  if (tool === 'quiz') {
    return `Quick quiz based on ${topic}:\n\n1. What is the main concept in these notes?\n2. Which detail would be easiest to confuse?\n3. Can you give one real example?\n4. What formula, date, or keyword matters most?\n5. How would you explain this to a younger student?`
  }

  if (tool === 'explain') {
    return `${topic} in simple words:\n\nImagine the idea as a small chain. First, understand the first link. Then ask why it connects to the next link. Once the connection makes sense, the bigger topic becomes much easier to remember.`
  }

  return `3-step study plan for ${topic}:\n\n1. Spend 10 minutes rereading and highlighting only the confusing parts.\n2. Spend 20 minutes solving or answering practice questions.\n3. Spend 5 minutes writing what still feels unclear so tomorrow's session starts faster.`
}

function MockAITools() {
  const [activeTool, setActiveTool] = useState('summary')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const generateResponse = () => {
    if (!input.trim()) {
      setError('Paste notes or a topic first.')
      setOutput('')
      return
    }

    setError('')
    setOutput(buildMockResponse(activeTool, input))
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">AI study tools mock</span>
          <h2>Prototype helpers without API calls</h2>
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
                setError('')
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
        onChange={(event) => {
          setInput(event.target.value)
          setError('')
        }}
        placeholder="Paste a topic, messy notes, or a chapter goal..."
        aria-label="Study text for mock AI tool"
      />
      {error ? <p className="form-error">{error}</p> : null}
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
