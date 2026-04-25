**# 🧠 NeuroTutor AI — Multi-Agent System Architecture & User Flow

---

## 1. SYSTEM OVERVIEW

```

┌─────────────────────────────────────────────────────────────┐

│                    NEUROTUTOR AI SYSTEM                      │

│                                                              │

│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │

│   │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  │ Agent 4  │  │

│   │Conductor │──│ Learner  │──│ Content  │──│ Struggle │  │

│   │          │  │ Profiler │  │ Creator  │  │ Detector │  │

│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │

│        │              │              │              │        │

│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │

│   │ Agent 5  │  │ Agent 6  │  │ Agent 7  │  │ Agent 8  │  │

│   │Adaptation│──│ Modality │──│ Feedback │──│ Safety   │  │

│   │Strategist│  │ Renderer │  │ Loop     │  │Guardrail │  │

│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │

│                                                              │

└─────────────────────────────────────────────────────────────┘

```

---

## 2. AGENT-BY-AGENT BREAKDOWN

---

### 🎵 AGENT 1 — THE CONDUCTOR (Orchestrator)

```

Role:        Central brain. Routes every request. No single point of failure logic.

Analogy:     Like a music conductor — doesn't play every instrument, 

             but ensures harmony.

```

**Responsibilities:**

```

✅ Receive all user input (voice or text)

✅ Route input to the right agent(s) in the right order

✅ Merge outputs from multiple agents into one coherent response

✅ Manage conversation state and turn-taking

✅ Decide when to loop back (re-explain) vs. move forward

```

**Internal State Machine:**

```

         ┌──────────────┐

         │   IDLE       │

         └──────┬───────┘

                │ User speaks/types

         ┌──────▼───────┐

         │  LISTENING   │ ◄──── Audio Stream / Text Input

         └──────┬───────┘

                │ Input captured

         ┌──────▼───────┐

         │  PROCESSING  │ ◄──── Fan out to multiple agents

         └──────┬───────┘

                │ Response ready

         ┌──────▼───────┐

         │  DELIVERING  │ ◄──── Rendered explanation sent

         └──────┬───────┘

                │ Delivered

         ┌──────▼───────┐

         │  MONITORING  │ ◄──── Struggle Detector watches

         └──────┬───────┘

                │

         ┌──────▼───────┐

         │  ADAPTING    │ ◄──── If struggle detected, loop back

         └──────┬───────┘

                │

         └──────▼───────┘

         │   IDLE       │

         └──────────────┘

```

**Pseudocode:**

```python

class ConductorAgent:

    def handle_input(self, user_input):

        # Step 1: Understand what user wants

        intent = self.learner_profile_agent.extract_intent(user_input)

      

        # Step 2: Get learner context

        learner_context = self.learner_profile_agent.get_profile()

      

        # Step 3: Generate explanation

        explanation = self.content_creator.generate(

            topic=intent.topic,

            question=intent.raw_question,

            learner_profile=learner_context

        )

      

        # Step 4: Choose modality

        rendered = self.modality_renderer.render(

            explanation=explanation,

            preferred_modality=learner_context.preferred_modalities

        )

      

        # Step 5: Safety check

        safe_content = self.safety_guardrail.check(rendered)

      

        # Step 6: Deliver

        self.deliver(safe_content)

      

        # Step 7: Start monitoring loop

        self.struggle_detector.start_monitoring()

```

---

### 👤 AGENT 2 — THE LEARNER PROFILER

```

Role:        Builds and maintains a living "learner fingerprint"

Analogy:     Like a personal shopper who learns your taste over time

```

**Data Model:**

