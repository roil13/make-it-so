Product Design Record (PDR): Science-Backed Goal Attainment Tool

1. Product Vision & Objective

Objective: To develop a digital tool (web/mobile app) that operationalizes evidence-based psychological frameworks to help users set, pursue, and achieve meaningful life goals.
Philosophy: Most goal-setting tools focus purely on the outcome (checklists, deadines). This tool focuses on the process, human motivation, and anticipating cognitive friction.

2. Scientific Foundations (The "Why")

The tool's architecture is explicitly built on the following validated psychological models:

Self-Determination Theory (SDT): Goals must be intrinsically motivated. The tool must help users connect goals to their core values (Autonomy), build their skills (Competence), and optionally connect with others (Relatedness).

Goal-Setting Theory: Goals must be specific and challenging but attainable, with clear feedback loops.

WOOP Method (Mental Contrasting): Positive thinking alone is insufficient and can actually drain motivation. Users must contrast their desired Outcome with realistic internal/external Obstacles.

Implementation Intentions: Pre-loading decisions using "If [Situation], Then [Action]" formulas increases goal adherence by up to 3x.

Habit Loop & Progress Principle: Breaking large goals into micro-behaviors and visibly tracking small daily wins to maintain dopamine-driven motivation.

3. The Ideal User Workflow (The Process)

The user journey through the tool acts as a structured workflow for success.

Phase 1: Alignment (The "Why")

Action: The user defines their broad vision and connects it to a personal value.

Science: Intrinsic motivation (SDT).

Tool Prompt: "Why does this matter to you? Who are you becoming by doing this?"

Phase 2: Definition (The "What")

Action: Translating the vision into a specific, measurable target with a timeline.

Science: Goal-Setting Theory.

Tool Prompt: "What is the exact finish line? Let's make it specific and appropriately challenging."

Phase 3: Friction Mapping (WOOP)

Action: The user imagines the best outcome, then immediately lists the biggest obstacles.

Science: Mental Contrasting.

Tool Prompt: "What is the primary internal or external obstacle that will stop you?"

Phase 4: Implementation Intentions (The "If-Then")

Action: Creating contingency plans for the obstacles identified in Phase 3.

Science: Implementation Intentions.

Tool Example: "IF I am traveling and there are no vegan meal options at the hotel, THEN I will eat the plant-based protein bars I packed in my carry-on and find a local grocery store."

Phase 5: Micro-Stepping (The Action)

Action: Breaking the goal down into weekly habits or daily 5-minute actions.

Science: Habit Formation / Cognitive Load reduction.

Tool Prompt: "What is the smallest action you can take today that guarantees progress?"

Phase 6: Reflection & Feedback Loop

Action: Weekly check-ins to track progress, celebrate small wins, and adjust "If-Then" plans.

Science: The Progress Principle.

4. Core Features & Requirements (MVP)

Feature 1: The "Value & Vision" Onboarding

Description: Instead of just asking "What is your goal?", the tool walks the user through a mini-interview to establish intrinsic motivation.

UI/UX: Conversational UI. Output is saved as a "Motivation Charter" the user can view when unmotivated.

Feature 2: The WOOP Builder

Description: A dedicated interface where users map out:

Wish: The Goal.

Outcome: How it feels to achieve it.

Obstacle: The top 3 things that will ruin the plan.

Plan: The "If-Then" logic generator.

Data Structure: Saves Obstacles and Plans as linked objects to the main Goal.

Feature 3: The "If-Then" Dashboard

Description: A quick-reference dashboard showing the user's contingency plans.

Functionality: The app can send push notifications of these "If-Then" statements based on time/location (e.g., reminding the user of their gym plan right when they usually leave work).

Feature 4: Small Wins Tracker & Journal

Description: A visual tracker that rewards effort and consistency, not just major milestones.

Functionality: Includes a brief daily prompt: "What progress did you make today, no matter how small?"

Feature 5: Weekly Calibration (Feedback Loop)

Description: An automated weekly review session.

Functionality: Asks the user:

Did your "If-Then" plans work this week?

What new obstacles appeared?

Let's update your plans for next week.

5. UI/UX Principles

Low Cognitive Friction: Keep inputs minimal. Use sliders, simple text fields, and AI-assisted suggestions for obstacles.

Non-Judgmental Tone: If a user misses a habit, the UI should not show red "failure" streaks. Instead, it should trigger the weekly calibration: "Looks like we hit a new obstacle. Let's create an If-Then plan for it."

Focus on the Present: The default dashboard should only show today's micro-steps and the If-Then rules, hiding the overwhelming macro-goal.

6. Future Expansion Ideas (V2)

AI Coach: An LLM that analyzes a user's stated goal and automatically suggests common obstacles and evidence-based "If-Then" plans.

Social Relatedness: Ability to share specific "If-Then" plans with a small accountability group to satisfy the SDT "Relatedness" requirement.