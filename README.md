# සිප්සවිය · SipSaviya 🇱🇰

**ශ්‍රී ලංකාවේ සිසුන් සඳහා නොමිලේ අධ්‍යාපන ඇන්ඩ්‍රොයිඩ් යෙදුම** — පාසල් පෙළපොත්, පසුගිය ප්‍රශ්න පත්‍ර, පුහුණු ප්‍රශ්න, පාඩම් කාලසටහන් සහ
**අන්තර්ජාලය නොමැතිව ක්‍රියා කරන AI ගුරුවරයෙක්** — සියල්ල එකම යෙදුමක.

*Free, offline study app for Sri Lankan students (Grades 1–13, Sinhala / Tamil / English medium):
government textbooks, past papers, practice questions, an automatic study planner and an on-device AI tutor.*

**⬇️ බාගත කරන්න (Download APK):**
`https://github.com/Rusindu12/1234/releases/latest/download/SipSaviya.apk`

---

## ⚡ මොනවද මේකේ තියෙන්නේ · What's inside

| | දේ (Feature) | විස්තරය (Details) |
|---|---|---|
| 📚 | **පාසල් පොත් (Books)** | 1–13 ශ්‍රේණි · සිංහල / දෙමළ / English · අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුවේ (EPD) නිල නොමිලේ PDF සඳහා සෘජු පිවිසුම් |
| 📝 | **පසුගිය ප්‍රශ්න පත්‍ර (Past papers)** | 5 ශ්‍රේණිය ශිෂ්‍යත්වය · සා.පෙ. · උ.පෙ. (විද්‍යා / වාණිජ / කලා / තාක්ෂණ) · විභාග දෙපාර්තමේන්තුවේ නිල පත්‍ර + ප්‍රතිචාර පත්‍ර |
| 🤖 | **AI ගුරුවරයා (AI tutor)** | ඔබගේම දුරකථනයේ ධාවනය වන AI එකක් — ප්‍රශ්න අහන්න, පියවරෙන් පියවර පිළිතුරු ලබාගන්න. අන්තර්ජාලය අවශ්‍ය නැහැ. |
| 🧮 | **ගණනය කිරීමේ එන්ජිම** | සමීකරණ (රේඛීය · ද්විතීයික · සමගාමී), භාග (නිශ්චිත), ජ්‍යාමිතිය, සංඛ්‍යානය, ඒකක පරිවර්තනය, භෞතික/රසායන සූත්‍ර |
| 🎯 | **පුහුණු ප්‍රශ්න (Quiz)** | MCQ බැංකුව + දුර්වල විෂයයන්ට ප්‍රමුඛතාව · පිළිතුරු සමඟ පැහැදිලි කිරීම් |
| 🃏 | **ෆ්ලෑෂ් කාඩ් (SRS)** | Spaced-repetition මතක තබා ගැනීමේ පද්ධතිය |
| 📅 | **පාඩම් කාලසටහන** | විභාග දිනය දුන්නම විෂය නිර්දේශය දින අනුව බෙදා දිනපතා ලිස්ට් එකක් සාදයි |
| 📊 | **ප්‍රගතිය** | නිරවද්‍යතාව, දින පෙළක් (streak), විෂය අනුව දුර්වල කොටස් |
| 🪶 | **ප්‍රමාණය** | APK එක **~160 KB** පමණි (කිසිදු library නැහැ), බැටරියට හිතකර |

---

## 📥 ස්ථාපනය කරන ආකාරය · How to install

1. පහත ලින්ක් එකෙන් **SipSaviya.apk** බාගත කරන්න →
   `https://github.com/Rusindu12/1234/releases/latest/download/SipSaviya.apk`
2. දුරකථනයේ **Settings → Apps → Special access → Install unknown apps** වෙතින්
   ඔබ APK එක විවෘත කරන යෙදුමට (Chrome / Files) අවසර දෙන්න.
3. බාගත කළ APK එක ඔබා **Install** කරන්න. 🎉

