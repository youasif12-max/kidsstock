import React, { useEffect, useMemo, useState } from "react";

// 어린이를 위한 주식 학습 + 모의투자 올인원 단일 파일 컴포넌트
// - Tailwind 기반 스타일 (프로젝트에 Tailwind가 없어도 기본적으로 보이지만, 있으면 더 예쁨)
// - 로컬스토리지 저장으로 진행 상황 유지
// - 수업 ▶ 퀴즈 ▶ 모의투자 ▶ 용어사전 탭으로 구성
// - 실제 시세/실거래 없음 (전적으로 교육용)

export default function KidsStockApp() {
  const [tab, setTab] = useState("home");
  const [coins, setCoins] = useState(1000); // 아이 전용 화폐
  const [portfolio, setPortfolio] = useState({}); // { TICKER: { qty, avgPrice } }
  const [day, setDay] = useState(1);
  const [history, setHistory] = useState([]); // 거래/이벤트 로그
  const [completedLessons, setCompletedLessons] = useState({});
  const [quizProgress, setQuizProgress] = useState({ score: 0, done: false });

  // 가짜 종목 데이터 (어린이 친화적 네이밍)
  const baseStocks = useMemo(
    () => [
      {
        ticker: "CNDY",
        name: "캔디컴퍼니 🍬",
        desc: "달콤한 사탕을 만드는 회사",
        sector: "소비재",
        price: 50,
      },
      {
        ticker: "PLNT",
        name: "행성게임즈 🎮",
        desc: "재밌는 비디오게임을 만드는 회사",
        sector: "엔터테인먼트",
        price: 80,
      },
      {
        ticker: "WATR",
        name: "맑은샘워터 💧",
        desc: "깨끗한 생수를 파는 회사",
        sector: "필수소비재",
        price: 30,
      },
    ],
    []
  );

  const [stocks, setStocks] = useState(baseStocks);

  // 로컬스토리지에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("kids-stock-app");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setTab(obj.tab ?? "home");
        setCoins(obj.coins ?? 1000);
        setPortfolio(obj.portfolio ?? {});
        setDay(obj.day ?? 1);
        setHistory(obj.history ?? []);
        setCompletedLessons(obj.completedLessons ?? {});
        setQuizProgress(obj.quizProgress ?? { score: 0, done: false });
        setStocks(obj.stocks ?? baseStocks);
      } catch {}
    }
  }, [baseStocks]);

  // 로컬스토리지 저장
  useEffect(() => {
    const payload = {
      tab,
      coins,
      portfolio,
      day,
      history,
      completedLessons,
      quizProgress,
      stocks,
    };
    localStorage.setItem("kids-stock-app", JSON.stringify(payload));
  }, [tab, coins, portfolio, day, history, completedLessons, quizProgress, stocks]);

  // 가격 업데이트 로직 (랜덤 + 이벤트)
  function nextDay() {
    const events = [
      {
        match: "CNDY",
        text: "새로운 초코바 출시! 사람들 줄 서서 삼 👏",
        impact: +0.15,
      },
      { match: "CNDY", text: "설탕 가격 상승 😬", impact: -0.1 },
      {
        match: "PLNT",
        text: "신작 게임 대박! 스트리머들이 극찬 🤩",
        impact: +0.2,
      },
      { match: "PLNT", text: "서버 오류로 접속 불가 🛠️", impact: -0.12 },
      {
        match: "WATR",
        text: "폭염으로 생수 판매 급증 ☀️",
        impact: +0.1,
      },
      { match: "WATR", text: "생산 공장 점검 이슈 🏭", impact: -0.08 },
    ];

    // 오늘의 랜덤 이벤트 0~2개
    const todayEvents = shuffle(events).slice(0, Math.floor(Math.random() * 3));

    const updated = stocks.map((s) => {
      // 기본 랜덤 변동
      const noise = (Math.random() - 0.5) * 0.06; // ±3%
      let change = noise;
      // 이벤트 반영
      todayEvents.forEach((e) => {
        if (e.match === s.ticker) change += e.impact;
      });
      const newPrice = Math.max(1, round2(s.price * (1 + change)));
      return { ...s, price: newPrice };
    });

    setStocks(updated);
    setDay((d) => d + 1);

    if (todayEvents.length > 0) {
      setHistory((h) => [
        { type: "event", day: day + 1, texts: todayEvents.map((e) => e.text) },
        ...h,
      ]);
    } else {
      setHistory((h) => [
        { type: "event", day: day + 1, texts: ["특별한 소식 없음. 시장은 잔잔~"] },
        ...h,
      ]);
    }
  }

  function buy(ticker, price) {
    const qty = 1; // 어린이용: 1주씩만 매수
    if (coins < price) return alert("코인이 부족해요!");
    setCoins((c) => round2(c - price));
    setPortfolio((p) => {
      const prev = p[ticker] || { qty: 0, avgPrice: 0 };
      const newQty = prev.qty + qty;
      const newAvg = round2((prev.avgPrice * prev.qty + price) / newQty);
      return { ...p, [ticker]: { qty: newQty, avgPrice: newAvg } };
    });
    setHistory((h) => [
      { type: "trade", day, text: `${ticker} 1주 매수 @ ${price}` },
      ...h,
    ]);
  }

  function sell(ticker, price) {
    const prev = portfolio[ticker];
    if (!prev || prev.qty <= 0) return alert("팔 수 있는 주식이 없어요!");
    setCoins((c) => round2(c + price));
    setPortfolio((p) => {
      const newQty = prev.qty - 1;
      if (newQty <= 0) {
        const copy = { ...p };
        delete copy[ticker];
        return copy;
      } else {
        return { ...p, [ticker]: { qty: newQty, avgPrice: prev.avgPrice } };
      }
    });
    setHistory((h) => [
      { type: "trade", day, text: `${ticker} 1주 매도 @ ${price}` },
      ...h,
    ]);
  }

  // 포트폴리오 평가액
  const portfolioValue = useMemo(() => {
    let v = 0;
    stocks.forEach((s) => {
      const pos = portfolio[s.ticker];
      if (pos) v += pos.qty * s.price;
    });
    return round2(v);
  }, [stocks, portfolio]);

  const totalEquity = round2(coins + portfolioValue);

  // 수업 콘텐츠
  const lessons = [
    {
      id: "l1",
      title: "주식은 뭐예요?",
      body:
        "주식은 회사의 '작은 조각'이에요. 1주를 사면 그 회사의 아주 작은 주인이 되는 거예요! 회사가 잘 되면 주가가 오르고, 못 하면 내리기도 해요.",
      goal: "주식=회사 지분이라는 개념 이해",
    },
    {
      id: "l2",
      title: "수익과 위험",
      body:
        "돈을 벌 기회가 있으면, 잃을 위험도 있어요. 그러니 모든 돈을 한 군데에 몰지 말고, 나눠 담는 게 안전해요.",
      goal: "위험/보상 균형과 분산의 필요성",
    },
    {
      id: "l3",
      title: "분산 투자",
      body:
        "게임회사만 잔뜩 사면, 게임이 인기가 없을 때 모두 떨어질 수 있어요. 물, 음식, 게임처럼 서로 다른 분야에 나눠 담아봐요.",
      goal: "섹터 분산의 아이디어",
    },
    {
      id: "l4",
      title: "장기 투자란?",
      body:
        "오늘 오르고 내리는 것보다, 몇 달 몇 년 동안 회사가 성장하는지가 더 중요해요. 느긋하게 기다리는 연습을 해봐요.",
      goal: "단기 변동 vs 장기 성장",
    },
  ];

  // 퀴즈 데이터
  const quiz = [
    {
      q: "주식 1주는 무엇을 뜻하나요?",
      options: [
        "그 회사의 작은 조각을 가진 것",
        "그 회사 제품 한 개",
        "게임 머니",
      ],
      answer: 0,
      why: "주식은 회사의 지분(소유권)의 일부예요.",
    },
    {
      q: "돈을 벌 기회가 크면 보통 위험은?",
      options: ["같거나 작다", "없다", "같이 커진다"],
      answer: 2,
      why: "수익/위험은 함께 움직이는 경우가 많아요.",
    },
    {
      q: "다양한 분야에 나눠 담는 것을 뭐라고 하나요?",
      options: ["몰빵", "분산 투자", "할인 구매"],
      answer: 1,
      why: "한 분야에만 모으면 위험이 커져요.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            🐣 어린이 주식 교실
            <span className="text-sm font-semibold bg-yellow-200 rounded-full px-2 py-0.5">MVP</span>
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <Badge>Day {day}</Badge>
            <Badge>코인 {formatMoney(coins)}</Badge>
            <Badge>총자산 {formatMoney(totalEquity)}</Badge>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-2 pb-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: "home", label: "홈" },
            { id: "lesson", label: "수업" },
            { id: "quiz", label: "퀴즈" },
            { id: "paper", label: "모의투자" },
            { id: "glossary", label: "용어사전" },
            { id: "settings", label: "설정" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "px-3 py-2 rounded-2xl text-sm font-semibold border transition shadow-sm " +
                (tab === t.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white hover:bg-indigo-50 border-gray-200")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {tab === "home" && <Home nextDay={nextDay} setTab={setTab} />}
        {tab === "lesson" && (
          <Lessons
            lessons={lessons}
            completed={completedLessons}
            onComplete={(id) => setCompletedLessons({ ...completedLessons, [id]: true })}
          />
        )}
        {tab === "quiz" && (
          <Quiz
            quiz={quiz}
            progress={quizProgress}
            onFinish={(score) => setQuizProgress({ score, done: true })}
          />
        )}
        {tab === "paper" && (
          <PaperTrading
            stocks={stocks}
            portfolio={portfolio}
            coins={coins}
            onBuy={buy}
            onSell={sell}
            nextDay={nextDay}
            day={day}
            history={history}
          />
        )}
        {tab === "glossary" && <Glossary />}
        {tab === "settings" && (
          <Settings
            onReset={() => {
              if (!confirm("정말 초기화할까요?")) return;
              setCoins(1000);
              setPortfolio({});
              setDay(1);
              setHistory([]);
              setCompletedLessons({});
              setQuizProgress({ score: 0, done: false });
              setStocks(baseStocks);
            }}
          />
        )}
      </main>
      <footer className="text-center text-xs text-gray-500 py-6">
        교육용 데모입니다. 실제 투자를 권유하지 않아요 🙏
      </footer>
    </div>
  );
}

// ---------------- UI Subcomponents ----------------
function Home({ nextDay, setTab }) {
  return (
    <section className="grid md:grid-cols-2 gap-4 items-stretch">
      <div className="bg-white rounded-3xl p-6 shadow">
        <h2 className="text-lg font-bold mb-2">안녕! 주식 교실에 온 걸 환영해요 👋</h2>
        <p className="text-sm leading-6">
          여기서는 <b>주식</b>이 무엇인지 배우고, 퀴즈로 확인한 다음, <b>가짜 돈</b>으로 직접
          주식을 사고팔아 볼 수 있어요. 매일매일 뉴스 같은 <b>이벤트</b>가 생기고 가격이 움직여요.
        </p>
        <ul className="mt-3 text-sm list-disc pl-5 space-y-1">
          <li>수업 탭에서 기초 개념을 읽고 ✅ 체크해 보세요.</li>
          <li>퀴즈를 풀면 점수를 받을 수 있어요.</li>
          <li>모의투자에서 1주씩 사고팔며 분산을 연습해 보세요.</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary" onClick={() => setTab("lesson")}>
            수업 시작
          </button>
          <button className="btn-outline" onClick={() => setTab("paper")}>
            모의투자 바로가기
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-100 to-white rounded-3xl p-6 shadow flex flex-col justify-between">
        <Illustration />
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm">하루를 넘겨서 새로운 소식을 확인해요!</p>
          <button className="btn-primary" onClick={nextDay}>
            다음 날 ▶
          </button>
        </div>
      </div>
    </section>
  );
}

function Lessons({ lessons, completed, onComplete }) {
  return (
    <section className="grid md:grid-cols-2 gap-4">
      {lessons.map((l) => (
        <article key={l.id} className="bg-white rounded-3xl p-6 shadow">
          <h3 className="font-bold text-lg mb-1">{l.title}</h3>
          <p className="text-sm leading-6 whitespace-pre-wrap">{l.body}</p>
          <p className="mt-2 text-xs text-gray-500">학습 목표: {l.goal}</p>
          <div className="mt-3 flex items-center justify-between">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={!!completed[l.id]}
                onChange={(e) => onComplete(l.id)}
              />
              다 읽었어요!
            </label>
            {completed[l.id] && <Badge>완료 ✅</Badge>}
          </div>
        </article>
      ))}
    </section>
  );
}

function Quiz({ quiz, progress, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(progress.score || 0);
  const [chosen, setChosen] = useState(null);
  const done = progress.done;

  if (done)
    return (
      <div className="bg-white rounded-3xl p-6 shadow">
        <h3 className="text-lg font-bold">퀴즈 완료 🎉</h3>
        <p className="mt-2">점수: {score} / {quiz.length}</p>
        <p className="text-sm text-gray-600 mt-1">수업을 다시 읽고 점수를 더 올려볼까요?</p>
      </div>
    );

  const q = quiz[idx];

  function submit() {
    if (chosen === null) return alert("정답을 골라주세요!");
    const correct = chosen === q.answer;
    if (correct) setScore((s) => s + 1);
    setIdx((i) => i + 1);
    setChosen(null);
    if (idx + 1 >= quiz.length) onFinish(correct ? score + 1 : score);
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow">
      <Progress value={Math.round(((idx) / quiz.length) * 100)} />
      <h3 className="text-lg font-bold mt-3">Q{idx + 1}. {q.q}</h3>
      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => (
          <label key={i} className={
            "border rounded-2xl px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 " +
            (chosen === i ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200")
          }>
            <input
              type="radio"
              name="opt"
              className="mr-2"
              checked={chosen === i}
              onChange={() => setChosen(i)}
            />
            {opt}
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2">힌트: {q.why}</p>
      <div className="mt-4 flex items-center gap-2">
        <button className="btn-outline" onClick={() => setChosen(null)}>초기화</button>
        <button className="btn-primary" onClick={submit}>다음 ▶</button>
      </div>
    </div>
  );
}

function PaperTrading({ stocks, portfolio, coins, onBuy, onSell, nextDay, day, history }) {
  return (
    <section className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-3xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">시장 (가상)</h3>
            <button className="btn-primary" onClick={nextDay}>다음 날 ▶</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {stocks.map((s) => (
              <article key={s.ticker} className="border rounded-3xl p-3 hover:shadow-sm">
                <h4 className="font-semibold text-sm">{s.name}</h4>
                <p className="text-[11px] text-gray-500">{s.desc}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <Badge>{s.ticker}</Badge>
                  <span className="font-bold">{formatMoney(s.price)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => onBuy(s.ticker, s.price)}>1주 사기</button>
                  <button className="btn-outline flex-1" onClick={() => onSell(s.ticker, s.price)}>1주 팔기</button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow">
          <h3 className="font-bold mb-2">뉴스 & 이벤트 (Day {day})</h3>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {history
              .filter((h) => h.type === "event")
              .slice(0, 5)
              .map((e, idx) => (
                <li key={idx} className="whitespace-pre-wrap">{e.texts.join("\n")}</li>
              ))}
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-4 shadow">
          <h3 className="font-bold">내 지갑</h3>
          <p className="text-sm mt-1">코인: <b>{formatMoney(coins)}</b></p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow">
          <h3 className="font-bold">내 포트폴리오</h3>
          <ul className="text-sm mt-2 space-y-2">
            {Object.keys(portfolio).length === 0 && (
              <p className="text-gray-500 text-sm">아직 없어요. 1주부터 시작해 보세요!</p>
            )}
            {Object.entries(portfolio).map(([t, pos]) => (
              <li key={t} className="flex items-center justify-between border rounded-2xl px-3 py-2">
                <span className="font-semibold">{t}</span>
                <span className="text-xs text-gray-600">보유 {pos.qty}주 / 평균 {formatMoney(pos.avgPrice)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow">
          <h3 className="font-bold">기록</h3>
          <ul className="text-xs mt-2 space-y-1 max-h-60 overflow-auto">
            {history.map((h, i) => (
              <li key={i} className="border rounded-xl px-2 py-1">
                <span className="opacity-60 mr-2">D{h.day}</span>
                {h.type === "trade" ? "💱 " : "📰 "}
                {h.type === "trade" ? h.text : h.texts?.join("; ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Glossary() {
  const terms = [
    { k: "주식", v: "회사의 소유권을 나눈 조각." },
    { k: "주가", v: "주식 1주의 가격." },
    { k: "분산 투자", v: "여러 다른 종목/분야에 나눠서 투자하는 것." },
    { k: "리스크(위험)", v: "돈을 잃을 수도 있는 가능성." },
    { k: "수익률", v: "얼마나 벌었는지(또는 잃었는지)의 비율." },
    { k: "장기 투자", v: "오랫동안 보유하며 성장에 기대는 투자." },
  ];
  return (
    <div className="bg-white rounded-3xl p-6 shadow">
      <h3 className="font-bold text-lg">용어사전 📚</h3>
      <ul className="mt-3 space-y-2">
        {terms.map((t) => (
          <li key={t.k} className="flex items-start gap-3">
            <span className="font-semibold min-w-24">{t.k}</span>
            <span className="text-sm text-gray-700">{t.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings({ onReset }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow">
      <h3 className="font-bold text-lg">설정</h3>
      <div className="mt-3 flex gap-2">
        <button className="btn-danger" onClick={onReset}>모든 기록 초기화</button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        브라우저 로컬 저장소에 학습 진도가 저장돼요.
      </p>
    </div>
  );
}

function Illustration() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {"📈📊💹🏦🧠🎯💎🧩🛡️🏁".split("").map((e, i) => (
        <div
          key={i}
          className="aspect-square rounded-2xl bg-white shadow flex items-center justify-center text-2xl"
        >
          {e}
        </div>
      ))}
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className="bg-indigo-600 h-3 transition-all"
        style={{ width: `${value}%` }}
        aria-label={`진행률 ${value}%`}
      />
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
      {children}
    </span>
  );
}

// ---------------- Utils ----------------
function round2(n) {
  return Math.round(n * 100) / 100;
}
function formatMoney(n) {
  return `${n.toLocaleString()} 코인`;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- Tailwind-like utility buttons ----------------
const styles = `
.btn-primary { @apply bg-indigo-600 text-white px-3 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-indigo-700; }
.btn-outline { @apply bg-white text-indigo-700 px-3 py-2 rounded-2xl text-sm font-semibold border border-indigo-200 hover:bg-indigo-50; }
.btn-danger { @apply bg-rose-600 text-white px-3 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-rose-700; }
`;

// In-file style fallback for environments without Tailwind processing
// (실제 프로젝트에서는 Tailwind를 권장)
const styleEl = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleEl) {
  styleEl.innerHTML = styles
    .replaceAll('@apply bg-indigo-600 text-white px-3 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-indigo-700;',
      'background-color:#4f46e5;color:white;padding:0.5rem 0.75rem;border-radius:1rem;font-size:0.875rem;font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,0.05);')
    .replaceAll('@apply bg-white text-indigo-700 px-3 py-2 rounded-2xl text-sm font-semibold border border-indigo-200 hover:bg-indigo-50;',
      'background-color:white;color:#3730a3;padding:0.5rem 0.75rem;border-radius:1rem;font-size:0.875rem;font-weight:700;border:1px solid #c7d2fe;')
    .replaceAll('@apply bg-rose-600 text-white px-3 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-rose-700;',
      'background-color:#e11d48;color:white;padding:0.5rem 0.75rem;border-radius:1rem;font-size:0.875rem;font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,0.05);');
  document.head.appendChild(styleEl);
}
