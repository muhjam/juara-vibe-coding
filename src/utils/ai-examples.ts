export const FINE_TUNE_EXAMPLES = [
    {
        role: "user",
        content: "question number 1, ['Reading'], ['Multiple Choice'] for English language"
    },
    {
        role: "assistant",
        content: "<p>The Alaska pipeline starts at the frozen edge of the Arctic Ocean. It stretches southward across the largest and northernmost state in the United States, ending at a remote ice-free seaport village nearly 800 miles from where it begins. It is massive in size and extremely complicated to operate.</p><br/><p>The steel pipe crosses windswept plains and endless miles of delicate tundra. It weaves through crooked canyons, climbs steep mountains, passes forests, and crosses hundreds of rivers and streams. The pipeline can transport millions of gallons of oil each day.</p><br/><p>The passage primarily discusses the pipeline’s?</p>|->['<p>operating costs</p>','<p>transportation speed</p>','<p>environmental benefits</p>','<p>construction</p>']|-><p>construction</p>|->Reading|->Multiple Choice<_>"
    },
    {
        role: "user",
        content: "question number 2, ['Listening'], ['Multiple Choice'] for English language"
    },
    {
        role: "assistant",
        content: "Listen to the following audio script and answer the question. Script: A man is calling a restaurant to make a reservation. He says, \"Hello, I would like to reserve a table for two people tonight at 7 p.m.\" The receptionist replies, \"Certainly. May I have your name, please?\" Question: What is the man trying to do?|->['<p>Order food</p>','<p>Make a reservation</p>','<p>Cancel a booking</p>','<p>Ask for directions</p>']|-><p>Make a reservation</p>|->Listening|->Multiple Choice<_>"
    },
    {
        role: "user",
        content: "question number 3, ['Writing'], ['Essay'] for English language"
    },
    {
        role: "assistant",
        content: "<p><b>Translate to English:</b> Saya sangat senang bertemu dengan Anda hari ini.</p><p>[blank]</p>|->null|->I am very happy to meet you today.|->Writing|->Essay<_>"
    },
    {
        role: "user",
        content: "question number 4, ['Speaking'], ['Essay'] for English language"
    },
    {
        role: "assistant",
        content: "<p><b>Topic:</b> Describe a place you visited recently that you found interesting. You should speak for about 1 minute.</p><br/><p><i>Instructions: Click the microphone and describe the location, why you went there, and what made it interesting.</i></p>|->null|->The speaker should describe a specific location (e.g., a park, a museum, or a city). Key evaluation criteria: 1. Fluency and coherence. 2. Use of descriptive vocabulary (e.g., breathtaking, historical, vibrant). 3. Correct use of past tenses.|->Speaking|->Essay<_>"
    }
];
