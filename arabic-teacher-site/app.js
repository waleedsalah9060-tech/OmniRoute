/* ============================================================
   أ. وليد الصاوي — محرك المختبر التفاعلي
   - تحميل الدروس من data/lessons.json (مع بيانات احتياطية مدمجة
     ليعمل الموقع حتى عند فتحه مباشرة دون خادم)
   - تصفية حسب المرحلة + بحث نصي
   - إعراب تفاعلي عند النقر على الكلمات
   - تدريب سريع مع نقاط تراكمية
   ============================================================ */
(function () {
  "use strict";

  var container = document.getElementById("lessons-container");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var searchInput = document.getElementById("lesson-search");
  var scorePill = document.getElementById("score-pill");
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  var allLessons = [];
  var currentStage = "all";
  var currentQuery = "";
  var score = { correct: 0, answered: 0 };
  var answeredLessons = {};

  /* ---------- بيانات احتياطية (تعمل دون خادم) ---------- */
  var FALLBACK = [
    {
      id: "mamnoo-min-alsarf", stage: "secondary", stageLabel: "المرحلة الثانوية", branch: "نحو",
      title: "المَمْنُوعُ مِنَ الصَّرْفِ: عِلَلُ المَنْعِ وَدَقَائِقُ الإِعْرَابِ",
      summary: "دراسة تحليلية في الأسماء المعربة التي لا يدخلها التنوين، وتُجرّ بالفتحة نيابة عن الكسرة ما لم تُضف أو تقترن بـ (أل)، مستندةً إلى منهج ابن هشام في مغني اللبيب.",
      shahid: { text: "﴿وَأَوْحَيْنَا إِلَىٰ إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ﴾", source: "سورة النساء: 163", analysis: "جُرَّت الأعلام الأعجمية بالفتحة الظاهرة نيابةً عن الكسرة؛ لاجتماع علتين: العلمية والعجمة." },
      irabInteractive: [
        { word: "إِلَىٰ", parse: "حرف جر مبني على السكون لا محل له من الإعراب." },
        { word: "إِبْرَاهِيمَ", parse: "اسم مجرور بحرف الجر (إلى) وعلامة جره الفتحة الظاهرة نيابة عن الكسرة؛ لأنه ممنوع من الصرف للعلمية والعجمة." }
      ],
      quiz: { question: "متى يُجرُّ الممنوع من الصرف بالكسرة الظاهرة؟", options: ["إذا كان علمًا مؤنثًا ثلاثيًا ساكن الوسط", "إذا اقترن بـ (أل) أو أُضيف إلى ما بعده", "إذا جاء نكرة في سياق النفي"], answerIndex: 1, explanation: "يزول أثر المنع في الجر بالفتحة متى دخلت (أل) على الاسم أو أُضيف، فيعود إلى الأصل وهو الجر بالكسرة." }
    },
    {
      id: "nafy-al-mudari", stage: "primary", stageLabel: "المرحلة الابتدائية", branch: "نحو وأساليب",
      title: "أُسْلُوبُ النَّفْيِ وَالفَرْقُ بَيْنَ (لَمْ) وَ(لَنْ)",
      summary: "فهم دلالة النفي في الزمن الماضي والمستقبل، وأثر أدوات النفي على ضبط آخر الفعل المضارع.",
      shahid: { text: "لَمْ أُلَوِّثْ مَاءَ النَّهْرِ.", source: "تطبيق لغوي تربوي", analysis: "(لَمْ) حرف نفي وجزم وقلب؛ نفى حدوث التلويث في الزمن الماضي، وجزم الفعل المضارع (أُلَوِّثْ) بالسكون." },
      irabInteractive: [
        { word: "لَمْ", parse: "حرف نفي وجزم وقلب مبني على السكون لا محل له من الإعراب." },
        { word: "أُلَوِّثْ", parse: "فعل مضارع مجزوم بـ (لم) وعلامة جزمه السكون الظاهر، والفاعل ضمير مستتر وجوبًا تقديره (أنا)." },
        { word: "مَاءَ", parse: "مفعول به منصوب وعلامة نصبه الفتحة الظاهرة، وهو مضاف." },
        { word: "النَّهْرِ", parse: "مضاف إليه مجرور وعلامة جره الكسرة الظاهرة." }
      ],
      quiz: { question: "ما أثر (لَمْ) على زمن الفعل المضارع؟", options: ["تجعله دالًا على المستقبل", "تقلبه إلى الزمن الماضي", "تبقيه للحال فقط"], answerIndex: 1, explanation: "تُسمى (لم) حرف قلب لأنها تقلب دلالة الفعل المضارع من الحاضر والمستقبل إلى الزمن الماضي." }
    },
    {
      id: "balagha-isteara", stage: "preparatory", stageLabel: "المرحلة الإعدادية", branch: "بلاغة وتذوق",
      title: "التَّصْوِيرُ البَيَانِيُّ وَجَمَالُ التَّشْخِيصِ فِي الشِّعْرِ العَرَبِيِّ",
      summary: "كيف يحوّل الشاعر المعاني المجردة والأوطان إلى كائنات حية تنبض بالحياة والمشاعر.",
      shahid: { text: "مِصْرُ نَبْضُ القَلْبِ فِي أَعْمَاقِنَا", source: "من الشعر الوطني المعاصر (فاروق جويدة)", analysis: "تصوير بليغ لمصر بالنبض الذي يسري في القلب؛ يوحي بشدة التعلق وارتباط الحياة بحب الوطن." },
      irabInteractive: [
        { word: "مِصْرُ", parse: "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة." },
        { word: "نَبْضُ", parse: "خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة، وهو مضاف." },
        { word: "القَلْبِ", parse: "مضاف إليه مجرور وعلامة جره الكسرة الظاهرة." }
      ],
      quiz: { question: "ما القيمة الفنية لتصوير الوطن بنبض القلب؟", options: ["بيان الكثرة والاتساع الجغرافي", "الإيحاء بأن الوطن سر الحياة ومركز الشعور", "التأكيد على قدم التاريخ"], answerIndex: 1, explanation: "النبض هو دليل الحياة في الجسد، فجعله للوطن يبرز أنه لا حياة حقيقية للإنسان دونه." }
    }
  ];

  /* ---------- أدوات مساعدة ---------- */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function toArabicDigits(n) {
    return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; });
  }

  function updateScore() {
    if (scorePill) {
      scorePill.textContent = "نقاط التدريب: " + toArabicDigits(score.correct) + " / " + toArabicDigits(score.answered);
    }
  }

  function getFiltered() {
    var q = currentQuery.trim();
    return allLessons.filter(function (lesson) {
      var stageOk = currentStage === "all" || lesson.stage === currentStage;
      if (!stageOk) return false;
      if (!q) return true;
      var hay = [lesson.title, lesson.summary, lesson.branch, lesson.stageLabel,
        lesson.shahid && lesson.shahid.text, lesson.shahid && lesson.shahid.source].join(" ");
      return hay.indexOf(q) !== -1;
    });
  }

  /* ---------- العرض ---------- */
  function renderLessons(lessons) {
    if (!container) return;
    container.innerHTML = "";

    if (!lessons.length) {
      container.innerHTML = '<div class="empty-state"><strong>لا توجد نتائج مطابقة.</strong><br>جرّب تغيير المرحلة أو كلمة بحث أخرى.</div>';
      return;
    }

    lessons.forEach(function (lesson) {
      var card = document.createElement("article");
      card.className = "lesson-card";
      card.id = "lesson-" + lesson.id;

      var wordsHtml = (lesson.irabInteractive || []).map(function (w, idx) {
        return '<button type="button" class="word-chip" data-idx="' + idx + '">' + escapeHtml(w.word) + "</button>";
      }).join("");

      var optionsHtml = (lesson.quiz && lesson.quiz.options || []).map(function (opt, idx) {
        return '<button type="button" class="quiz-opt" data-opt="' + idx + '">' + escapeHtml(opt) + "</button>";
      }).join("");

      card.innerHTML =
        '<div class="lesson-meta">' +
          '<span class="tag tag-stage">' + escapeHtml(lesson.stageLabel) + "</span>" +
          '<span class="tag tag-branch">' + escapeHtml(lesson.branch) + "</span>" +
        "</div>" +
        '<h3 class="lesson-title">' + escapeHtml(lesson.title) + "</h3>" +
        '<p class="lesson-summary">' + escapeHtml(lesson.summary) + "</p>" +
        '<div class="shahid-box">' +
          '<div class="shahid-text">' + escapeHtml(lesson.shahid.text) + "</div>" +
          '<div class="shahid-source">المصدر: ' + escapeHtml(lesson.shahid.source) + "</div>" +
          '<p class="shahid-analysis">' + escapeHtml(lesson.shahid.analysis) + "</p>" +
        "</div>" +
        '<div class="irab-section">' +
          '<span class="irab-label">الإعراب التفاعلي (اضغط على الكلمة):</span>' +
          '<div class="irab-words">' + wordsHtml + "</div>" +
          '<div class="irab-output">اختر كلمة من الأعلى لعرض إعرابها هنا…</div>' +
        "</div>" +
        '<div class="quiz-box">' +
          '<div class="quiz-question">تدريب سريع: ' + escapeHtml(lesson.quiz.question) + "</div>" +
          '<div class="quiz-options">' + optionsHtml + "</div>" +
          '<div class="quiz-feedback" aria-live="polite"></div>' +
        "</div>";

      /* الإعراب التفاعلي */
      var chips = card.querySelectorAll(".word-chip");
      var output = card.querySelector(".irab-output");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("selected"); });
          chip.classList.add("selected");
          var item = lesson.irabInteractive[Number(chip.dataset.idx)];
          output.innerHTML = "<strong>" + escapeHtml(item.word) + ":</strong> " + escapeHtml(item.parse);
        });
      });

      /* التدريب السريع */
      var optBtns = card.querySelectorAll(".quiz-opt");
      var feedback = card.querySelector(".quiz-feedback");
      optBtns.forEach(function (optBtn) {
        optBtn.addEventListener("click", function () {
          var chosen = Number(optBtn.dataset.opt);
          var isCorrect = chosen === lesson.quiz.answerIndex;
          optBtns.forEach(function (b) { b.classList.remove("correct", "wrong"); });
          if (isCorrect) {
            optBtn.classList.add("correct");
            feedback.textContent = "إجابة صحيحة ✅ — " + lesson.quiz.explanation;
          } else {
            optBtn.classList.add("wrong");
            feedback.textContent = "حاول مرة أخرى — " + lesson.quiz.explanation;
          }
          /* احتساب النقاط مرة واحدة لكل درس */
          if (!answeredLessons[lesson.id]) {
            answeredLessons[lesson.id] = true;
            score.answered += 1;
            if (isCorrect) score.correct += 1;
            updateScore();
          }
        });
      });

      container.appendChild(card);
    });
  }

  function applyFilters() { renderLessons(getFiltered()); }

  /* ---------- التصفية ---------- */
  function setStage(stage) {
    currentStage = stage;
    filterButtons.forEach(function (b) {
      var active = b.dataset.stage === stage;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    applyFilters();
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setStage(btn.dataset.stage); });
  });

  /* روابط مسارات الزوار */
  document.querySelectorAll("[data-goto-stage]").forEach(function (link) {
    link.addEventListener("click", function () { setStage(link.dataset.gotoStage); });
  });

  /* البحث */
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentQuery = searchInput.value;
      applyFilters();
    });
  }

  /* قائمة الجوال */
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });
  }

  /* ---------- التحميل ---------- */
  updateScore();
  if (window.fetch) {
    fetch("data/lessons.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        allLessons = Array.isArray(data) && data.length ? data : FALLBACK;
        applyFilters();
      })
      .catch(function () {
        allLessons = FALLBACK;
        applyFilters();
      });
  } else {
    allLessons = FALLBACK;
    applyFilters();
  }
})();