```json

{

  "learner_id": "user_abc123",

  "diagnosed_conditions": ["dyslexia", "adhd"],

  "age": 12,

  "grade": 7,

  

  "learning_style_profile": {

    "dominant_modality": "audio_visual",

    "modality_scores": {

      "visual_analogies": 0.85,

      "audio_narrative": 0.92,

      "step_by_step_text": 0.30,

      "interactive_examples": 0.78,

      "story_based": 0.88

    },

    "optimal_explanation_length": "short_bursts",

    "attention_window_minutes": 4,

    "responds_well_to_humor": true,

    "needs_repetition_pattern": "spaced_with_variation"

  },

  

  "struggle_patterns": {

    "triggers": [

      "long_paragraphs",

      "abstract_without_concrete_example",

      "rapid_topic_switching"

    ],

    "recovery_methods_that_worked": [

      "switch_to_analogy",

      "use_real_world_object",

      "humor_injection"

    ]

  },

  

  "session_history": [

    {

      "date": "2025-01-15",

      "topic": "fractions",

      "attempts": 3,

      "final_modality_that_worked": "pizza_analogy",

      "time_to_clarity": "6min"

    }

  ],

  

  "engagement_signals": {

    "avg_session_length_min": 12,

    "most_active_time": "4pm-6pm",

    "dropout_triggers": ["info_overload", "no_visuals"]

  }

}

```

**Responsibilities:**

```

✅ Parse learner profile from onboarding + ongoing interactions

✅ Update modality scores after every successful explanation

✅ Track which strategies worked for which topics

✅ Provide context to all other agents as needed

✅ Infer preferences implicitly (no explicit "settings" for user)

```

**Update Logic:**

```python

def update_after_explanation(self, explanation_strategy, outcome):

    if outcome == "understood":

        # Boost this strategy's score

        self.profile.modality_scores[strategy] += 0.05

        self.profile.success_log.append(strategy)

      

    elif outcome == "still_confused":

        # Penalize slightly, trigger adaptation

        self.profile.modality_scores[strategy] -= 0.03

        self.profile.struggle_patterns.append(strategy)

```

---

### 📚 AGENT 3 — THE CONTENT CREATOR

```

Role:        Generates the actual educational explanation

Analogy:     Like a teacher who knows 50 ways to explain the same thing

```

**Explanation Strategy Library:**

```

STRATEGY_ID          │ WHEN TO USE                          │ EXAMPLE

─────────────────────┼──────────────────────────────────────┼──────────────────

visual_analogy       │ Abstract concepts                    │ "Voltage is like 

                     │                                      │  water pressure"

story_narrative      │ ADHD / engagement dropping           │ "Imagine you're 

                     │                                      │  a detective..."

concrete_object      │ Dyslexia / need tangibility          │ "Think of a pizza

                     │                                      │  being sliced"

step_by_step_micro   │ Processing difficulties              │ "Step 1: Take 

                     │                                      │  ONE number..."

gamification         │ Low motivation / boredom             │ "You just unlocked

                     │                                      │  Level 2 of math!"

real_world_connect   │ "Why do I need this?" moments        │ "This is how your

                     │                                      │  phone charges"

humor_injection      │ Frustration detected                 │ "Even Einstein 

                     │                                      │  took naps, so..."

socratic_questions   │ Advanced learners / curiosity peaks  │ "What do YOU think

                     │                                      │  happens if...?"

music_rhythm         │ Memorization tasks                   │ "7 × 8 = 56, 

                     │                                      │  clap clap clap"

chunked_pauses       │ ADHD / attention fading              │ "Pause. Breathe. 

                     │                                      │  Ready? Next part:"

```

**Generation Pipeline:**

```

User Question

      │

      ▼

┌─────────────────┐

│ Concept Mapping  │ ◄── What is the core concept?

│ (Knowledge Base) │     What are prerequisites?

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│ Strategy Select  │ ◄── Based on Learner Profile

│                  │     + Current Struggle Signals

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│ Content Generate │ ◄── LLM generates explanation using

│ (LLM Engine)     │     selected strategy template

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│ Chunk & Simplify │ ◄── Break into micro-segments

│                  │     Max 2-3 sentences per chunk

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│ Enrichment Add   │ ◄── Add emoji cues, pause markers,

│                  │     "check-in" questions

└─────────────────┘

```

**Prompt Architecture:**

```python

SYSTEM_PROMPT = """

You are an adaptive tutor for a {age}-year-old student with {conditions}.


STRATEGY TO USE: {selected_strategy}


RULES:

1. Max 3 sentences per "chunk"

2. Always start with a hook (question, surprising fact, or analogy)

3. Use concrete, tangible references (food, sports, games, daily life)

4. Insert a check-in question every 2-3 chunks

5. Never say "as mentioned before" or "obviously"

6. Use short words (max 3 syllables when possible)

7. If {condition} == "dyslexia": lean heavily on audio-friendly phrasing

8. If {condition} == "adhd": use novelty, movement, surprise every 45 seconds


TOPIC: {topic}

STUDENT QUESTION: {question}

PREVIOUS ATTEMPTS: {failed_strategies}

"""

```