> ✅ සම්පූර්ණයෙන්ම නොමිලේ · දැන්වීම් නැහැ · ලොගින් නැහැ · දත්ත එකතු කිරීමක් නැහැ · අන්තර්ජාලය අවශ්‍ය නැහැ.
> Android 7.0 (API 24) හෝ ඉහළ ඕනෑම දුරකථනයක වැඩ කරයි.

---

## 🤖 AI ගුරුවරයා කොහොමද වැඩ කරන්නේ (තාක්ෂණික)

සිප්සවියේ AI එක **සම්පූර්ණයෙන්ම දුරකථනය තුළ** ධාවනය වේ. කිසිදු API එකකට හෝ සේවාදායකයකට දත්ත යවන්නේ නැත.

1. **භාෂා ස්ථරය (`js/ai/nlp.js`)** — සිංහල දෙමළ ඉංග්‍රීසි ටෝකනීකරණය, zero-width joiner සාමාන්‍යකරණය,
   උපසර්ග කපා හැරීම, අභිප්‍රාය (intent) හා විෂය හඳුනා ගැනීම.
2. **අර්ථ සෙවීම (`js/ai/embed.js`)** — දැනුම් පත් සියල්ල TF-IDF බර ලබා, **කැපූ SVD (LSA)** මගින්
   මාන 24ක ලේටන්ට් අවකාශයකට ව්‍යාපෘති කරයි (power iteration + deflation, ග්‍රෑම් න්‍යාසය A·Aᵀ මත).
   ප්‍රශ්නයද එම අවකාශයට ව්‍යාපෘති කර cosine සමානතාවයෙන් **BM25 පාරිභාෂික ලකුණු** සමඟ මිශ්‍ර කරයි.
3. **ගණනය කිරීමේ එන්ජිම (`js/ai/solver.js`)** — නිශ්චිත භාග ගණිතය (rational arithmetic),
   සමීකරණ විසඳීම, ජ්‍යාමිතිය, සංඛ්‍යානය, ඒකක පරිවර්තනය, භෞතික/රසායන සූත්‍ර — ලේබල් කළ රාශි හඳුනාගෙන.
4. **ගුරුවරයා (`js/ai/brain.js`)** — අභිප්‍රාය අනුව විසඳුම / පැහැදිලි කිරීම / ප්‍රශ්නය / කාලසටහන / උනන්දුව
   ලෙස පිළිතුර සකසයි. විශ්වාසය අඩු විට අවංකව කියයි.
5. **ඉගෙනුම් එන්ජිම (`js/ai/study.js`)** — දුර්වල විෂයයන්ට ප්‍රමුඛතාව දෙන ප්‍රශ්න තේරීම,
   SM-2 වැනි කාඩ් කාලසටහන, ස්වයංක්‍රීය පාඩම් සැලසුම.

**ස්වයං පරීක්ෂණ (self-tests) — සියල්ල නොමිලේ, offline:**

```bash
node tools/verify_content.js          # දැනුම් පත් / ප්‍රශ්න / AI පිළිතුරු 16 (16/16)
node tools/verify_content.js --dump   # උදාහරණ පිළිතුරු බලන්න
npm install && node tools/ui_test.js  # jsdom එකෙන් මුළු UI එකම click කර පරීක්ෂා කිරීම (23/23)
python3 tools/build_web.py            # CI build පියවර: පරීක්ෂා කර manifest.json ලියයි
python3 tools/make_icons.py           # නැවත launcher icons අඳියි (කිසිදු dependency නැහැ)
```

කිසිවක් වැරදි නම් CI මගින් APK නිකුත් නොකෙරේ.

---

## 🛠️ ගොඩනඟන ආකාරය · Building from source

**GitHub Actions (නිකම් push කරන්න — ස්වයංක්‍රීයව build වේ):**
`.github/workflows/android-release.yml` — JDK 17 + Gradle 8.9 + Android SDK 34 මත
`assembleRelease` කර APK එක GitHub Release එකකට අමුණයි.

