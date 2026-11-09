/* Fluentia speaking, dictation and sentence-construction content. */
(() => {
  'use strict';
  const samples = [
    {level:'A1',text:'I would like a glass of water, please.'},
    {level:'A1',text:'Could you help me find the train station?'},
    {level:'A2',text:'I usually practise English for ten minutes every day.'},
    {level:'A2',text:'The weather was sunny, so we walked to the park.'},
    {level:'B1',text:'Although I was nervous, I introduced myself to the group.'},
    {level:'B1',text:'I have been learning English because I want to travel.'},
    {level:'B2',text:'If I had more time, I would listen to a different accent each week.'},
    {level:'B2',text:'The most useful way to improve is to practise a little and often.'}
  ];
  const sentenceItems = [
    {level:'A1',text:'I drink water every morning.',ar:'أشرب الماء كل صباح.'},
    {level:'A1',text:'She is reading a book.',ar:'هي تقرأ كتابًا.'},
    {level:'A1',text:'We are going to school.',ar:'نحن ذاهبون إلى المدرسة.'},
    {level:'A1',text:'He bought a new phone.',ar:'اشترى هاتفًا جديدًا.'},
    {level:'A1',text:'Please open the window.',ar:'من فضلك افتح النافذة.'},
    {level:'A1',text:'They play football after school.',ar:'يلعبون كرة القدم بعد المدرسة.'},
    {level:'A2',text:'My friend lives near the park.',ar:'يعيش صديقي بالقرب من الحديقة.'},
    {level:'A2',text:'Could you tell me where the bus stop is?',ar:'هل يمكنك إخباري أين تقع محطة الحافلات؟'},
    {level:'A2',text:'We visited the museum last Saturday.',ar:'زرنا المتحف يوم السبت الماضي.'},
    {level:'A2',text:'I have already finished my homework.',ar:'لقد أنهيت واجبي المنزلي بالفعل.'},
    {level:'A2',text:'The weather was sunny, so we walked to the park.',ar:'كان الطقس مشمسًا، لذلك مشينا إلى الحديقة.'},
    {level:'A2',text:'I usually practise English before breakfast.',ar:'أتدرّب عادةً على الإنجليزية قبل الإفطار.'},
    {level:'B1',text:'Although I was nervous, I introduced myself to the group.',ar:'على الرغم من توتري، عرّفت بنفسي أمام المجموعة.'},
    {level:'B1',text:'I have been learning English because I want to travel.',ar:'أتعلم الإنجليزية لأنني أريد السفر.'},
    {level:'B1',text:'If the train is late, we will take the next bus.',ar:'إذا تأخر القطار، فسنستقل الحافلة التالية.'},
    {level:'B1',text:'She decided to apply for the position after reading the details.',ar:'قررت التقدم للوظيفة بعد قراءة التفاصيل.'},
    {level:'B1',text:'We were discussing the plan when the manager arrived.',ar:'كنا نناقش الخطة عندما وصل المدير.'},
    {level:'B1',text:'The library has extended its opening hours this month.',ar:'مددت المكتبة ساعات عملها هذا الشهر.'},
    {level:'B2',text:'If I had more time, I would listen to a different accent each week.',ar:'لو كان لدي وقت أكثر، لاستَمعت إلى لهجة مختلفة كل أسبوع.'},
    {level:'B2',text:'The most useful way to improve is to practise a little and often.',ar:'أكثر الطرق فائدة للتحسن هي التدرب قليلًا وبانتظام.'},
    {level:'B2',text:'Despite the heavy rain, the event continued as planned.',ar:'على الرغم من الأمطار الغزيرة، استمر الحدث كما خُطط له.'},
    {level:'B2',text:'The report explains why the figures changed during the final quarter.',ar:'يوضح التقرير سبب تغير الأرقام خلال الربع الأخير.'},
    {level:'B2',text:'I would have contacted you earlier if I had known about the delay.',ar:'لكنت تواصلت معك في وقت أبكر لو علمت بالتأخير.'},
    {level:'B2',text:'The committee agreed to postpone the decision until more evidence was available.',ar:'وافقت اللجنة على تأجيل القرار حتى تتوفر أدلة إضافية.'},
    {level:'C1',text:'Had the team reviewed the data earlier, it might have identified the discrepancy.',ar:'لو راجع الفريق البيانات في وقت أبكر، لربما اكتشف التباين.'},
    {level:'C1',text:'The proposal, which was revised after consultation, addresses several practical concerns.',ar:'يتناول المقترح، الذي نُقح بعد التشاور، عددًا من المخاوف العملية.'},
    {level:'C1',text:'Not only did the policy reduce delays, but it also improved communication between departments.',ar:'لم تقلل السياسة التأخيرات فحسب، بل حسّنت أيضًا التواصل بين الأقسام.'},
    {level:'C1',text:'The findings suggest a correlation, although they do not establish a causal relationship.',ar:'تشير النتائج إلى وجود ارتباط، لكنها لا تثبت علاقة سببية.'},
    {level:'C1',text:'Were the assumptions to change, the projected outcome would need to be reassessed.',ar:'إذا تغيرت الافتراضات، فستحتاج النتيجة المتوقعة إلى إعادة تقييم.'},
    {level:'C1',text:'She acknowledged the limitations while defending the broader value of the research.',ar:'أقرت بالقيود مع دفاعها عن القيمة الأوسع للبحث.'},
    {level:'C2',text:'Rarely has a seemingly minor amendment had such far-reaching implications for the interpretation of the statute.',ar:'نادرًا ما كان لتعديل يبدو طفيفًا مثل هذه التداعيات الواسعة على تفسير القانون.'},
    {level:'C2',text:'The extent to which the findings can be generalised depends on the representativeness of the sample.',ar:'يتوقف مدى إمكانية تعميم النتائج على مدى تمثيل العينة للمجتمع.'},
    {level:'C2',text:'What initially appeared to be a contradiction was, on closer inspection, a distinction between competing definitions.',ar:'ما بدا في البداية تناقضًا اتضح عند التدقيق أنه تمييز بين تعريفات متنافسة.'},
    {level:'C2',text:'Were it not for the supplementary evidence, the committee’s provisional conclusion would have remained untenable.',ar:'لولا الأدلة الإضافية، لظل استنتاج اللجنة المؤقت غير قابل للدفاع عنه.'},
    {level:'C2',text:'The argument is persuasive insofar as it distinguishes empirical observations from normative assumptions.',ar:'تكون الحجة مقنعة بقدر ما تميز بين الملاحظات التجريبية والافتراضات المعيارية.'},
    {level:'C2',text:'Only after the underlying methodology had been scrutinised did the apparent precision of the estimates become questionable.',ar:'لم تصبح الدقة الظاهرية للتقديرات موضع شك إلا بعد فحص المنهجية الكامنة وراءها.'}
  ].map((item,index)=>({...item,id:'SB-'+item.level+'-'+String(index+1).padStart(2,'0')}));
  if (typeof window !== 'undefined' && typeof window.EPIPHANY_FLUENTIA_REGISTER_SOURCES === 'function') {
    window.EPIPHANY_FLUENTIA_REGISTER_SOURCES({
      practiceSamples:samples.map((item,index)=>({...item,id:'PL-'+item.level+'-'+String(index+1).padStart(2,'0')})),
      sentenceItems
    });
  }
})();