---

### 🔍 AGENT 4 — THE STRUGGLE DETECTOR

```

Role:        Real-time monitoring of learner confusion/frustration

Analogy:     Like a friend who notices you're lost before you say it

```

**Signal Detection Framework:**

```

┌─────────────────────────────────────────────────────────────────┐

│                   STRUGGLE SIGNAL SOURCES                        │

├─────────────────┬────────────────────┬──────────────────────────┤

│  VOICE SIGNALS  │   TEXT SIGNALS     │   BEHAVIORAL SIGNALS     │

├─────────────────┼────────────────────┼──────────────────────────┤

│ • Long pauses   │ • "what?" "huh?"   │ • Re-reading same part   │

│ • Rising tone   │ • Same question    │ • Session going > 2x     │

│   (confused)    │   rephrased        │   normal length           │

│ • Sighing       │ • Shorter replies  │ • App backgrounding      │

│ • "um" density  │ • Off-topic shift  │ • Rapid tap patterns     │

│ • Slower speech │ • Silence > 10s    │ • Skipping check-in Q's  │

│ • Frustration   │ • "I don't get it" │ • Decreasing interaction │

│   in voice tone │ • Partial answers  │ • Asking unrelated Q's   │

└─────────────────┴────────────────────┴──────────────────────────┘

```

**Scoring Model:**

```python

class StruggleDetector:

    def calculate_confusion_score(self, signals):

        score = 0

      

        # Voice signals

        if signals.silence_duration > 8:    score += 25

        if signals.pause_count > 3:         score += 20

        if signals.frustration_tone:        score += 30

        if signals.rising_intonation:       score += 15

      

        # Text signals

        if signals.same_question_rephrased: score += 35

        if signals.short_responses:         score += 15

        if signals.confusion_words:         score += 25

      

        # Behavioral signals

        if signals.reread_count > 2:        score += 20

        if signals.skipped_checkins > 1:    score += 15

        if signals.session_anomaly:         score += 10

      

        # Weighted total (0-100)

        return min(score, 100)

  

    def get_action(self, score):

        if score < 25:  return "continue"

        if score < 50:  return "soft_check_in"      # "Does that make sense?"

        if score < 75:  return "auto_adapt"          # Switch strategy silently

        if score >= 75: return "break_and_reset"     # "Let's try something different"

```

**Threshold Actions:**

```

Score 0-24  │ 🟢 CONTINUE        │ Everything's fine. Keep going.

Score 25-49 │ 🟡 SOFT CHECK-IN   │ "Hey, does that click? Want me 

            │                    │  to try it differently?"

Score 50-74 │ 🟠 AUTO-ADAPT      │ Silently switch explanation 

            │                    │  strategy. No "I see you're 

            │                    │  confused" (preserves dignity)

Score 75-100│ 🔴 BREAK & RESET   │ "You know what? Let's forget 

            │                    │  that approach entirely. Here's

            │                    │  a completely different way..."

```

---

### 🔄 AGENT 5 — THE ADAPTATION STRATEGIST

```

Role:        Decides HOW to change the explanation when struggle is detected

Analogy:     Like a DJ reading the room and changing the track

```

**Adaptation Decision Tree:**

```

                    STRUGGLE DETECTED

                          │

                ┌─────────┴─────────┐

                ▼                   ▼

         Was it CONTENT        Was it FORMAT?

         too hard?           

                │                   │

        ┌───────┴──────┐    ┌──────┴───────┐

        ▼              ▼    ▼              ▼

   SIMPLIFY        ADD    SWITCH         ADD

   vocabulary   ANALOGY  MODALITY     INTERACTION

        │              │    │              │

        ▼              ▼    ▼              ▼

   Use fewer      Find    Text→Audio    Add quiz

   syllables    real-world or Audio→    or "try

   & shorter    comparison  Visual     it yourself"

   sentences                           prompt

```

**Strategy Rotation Logic:**