```bash
# දේශීයව (with Android SDK + JDK 17 installed)
cd android
gradle assembleRelease        # → app/build/outputs/apk/release/app-release.apk
```

ව්‍යුහය (Project layout):

```
android/                      Android shell (Java, no Kotlin/AndroidX → tiny + fast builds)
  app/src/main/java/lk/sipsaviya/app/MainActivity.java   WebView host + JS bridge
  app/src/main/assets/www/    the entire product: UI, content, AI (works offline)
    index.html · css/ · js/app.js
    js/ai/{nlp,embed,solver,study,brain}.js
    data/{subjects,kb-*,quiz}.js
tools/                        content validator, UI smoke test, icon generator, CI build step
  verify_content.js             content + AI regression harness (no dependencies)
  ui_test.js                    drives the whole SPA in jsdom (needs jsdom)
  build_web.py                  CI step: validates everything, writes data/manifest.json
  make_icons.py                 draws the launcher icons (pure Python, no dependencies)
.github/workflows/            APK build + release automation (build → verify → release)
```

---

## 🌐 බ්‍රවුසරයේ උත්සාහ කරන්න · Try it in a browser

APK එක තමයි අවසන් නිෂ්පාදනය, නමුත් UI එක ඕනෑම බ්‍රවුසරයක (හෝ desktop එකේ) ක්‍රියා කරයි:

```bash
cd android/app/src/main/assets/www
python3 -m http.server 8000        # → http://localhost:8000
```

---

## 🏛️ දත්ත මූලාශ්‍ර · Data sources & credits

සියලුම නිල අන්තර්ගතය ලබා දෙන්නේ **නොමිලේ නිකුත් කරන රජයේ ආයතන විසිනි**; අපි ඒවාට සෘජුව යොමු කරමු
(ගොනු පිටපත් නොකරමු — එමගින් මූලාශ්‍රය නිතර යාවත්කාලීනව පවතී):

* **පෙළපොත්** — අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුව · <http://www.edupub.gov.lk/>
* **පසුගිය ප්‍රශ්න පත්‍ර** — විභාග දෙපාර්තමේන්තුව · <https://www.doenets.lk/pastpapers>
* **පාඩම් හා වීඩියෝ** — e-Thaksalawa (අධ්‍යාපන අමාත්‍යාංශය) · <https://e-thaksalawa.moe.gov.lk/>
* **විෂය නිර්දේශ** — ජාතික අධ්‍යාපන ආයතනය (NIE) · <https://www.nie.ac.lk/>

AI පිළිතුරු හා ගණනයන් යෙදුම තුළම සාදන ලද විෂය දැනුම මත පදනම් වේ — **තමන්ගේ වැඩ ගුරුවරයා සමඟ
නිතර පරීක්ෂා කරන්න**. මෙය විභාග ප්‍රතිඵල සඳහා වගකීමක් නොගනී.

## 📄 බලපත්‍රය · License

GPL-3.0 (මෙම ගබඩාවේ `LICENSE` බලන්න). යෙදුම නැවත බෙදාහැරීමට, වෙනස් කිරීමට හා පාසල්වල
භාවිතයට නිදහසේ අවසර ඇත — **නොමිලේම පවතින්නට ඕනෑ** (no cost, full free).

---

### සිසුන්ට කෙටි උපදෙස් 💚

* පොත බාගත කර **Files** ෆෝල්ඩරයේ තබාගන්න → අන්තර්ජාලය නැතිවත් කියවන්න පුළුවන්.
* අමාරු පාඩමක් දැනුණොත් AI ගුරුවරයාගෙන් අහන්න: “ප්‍රතිශතය පියවරෙන් පැහැදිලි කරන්න”.
* දිනකට විනාඩි 40ක් පවා නිතර නිතර කිරීම — එක දිනක පැය 4කට වඩා ප්‍රතිඵල දෙනවා.
* මිතුරන්ටත් බෙදාගන්න. 📤
