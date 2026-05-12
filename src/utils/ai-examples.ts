export const FINE_TUNE_EXAMPLES = [
    {
        role: "user",
        content: "question number 1, ['Reading'] for English language"
    },
    {
        role: "assistant",
        content: "<p>The Alaska pipeline starts at the frozen edge of the Arctic Ocean. It stretches southward across the largest and northernmost state in the United States, ending at a remote ice-free seaport village nearly 800 miles from where it begins. It is massive in size and extremely complicated to operate.</p><br/><p>The steel pipe crosses windswept plains and endless miles of delicate tundra. It weaves through crooked canyons, climbs steep mountains, passes forests, and crosses hundreds of rivers and streams. The pipeline can transport millions of gallons of oil each day.</p><br/><p>The passage primarily discusses the pipeline’s?</p>|->['<p>operating costs</p>','<p>transportation speed</p>','<p>environmental benefits</p>','<p>construction</p>']|-><p>construction</p>|->Reading<_>"
    },
    {
        role: "user",
        content: "question number 2, ['Listening'] for English language"
    },
    {
        role: "assistant",
        content: "Listen to the following conversation and answer the question.<br/><br/>YOU: Hello, I would like to reserve a table for two people tonight at 7 p.m.<br/>FRIEND: Certainly. May I have your name, please?<br/>YOU: My name is John Smith.<br/><br/>Question: What are you trying to do?|->['<p>Order food</p>','<p>Make a reservation</p>','<p>Cancel a booking</p>','<p>Ask for directions</p>']|-><p>Make a reservation</p>|->Listening<_>"
    },
    {
        role: "user",
        content: "question number 3, ['Writing'] for English language"
    },
    {
        role: "assistant",
        content: "<p><b>Translate to English:</b> Saya sangat senang bertemu dengan Anda hari ini.</p><p>[blank]</p>|->null|->I am very happy to meet you today.|->Writing<_>"
    },
    {
        role: "user",
        content: "question number 4, ['Speaking'] for English language"
    },
    {
        role: "assistant",
        content: "<p><b>Read Aloud:</b> Please say the following sentence clearly into the microphone.</p><br/><p>\"I would like to order a coffee and a sandwich, please.\"</p>|->null|->I would like to order a coffee and a sandwich, please.|->Speaking<_>"
    },
    {
        role: "user",
        content: "question number 5, ['Reading'] for Japanese language"
    },
    {
        role: "assistant",
        content: "<p>日本の富士山は、標高3,776メートルの日本で最も高い山です。富士山は活火山であり、最後に噴火したのは1707年です。ユネスコの世界文化遺産にも登録されています。</p><br/><p>富士山について正しい説明はどれですか？</p>|->['<p>日本で2番目に高い山である</p>','<p>最後に噴火したのは1907年である</p>','<p>世界文化遺産に登録されている</p>','<p>死火山である</p>']|-><p>世界文化遺産に登録されている</p>|->Reading<_>"
    }
];
