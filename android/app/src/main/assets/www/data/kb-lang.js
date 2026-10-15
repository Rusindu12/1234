/* SipSaviya knowledge base · English, Sinhala & Tamil language skills */
window.SIP_KB = window.SIP_KB || [];
(function (K) {
  const ALL = [6, 7, 8, 9, 10, 11, 12, 13];

  K.push({
    s: "english", g: ALL, t: "Tenses (කාල භේද)", kind: "concept",
    k: "tense, tenses, present, past, future, කාලය, simple present, continuous, perfect, ව්‍යාකරණය, grammar, verb",
    d: "Tense කියන්නේ ක්‍රියාවක් සිදුවන කාලය පෙන්වන ක්‍රියා පද ස්වරූපයයි. Present, Past, Future ලෙස ප්‍රධාන කාල 3ක් ඇත; එක් එක් කාලයට Simple, Continuous, Perfect, Perfect Continuous ලෙස ආකාර 4ක් ඇත.",
    f: ["Present Simple: I go / He goes", "Present Continuous: am/is/are + V-ing",
      "Present Perfect: have/has + V3 (past participle)", "Past Simple: went / played",
      "Past Continuous: was/were + V-ing", "Future: will + V1 / going to + V1",
      "උදා: She has finished her homework. (Present Perfect)"],
    st: ["වාක්‍යයේ කාලය තීරණය කරන්න (කවදාද?)", "ක්‍රියා පදය හඳුනාගන්න (V1, V2, V3)", "කර්තෘවරයා අනුව සහායක ක්‍රියාපදය තෝරන්න (has/have, is/are)", "වාක්‍යය නැවත කියවන්න"],
    ex: "රටේ ප්‍රශ්නය: 'She ___ (study) now.' → She is studying now."
  });
  K.push({
    s: "english", g: ALL, t: "Active & Passive Voice (කර්තෘ හා කර්ම වාච්‍යය)", kind: "concept",
    k: "voice, active, passive, කර්ම වාච්‍යය, කර්තෘ, object, subject, be + past participle",
    d: "Active voice හි කර්තෘ ක්‍රියාව කරයි; Passive voice හි ක්‍රියාව ලබන වස්තුව කර්තෘ වේ.",
    f: ["Active: The chef cooked the meal.", "Passive: The meal was cooked by the chef.",
      "ව්‍යුහය: object + be + V3 (+ by + subject)", "කාලය අනුව be ක්‍රියාපදය වෙනස් වේ: is/are/was/were/has been/will be"],
    st: ["Object එක කර්තෘ ලෙස ගන්න", "ක්‍රියාපදයේ V3 ලියන්න", "නිවැරදි be ක්‍රියාපදය එකතු කරන්න", "by + කර්තෘ ලියන්න (අවශ්‍ය නම්)"],
    ex: "They built the bridge in 1998. → The bridge was built in 1998."
  });
  K.push({
    s: "english", g: ALL, t: "Reported Speech (වක්‍ර කථනය)", kind: "concept",
    k: "reported speech, indirect speech, වක්‍ර කථනය, direct speech, කථනය, say, tell, said that",
    d: "කෙනෙක් කී දේ තමන්ගේ වචනවලින් කීමයි. කථන වාක්‍යය මාරු කරන විට කාලය හා සර්වනාම පසුගාමී වේ.",
    f: ["Direct: He said, \"I am tired.\"", "Reported: He said that he was tired.",
      "am/is → was , are → were , will → would , can → could", "now → then , today → that day , tomorrow → the next day"],
    st: ["say/tell තෝරන්න (tell සමඟ object අවශ්‍ය)", "කාලය පසුගාමී කරන්න", "සර්වනාම වෙනස් කරන්න", "නිවැරදි සම්බන්ධකය යොදන්න (that/if)"],
    ex: "She said, \"Will you come?\" → She asked if I would come."
  });
  K.push({
    s: "english", g: ALL, t: "Articles & Prepositions (a, an, the / in, on, at)", kind: "concept",
    k: "article, articles, a an the, preposition, prepositions, in on at, ව්‍යාකරණය, පෙරසර්ග",
    d: "a/an අවිනිශ්චිත ලෙස එක් වස්තුවක් පෙන්වයි; the නිශ්චිත වස්තුවක් පෙන්වයි. Preposition කාලය, ස්ථානය හා දිශාව පෙන්වයි.",
    f: ["a + ව්‍යංජන ශබ්දය (a book)", "an + ස්වර ශබ්දය (an apple, an hour)",
      "the + නිශ්චිත (the sun, the book I bought)", "at + නිශ්චිත වේලාව/ස්ථානය (at 5 o'clock)",
      "in + මාසය/වර්ෂය/විශාල ස්ථානය (in July, in Colombo)", "on + දිනය/දිනය (on Monday)"],
    st: ["ඊළඟ වචනයේ මුල් ශබ්දය ස්වරයක්ද බලන්න", "වස්තුව නිශ්චිතද අවිනිශ්චිතද තීරණය කරන්න", "කාලය/ස්ථානයේ ප්‍රමාණය අනුව preposition තෝරන්න"],
    ex: "He went ____ school ____ 8 a.m. on Monday. → to school, at 8 a.m."
  });
  K.push({
    s: "english", g: ALL, t: "Essay & Letter Writing (රචනා ලිවීම)", kind: "skill",
    k: "essay, writing, letter, රචනා, ලිපිය, paragraph, introduction, conclusion, විධිමත් ලිපි",
    d: "හොඳ රචනාවක ආයාචනය (introduction), විස්තර (body) හා නිගමනය (conclusion) ඇත. එක් ඡේදයකට එක් අදහසක් ලියන්න.",
    f: ["රචනා ව්‍යුහය: Introduction (2–3 වාක්‍ය) → Body (3–4 ඡේද) → Conclusion (2–3 වාක්‍ය)",
      "විධිමත් ලිපිය: Sender's address → Date → Receiver's address → Salutation → Subject → Body → Yours faithfully",
      "අවිධිමත් ලිපිය: Dear + නම, Yours sincerely",
      "සම්බන්ධක වචන: firstly, moreover, however, therefore, in conclusion"],
    st: ["මාතෘකාව (topic) තේරුම් ගන්න", "අදහස් 3–4ක් ලැයිස්තු කරන්න", "එක් අදහසකට එක් ඡේදයක් ලියන්න", "නිගමනයෙන් අවසන් කරන්න"],
    ex: "ශිෂ්‍ය නායකත්වය ගැන රචනාවක්: අර්ථය → ලක්ෂණ 3ක් → වැදගත්කම → නිගමනය"
  });
  K.push({
    s: "english", g: [9, 10, 11, 12, 13], t: "Comprehension & Summary (ප්‍රත්‍යර්ථකරණය)", kind: "skill",
    k: "comprehension, summary, ප්‍රත්‍යර්ථකරණය, passage, කියවීම, summary writing, සාරාංශය",
    d: "කියවා අර්ථය ග්‍රහණය කර, වැදගත් කරුණු සංක්ෂිප්තව ලිවීම කුසලතාවයි.",
    f: ["සාරාංශය = මුල් ලියවිල්ලේ 1/3කට වඩා අඩු විය යුතුය",
      "ශිල්ප ක්‍රමය: Skim → Scan → Note keywords → Rewrite in own words"],
    st: ["පළමුව මුළු ඡේදය කියවන්න", "ප්‍රශ්නයේ මූල පදය සොයන්න", "පිළිතුර ඡේදයෙන් පමණක් දෙන්න", "තමන්ගේ වචනවලින් ලියන්න"],
    ex: "'The main reason is…' යනුවෙන් ඉදිරිපත් වන කරුණ ප්‍රශ්නවලට පිළිතුරුවල ප්‍රධාන මූලාශ්‍රයයි."
  });
  K.push({
    s: "english", g: [9, 10, 11, 12, 13], t: "Vocabulary & Spelling (වචන මාලාව)", kind: "skill",
    k: "vocabulary, spelling, synonyms, antonyms, වචන, සමාන පද, විරුද්ධ පද, word formation", 
    d: "වචන මාලාව පුළුල් කිරීමට සමාන පද (synonyms), විරුද්ධ පද (antonyms) හා උපසර්ග/ප්‍රත්‍යය ඉගෙන ගන්න.",
    f: ["සමාන පද: big–large, begin–start, happy–glad", "විරුද්ධ පද: increase–decrease, ancient–modern",
      "උපසර්ග: un-, dis-, im-, re- (unhappy, replay)", "ප්‍රත්‍යය: -ness, -ment, -tion (happiness, movement)"],
    st: ["වචනය වාක්‍යයක යොදන්න", "පද වර්ගය (noun/verb/adjective) හඳුනාගන්න", "කුටුම්බ වචන ලියන්න"],
    ex: "success (noun) → successful (adj) → successfully (adv) → succeed (verb)"
  });
  K.push({
    s: "english", g: [10, 11, 12, 13], t: "Conditionals & Modals (If clauses)", kind: "concept",
    k: "conditional, if clause, modal, modals, can could may might should must, කොන්දේසි, වාක්‍ය",
    d: "කොන්දේසි පෙන්වන If වාක්‍ය 3ක් ඇත. Modals මගින් හැකියාව, අවශ්‍යතාව හා අවසරය පෙන්වයි.",
    f: ["Type 1 (සැබෑ): If it rains, I will stay at home.",
      "Type 2 (අතාත්වික): If I had money, I would buy a car.",
      "Type 3 (අතීතයේ සිදු නොවූ): If I had studied, I would have passed.",
      "must = අවශ්‍යයි, should = යුතුයි/සුදුසුයි, might = විය හැකියි"],
    st: ["කොන්දේසියේ කාලය තීරණය කරන්න", "ගැලපෙන type එක තෝරන්න", "මූල ක්‍රියාපදයේ කාලය ගැලපෙන ලෙස ලියන්න"],
    ex: "If she ____ (be) taller, she would join the team. → were"
  });
  K.push({
    s: "english", g: [1, 2, 3, 4, 5], t: "Phonics & Alphabet (අකුරු හා ශබ්ද)", kind: "concept",
    k: "alphabet, phonics, letters, capital, small letters, vowels, consonants, අකුරු, ශබ්ද, කියවීම",
    d: "English අකුරු 26ක් ඇත. A, E, I, O, U ස්වර (vowels); ඉතිරි ඒවා ව්‍යංජන (consonants).",
    f: ["Vowels: A E I O U", "Consonants: B C D F G H J K L M N P Q R S T V W X Y Z",
      "Capital letters: A B C…  Small letters: a b c…"],
    st: ["අකුරු නමින් කියන්න", "අකුරේ ශබ්දය කියන්න", "එම අකුරින් වචනයක් කියන්න"],
    ex: "B – /b/ – Ball, C – /k/ – Cat"
  });
  K.push({
    s: "sinhala", g: [6, 7, 8, 9, 10, 11], t: "ව්‍යාකරණය: නාම පද හා ක්‍රියා පද", kind: "concept",
    k: "ව්‍යාකරණය, නාම පදය, ක්‍රියා පදය, විශේෂණය, සර්වනාම, විභක්ති, කාරක, සන්ධි, සමාස",
    d: "නාම පදය කෙනෙක් හෝ දෙයක් හඳුන්වයි. ක්‍රියා පදය ක්‍රියාව පෙන්වයි. විභක්ති මගින් නාම පදයේ වැඩ කාරකය පෙන්වයි.",
    f: ["කර්තෘ කාරකය: පුද්ගලයා/දේ (රාමු)",
      "කර්ම කාරකය: දුන්නු දේ (අලියාට)",
      "සම්ප‍්‍රදාන: ලැබූ අය (පුතුට)",
      "ආධාර කාරකය: උපකරණය (-යෙන්, -නින්)"],
    st: ["වාක්‍යය ලියන්න", "නාම පද හා ක්‍රියා පද හඳුනාගන්න", "කාරකය තීරණය කරන්න"],
    ex: "රමේෂ් පොත අත්‍යයි. → කර්තෘ: රමේෂ්, කර්ම: පොත"
  });
  K.push({
    s: "sinhala", g: [10, 11, 12, 13], t: "ව්‍යුත්පත්ති හා ඡන්දස් (Prosody)", kind: "concept",
    k: "ව්‍යුත්පත්ති, ඡන්දස්, වෘත්ත, ගී, සිලෝ, අක්ෂර, මාත්‍රා, සමුද්‍රඝෝෂය, කවි",
    d: "සිංහල කවි රචනා කිරීමේදී ගුරු (ග) හා ලඝු (ල) අක්ෂර මාත්‍රා අනුව පාද සකස් කරයි.",
    f: ["ගුරු අක්ෂර = මාත්‍රා 2, ලඝු අක්ෂර = මාත්‍රා 1",
      "සමුද්‍රඝෝෂය: ග ල ල ග ල ග ල ග … ", "ඉන්ද්‍රවංශය: ල ල ල ග ග", "වර්ණ රීතිය: අක්ෂර සංඛ්‍යාව නියමය"],
    st: ["කවි පාදය ලියන්න", "අක්ෂර මාත්‍රා ගණන් කරන්න", "වෘත්තයට ගැලපේද බලන්න"],
    ex: "'හිරු රැස් වගේ සිසිලස පැතිරේ' — ල ල ග ල ග ල ල ග"
  });
  K.push({
    s: "tamil", g: [6, 7, 8, 9, 10, 11], t: "தமிழ் இலக்கணம் (Tamil grammar)", kind: "concept",
    k: "தமிழ், tamil, இலக்கணம், எழுத்து, சொல், வாக்கியம், உயிர், மெய், உயிர்மெய்",
    d: "தமிழ் எழுத்துக்கள் உயிர் (12), மெய் (18), உயிர்மெய் (216) எனப் பிரிக்கப்படுகின்றன.",
    f: ["உயிர்: அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ", "மெய்: க் ங் ச் ஞ் ட் ண் த் ந் ப் ம் ய் ர் ல் வ் ழ் ள் ற் ன்",
      "வாக்கியம்: எழுவாய் + பயனிலை"],
    st: ["எழுத்துக்களை எழுதுங்கள்", "சொற்களை உருவாக்குங்கள்", "வாக்கியம் அமையுங்கள்"],
    ex: "நான் பாடம் படிக்கிறேன். (எழுவாய்: நான், பயனிலை: படிக்கிறேன்)"
  });
})(window.SIP_KB);
