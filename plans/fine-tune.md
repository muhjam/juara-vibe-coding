# AI Fine-Tuning Examples

This document contains the high-quality examples used for few-shot prompting to ensure the AI generates consistent, well-formatted, and accurate language test questions.

## Format Rule
`description |-> options |-> answer |-> skill |-> type <_>`

---

## Examples

### 1. Reading (Multiple Choice)
**USER:**
question number 1, ['Reading'], ['Multiple Choice']

**ASSISTANT:**
<p>The Alaska pipeline starts at the frozen edge of the Arctic Ocean. It stretches southward across the largest and northernmost state in the United States, ending at a remote ice-free seaport village nearly 800 miles from where it begins. It is massive in size and extremely complicated to operate.</p><br/><p>The steel pipe crosses windswept plains and endless miles of delicate tundra. It weaves through crooked canyons, climbs steep mountains, passes forests, and crosses hundreds of rivers and streams. The pipeline can transport millions of gallons of oil each day.</p><br/><p>The passage primarily discusses the pipeline’s?</p>|->['<p>operating costs</p>','<p>transportation speed</p>','<p>environmental benefits</p>','<p>construction</p>']|-><p>construction</p>|->Reading|->Multiple Choice<_>

### 2. Listening (Multiple Choice)
**USER:**
question number 2, ['Listening'], ['Multiple Choice']

**ASSISTANT:**
Listen to the following audio script and answer the question. Script: A man is calling a restaurant to make a reservation. He says, "Hello, I would like to reserve a table for two people tonight at 7 p.m." The receptionist replies, "Certainly. May I have your name, please?" Question: What is the man trying to do?|->['<p>Order food</p>','<p>Make a reservation</p>','<p>Cancel a booking</p>','<p>Ask for directions</p>']|-><p>Make a reservation</p>|->Listening|->Multiple Choice<_>

### 3. Writing (Essay)
**USER:**
question number 3, ['Writing'], ['Essay']

**ASSISTANT:**
<p><b>Prompt:</b> Write a formal email to a professor requesting an extension on your final project due to a family emergency. Your email should be between 50-100 words.</p>|->null|->Subject: Extension Request for Final Project - [Your Name]\n\nDear Professor,\n\nI am writing to respectfully request an extension for the final project. Unfortunately, a sudden family emergency requires my immediate attention. I would be very grateful if you could grant me a three-day extension.\n\nThank you for your time and understanding.\n\nBest regards,\n[Your Name]|->Writing|->Essay<_>

### 4. Speaking (Essay)
**USER:**
question number 4, ['Speaking'], ['Essay']

**ASSISTANT:**
<p><b>Topic:</b> Describe a place you visited recently that you found interesting. You should speak for about 1 minute.</p><br/><p><i>Instructions: Click the microphone and describe the location, why you went there, and what made it interesting.</i></p>|->null|->The speaker should describe a specific location (e.g., a park, a museum, or a city). Key evaluation criteria: 1. Fluency and coherence. 2. Use of descriptive vocabulary (e.g., breathtaking, historical, vibrant). 3. Correct use of past tenses.|->Speaking|->Essay<_>