```python

class AdaptationStrategist:

    def decide_next_strategy(self, current_strategy, struggle_score, profile):

      

        # Get what HASN'T worked yet in this session

        failed = profile.failed_strategies_this_session

      

        # Strategy rotation priority

        strategy_pool = [

            "visual_analogy",

            "story_narrative", 

            "concrete_object",

            "step_by_step_micro",

            "gamification",

            "real_world_connect",

            "humor_injection",

            "socratic_questions",

            "music_rhythm",

            "chunked_pauses"

        ]

      

        # Remove failed ones

        available = [s for s in strategy_pool if s not in failed]

      

        # Sort by learner's historical success with each

        available.sort(

            key=lambda s: profile.modality_scores.get(s, 0.5), 

            reverse=True

        )

      

        # If very high struggle, also change MODALITY

        if struggle_score > 60:

            new_modality = self.switch_modality(profile.current_modality)

      

        return available[0], new_modality

```

---

### 🎨 AGENT 6 — THE MODALITY RENDERER

```

Role:        Converts abstract explanation into the right output format

Analogy:     Like a translator who speaks Audio, Visual, Interactive, etc.

```

**Output Channels:**

```

┌─────────────────────────────────────────────────────────────┐

│                    OUTPUT MODALITIES                         │

├───────────────┬─────────────────────────────────────────────┤

│  🎧 AUDIO     │ TTS with natural pacing, emphasis,          │

│               │   pauses, and emotional inflection           │

│               │   Speed adjustable (0.75x - 1.25x)          │

│               │   Background: optional soft music for ADHD   │

├───────────────┼─────────────────────────────────────────────┤

│  🎨 VISUAL    │ Auto-generated illustrations                 │

│               │   Color-coded diagrams                       │

│               │   Animated step sequences                    │

│               │   Dyslexia-friendly: OpenDyslexic font       │

│               │   High contrast, cream/pastel backgrounds    │

├───────────────┼─────────────────────────────────────────────┤

│  🎮 INTERACTIVE│ "Tap to reveal" step-by-step               │

│               │   Drag-and-drop matching                     │

│               │   Voice-guided practice                      │

│               │   Micro-rewards (confetti, stars, streaks)   │

├───────────────┼─────────────────────────────────────────────┤

│  📖 TEXT      │ ONLY if learner prefers it                   │

│               │   Max 3 lines visible at a time              │

│               │   Highlighted key words only                 │

│               │   Scroll-by-chunk (not wall of text)         │

└───────────────┴─────────────────────────────────────────────┘

```

---

### 🔁 AGENT 7 — THE FEEDBACK LOOP

```

Role:        Closes the learning loop. Ensures understanding before moving on.

Analogy:     Like a teacher who asks "Got it?" but in a non-embarrassing way

```

**Check-in Mechanism:**

```

After every explanation chunk:

        │

        ▼

┌───────────────────────┐

│  MICRO CHECK-IN        │

│                        │

│  Option A (Voice):     │

│  "Does that make sense │

│   so far? You can say  │

│   'yes', 'no', or     │

│   'try again'."        │

│                        │

│  Option B (Implicit):  │

│  Wait 5 seconds.       │

│  If no response →      │

│  "Want me to continue  │

│   or explain differently?"│

│                        │

│  Option C (Fun):       │

│  "Quick pop quiz!      │

│   If photosynthesis    │

│   was a kitchen, what  │

│   would the sun be?"   │

│   → Learner answers    │

│   → Score their grasp  │

└───────────────────────┘

```

**Feedback Data Flow:**

```

User Response → Feedback Agent → Updates Learner Profile

                    │

                    ├── understood? → Move to next concept

                    ├── partial?   → Reinforce with same strategy  

                    ├── confused?  → Trigger Adaptation Agent

                    └── silent?    → Trigger Struggle Detector

```

---

### 🛡️ AGENT 8 — THE SAFETY GUARDRAIL

```

Role:        Content safety, age-appropriateness, emotional safety

Analogy:     Like a caring parent previewing what the child sees

```

**Checks:**

```

✅ Content is age-appropriate (8-18 filter)

✅ No violent/scary analogies for young learners

✅ No political/religious bias in examples

✅ Encouraging tone — never condescending

✅ Detects emotional distress → gentle escalation to human

✅ Privacy: no PII stored without consent

✅ COPPA compliance for users under 13

```

---

## 3. COMPLETE USER FLOW

### 🟢 FLOW 1: NORMAL LEARNING SESSION

```

┌─────────────────────────────────────────────────────────────────────┐

│                          USER OPENS APP                              │

└──────────────────────────┬──────────────────────────────────────────┘

                           │

                           ▼

              ┌────────────────────────┐

              │  "Hi! What do you want │

              │   to learn today?"     │  ◄── Voice OR tap buttons

              │                        │      (minimal reading)

              │  [🎤 Speak] [⌨️ Type]  │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  USER: "Explain        │

              │   photosynthesis"      │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  CONDUCTOR AGENT       │

              │  receives input        │

              │  routes to:            │

              │  → Learner Profiler    │

              │  → Content Creator     │

              │  → Modality Renderer   │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  APP: "Imagine your    │

              │   plant is a tiny      │  ◄── Audio + Visual

              │   kitchen. The sun is  │      (auto-selected)

              │   the stove..."        │

              │                        │

              │  [🎨 Visual shows      │

              │   animated kitchen     │

              │   → plant diagram]     │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  MICRO CHECK-IN:       │

              │  "Get it so far?       │

              │   👍 Yes / 🔄 Try     │

              │   differently / ❓What?│

              └───────────┬────────────┘

                          │

            ┌─────────────┼─────────────┐

            ▼             ▼             ▼

         👍 YES      🔄 TRY AGAIN   ❓ WHAT?

            │             │             │

            ▼             ▼             ▼

      Continue to    Adaptation     Struggle

      next chunk    Agent kicks    Detector

      of topic       in            escalates

            │             │             │

            └─────────────┼─────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  (Loop continues until │

              │   concept is mastered) │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  🎉 "You got it!       │

              │   That's photosynthesis│

              │   in your pocket."     │

              │                        │

              │  [📊 Streak: 3 days]   │

              │  [▶️ Next topic?]       │

              └────────────────────────┘

```

---

### 🟠 FLOW 2: STRUGGLE DETECTION (Auto-Adapt)

```

                    EXPLANATION DELIVERED

                           │

                           ▼

              ┌────────────────────────┐

              │  STRUGGLE DETECTOR     │

              │  monitoring signals:   │

              │  • User paused 12s     │

              │  • Voice tone: confused│

              │  • Score: 62/100       │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  AUTO-ADAPT TRIGGERED  │

              │  (No user action needed)│

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  ADAPTATION STRATEGIST │

              │                        │

              │  Previous: visual_     │

              │            analogy     │

              │  → Switching to:       │

              │    concrete_object     │

              │  → Changing modality:  │

              │    visual → interactive│

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  APP: "Okay, let's try │

              │   something cool.      │

              │   Grab your phone.     │

              │   Now imagine it's a   │

              │   leaf. The battery is │

              │   the sugar it makes.  │

              │   Charging cable?      │

              │   That's water + CO2." │

              │                        │

              │  [🎮 Interactive:      │

              │   drag labels to the   │

              │   phone diagram]       │

              └───────────┬────────────┘

                          │

                          ▼

              ┌────────────────────────┐

              │  STRUGGLE DETECTOR     │

              │  new score: 15/100     │

              │  → CONTINUE ✅         │

              └────────────────────────┘

```

---

### 🔴 FLOW 3: MULTIPLE FAILED ATTEMPTS

```

              Attempt 1: Visual Analogy → Confused (score: 55)

                          │

                          ▼

              Attempt 2: Story Narrative → Still confused (score: 68)

                          │

                          ▼

              Attempt 3: Concrete Object → Getting there (score: 40)

                          │

                          ▼

              Attempt 4: Interactive Quiz → UNDERSTOOD! 🎉

                          │

                          ▼

         ┌────────────────────────────────────┐

         │  LEARNER PROFILE UPDATED:          │

         │                                    │

         │  Topic: photosynthesis             │

         │  Winning combo: concrete_object    │

         │                   + interactive    │

         │  Failed: visual_analogy, story     │

         │  Time to clarity: 8 minutes        │

         │                                    │

         │  → Next time this student asks     │

         │    about biology, START with       │

         │    concrete_object strategy        │

         └────────────────────────────────────┘

```

---

## 4. FULL SYSTEM ARCHITECTURE DIAGRAM

```

┌──────────────────────────────────────────────────────────────────────────┐

│                              USER DEVICE                                  │

│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │

│  │ 🎤 Voice │  │ ⌨️ Text Input │  │ 📱 Touch/    │  │ 🎧 Audio Output  │ │

│  │  Input   │  │              │  │    Gestures  │  │                  │ │

│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  └────────▲─────────┘ │

│       │               │                 │                     │          │

│       └───────────────┼─────────────────┘                     │          │

│                       │                                       │          │

│                ┌──────▼───────┐                        ┌──────┴────────┐ │

│                │  Local Edge   │                        │  Local Edge   │ │

│                │  Processing   │                        │  Rendering    │ │

│                │  (VAD, STT)   │                        │  (TTS, Anim)  │ │

│                └──────┬───────┘                        └──────▲────────┘ │

└───────────────────────┼───────────────────────────────────────┼──────────┘

                        │          SECURE WebSocket              │

                        ▼                                        │

┌──────────────────────────────────────────────────────────────────────────┐

│                            CLOUD BACKEND                                  │

│                                                                           │

│  ┌────────────────────────────────────────────────────────────────────┐  │

│  │                        API GATEWAY                                  │  │

│  └─────────────────────────────┬──────────────────────────────────────┘  │

│                                │                                          │

│  ┌─────────────────────────────▼──────────────────────────────────────┐  │

│  │                   🎵 CONDUCTOR AGENT                               │  │

│  │                   (Orchestrator / Router)                           │  │

│  └──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┘  │

│     │      │      │      │      │      │      │      │                    │

│     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼                    │

│  ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐              │

│  │ 👤  ││ 📚  ││ 🔍  ││ 🔄  ││ 🎨  ││ 🔁  ││ 🛡️  ││ 🧠  │              │

│  │Lear-││Cont-││Stru-││Adap-││Moda-││Feed-││Safe-││Memo-│              │

│  │ner  ││ent  ││ggle ││tati-││lity ││back ││ty   ││ry   │              │

│  │Prof.││Crea.││Det. ││on   ││Rend.││Loop ││Guard││Store│              │

│  └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘              │

│     │      │      │      │      │      │      │      │                    │

│     └──────┴──────┴──────┴──────┴──────┴──────┴──────┘                    │

│                                │                                          │

│  ┌─────────────────────────────▼──────────────────────────────────────┐  │

│  │                        DATA LAYER                                   │  │

│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐  │  │

│  │  │ Learner    │ │ Knowledge  │ │ Strategy   │ │ Session        │  │  │

│  │  │ Profiles DB│ │ Graph DB   │ │ Library    │ │ Analytics      │  │  │

│  │  │ (MongoDB)  │ │ (Neo4j)    │ │ (Redis)    │ │ (TimescaleDB)  │  │  │

│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────┘  │  │

│  └────────────────────────────────────────────────────────────────────┘  │

│                                                                           │

│  ┌────────────────────────────────────────────────────────────────────┐  │

│  │                     EXTERNAL SERVICES                               │  │

│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐  │  │

│  │  │ LLM Engine │ │ STT/TTS    │ │ Image Gen  │ │ Analytics      │  │  │

│  │  │ (GPT-4/    │ │ (Whisper + │ │ (DALL-E/   │ │ (Mixpanel/     │  │  │

│  │  │  Claude/   │ │  ElevenLabs│ │  Stable    │ │  Amplitude)    │  │  │

│  │  │  Local)    │ │  /Coqui)   │ │  Diffusion)│ │                │  │  │

│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────┘  │  │

│  └────────────────────────────────────────────────────────────────────┘  │

│                                                                           │

└──────────────────────────────────────────────────────────────────────────┘

```

---

## 5. INTER-AGENT COMMUNICATION PROTOCOL

```

Message Format (JSON):

{

  "message_id": "uuid",

  "from_agent": "struggle_detector",

  "to_agent": "adaptation_strategist",

  "type": "ALERT",

  "priority": "HIGH",

  "payload": {

    "learner_id": "user_abc123",

    "current_topic": "photosynthesis",

    "current_strategy": "visual_analogy",

    "struggle_score": 62,

    "signals": {

      "voice_confusion": true,

      "silence_duration_sec": 12,

      "repeated_question": false

    },

    "recommended_action": "auto_adapt"

  },

  "timestamp": "2025-01-15T16:23:45Z"

}

```

**Communication Patterns:**

```

PATTERN 1: Request-Response

  Conductor → Content Creator: "Generate explanation for X"

  Content Creator → Conductor: "Here's the explanation"


PATTERN 2: Pub-Sub (Event-Driven)  

  Struggle Detector → publishes "STRUGGLE_ALERT"

  Adaptation Strategist → subscribes, reacts

  Learner Profiler → subscribes, logs


PATTERN 3: Pipeline

  Content Creator → Modality Renderer → Safety Guardrail → Conductor

```

---

## 6. TECHNOLOGY STACK RECOMMENDATION

```

┌─────────────────────┬────────────────────────────────────────────┐

│  LAYER              │  TECHNOLOGY                                 │

├─────────────────────┼────────────────────────────────────────────┤

│  Voice Input (STT)  │  Whisper (local) + Deepgram (cloud)        │

│  Voice Output (TTS) │  ElevenLabs / Coqui TTS / Azure Neural     │

│  LLM Engine         │  GPT-4o / Claude 3.5 / Fine-tuned Llama    │

│  Image Generation   │  DALL-E 3 / Stable Diffusion (education)   │

│  Agent Framework    │  LangGraph / CrewAI / Custom (Python)      │

│  Backend API        │  FastAPI (Python) + WebSocket               │

│  Frontend           │  React Native (mobile) / Next.js (web)     │

│  Database           │  PostgreSQL + Redis + MongoDB               │

│  Knowledge Graph    │  Neo4j (curriculum mapping)                 │

│  Real-time Comms    │  WebSocket + Server-Sent Events             │

│  Analytics          │  Mixpanel / PostHog                         │

│  Deployment         │  AWS/GCP + Docker + Kubernetes              │

│  CI/CD              │  GitHub Actions                             │

└─────────────────────┴────────────────────────────────────────────┘

```

---

## 7. KEY METRICS TO TRACK

```

┌─────────────────────────┬──────────────────────────────────────┐

│  METRIC                 │  WHY IT MATTERS                      │

├─────────────────────────┼──────────────────────────────────────┤

│  Time to Clarity        │  How fast did the student "get it"?  │

│  Adaptation Count       │  How many switches before success?   │

│  Strategy Hit Rate      │  Which strategies work most often?   │

│  Session Completion %   │  Did they finish or drop off?        │

│  Return Rate            │  Do they come back tomorrow?         │

│  Confidence Score       │  Post-explanation self-rating        │

│  Silent Confusion Rate  │  Struggle detected without asking    │

│  Modality Preference    │  Audio vs visual vs interactive      │

│  Emotional Tone Trend   │  Frustrated → Happy over session?    │

└─────────────────────────┴──────────────────────────────────────┘

```

---

## 8. MVP SCOPE (Build First)

```

PHASE 1 — MVP (4-6 weeks)

  ✅ Conductor Agent (basic routing)

  ✅ Content Creator (3 strategies: analogy, step-by-step, story)

  ✅ Modality Renderer (audio + text only)

  ✅ Simple Struggle Detector (explicit "I don't get it" + silence timer)

  ✅ Learner Profile (basic — remembers last successful style)

  ✅ Safety Guardrail (content filter)


PHASE 2 — SMART (6-8 weeks)

  ⬜ Advanced Struggle Detector (voice tone analysis)

  ⬜ Adaptation Strategist (auto-switching)

  ⬜ Visual generation (diagrams, illustrations)

  ⬜ Interactive mode (quizzes, drag-and-drop)

  ⬜ Feedback Loop Agent


PHASE 3 — FULL (8-12 weeks)

  ⬜ Knowledge Graph (curriculum-aware)

  ⬜ Gamification (streaks, achievements)

  ⬜ Parent/Teacher dashboard

  ⬜ Multi-session learning paths

  ⬜ A/B testing framework for strategies

```

---

This gives you a **complete blueprint** — from individual agent responsibilities to data flows to the user-facing experience. The core innovation is the **invisible adaptation loop**: the student never feels "tested" or "evaluated" — they just experience explanations that keep getting better at meeting them where they are. Want me to dive deeper into any specific agent, build out the prompt templates, or create the database schema?

**
