// src/KidsStockApp.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, HelpCircle, LineChart, Library, Settings,
  Coins, Sparkles, Trophy, Star, ArrowRight, CheckCircle2, X, Play, BookOpenCheck, Award
} from "lucide-react";

/* ----------------------------- 공통 UI ---------------------------------- */
const Button = ({ className = "", variant = "solid", ...props }) => {
  const base = "px-4 py-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-300/30";
  const styles = {
    solid: "bg-amber-400 text-slate-900 hover:bg-amber-300",
    ghost: "bg-transparent text-slate-100 hover:bg-white/5",
    dark:  "bg-slate-800 text-slate-100 hover:bg-slate-700 ring-1 ring-white/10",
    danger:"bg-rose-500 text-white hover:bg-rose-400",
    success:"bg-emerald-500 text-white hover:bg-emerald-400",
    indigo:"bg-indigo-500 text-white hover:bg-indigo-400",
  };
  return <button type="button" className={`${base} ${styles[variant]} ${className}`} {...props} />;
};
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-white/10 bg-slate-900/50 ${className}`}>{children}</div>
);
const CardHeader = ({ className = "", children }) => <div className={`p-4 ${className}`}>{children}</div>;
const CardTitle = ({ className = "", children }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ className = "", children }) => <div className={`p-4 pt-0 ${className}`}>{children}</div>;
const Badge = ({ className = "", children }) => (
  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${className}`}>{children}</span>
);
const Progress = ({ value = 0, className = "" }) => (
  <div className={`h-2 w-full rounded bg-slate-800 ${className}`}>
    <div className="h-full rounded bg-amber-400" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

/* ----------------------------- 스타일 ----------------------------------- */
const appBg =
  "min-h-screen w-full bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(255,255,255,0.08),transparent)] bg-slate-950 text-slate-100";
const panel =
  "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]";
const goldText = "text-amber-300";
const goldRing = "ring-1 ring-amber-400/30";
const tileGrad = "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]";
const PIE_COLORS = ["#ffa600","#ff6361","#bc5090","#58508d","#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a"];

/* ----------------------------- 유틸 ------------------------------------- */
const STARTING_COINS = 1000;
const US_SYMBOLS = ["KO","PEP","MCD","SBUX","DIS","MARV","DC","NIN","NFLX","SONY","AAPL","GOOG"];
const KR_SYMBOLS = ["005930.KQ","005380.KQ","KAKAO","NAVER"];

function avgIndex(stocks, symbols = null) {
  const arr = symbols ? stocks.filter((s) => symbols.includes(s.symbol)) : stocks;
  return arr.length ? Math.round(arr.reduce((a, s) => a + s.price, 0) / arr.length) : 0;
}
function deltaStats(cur, prev) {
  return { diff: cur - prev, pct: prev ? ((cur - prev) / prev) * 100 : 0 };
}

/* ----------------------------- “강의” 데이터 (풍성 버전) ------------------- */
// 각 레슨은 여러 섹션을 가짐. 섹션마다 본문/예시/미션 포함
const LESSONS = [
  {
    id: 1,
    title: "돈은 어디서 올까요?",
    tags: ["기초", "생활"],
    reward: 50,
    sections: [
      {
        h: "1) 돈의 3가지 길",
        body: "일해서 받는 돈(근로소득), 빌려주고 받는 돈(이자), 내가 가진 것에서 나오는 돈(배당·임대료)이 있어요.",
        example: "예: 편의점에서 일하면 시급을 받아요. 은행에 돈을 맡기면 이자를 받아요. 주식을 가지고 있으면 배당금을 받을 때도 있어요.",
        mission: "집에서 돈을 벌 수 있는 방법 1가지를 가족과 이야기해보고 적어보기."
      },
      {
        h: "2) ‘저축→투자’의 차이",
        body: "저축은 돈을 안전하게 모으는 것, 투자는 돈이 자라도록 기회를 주는 거예요.",
        example: "돼지저금통에 넣으면 안전하지만 안 자라요. 주식은 위험도 있지만 시간이 지나면 성장할 수 있어요.",
        mission: "내 용돈에서 저축 70%, 투자 30%처럼 비율을 정해보기."
      },
      {
        h: "3) 시간 친구 ‘복리’",
        body: "복리는 이자가 이자를 낳는 마법! 길게 기다릴수록 효과가 커져요.",
        example: "1000코인에 매년 10%라면 1년 뒤 1100, 2년 뒤 1210처럼 점점 더 크게 늘어요.",
        mission: "1000코인이 10%로 3년이면 얼마? (정답: 1331코인)"
      },
    ]
  },
  {
    id: 2,
    title: "주가가 오르락내리락",
    tags: ["원리", "그래프"],
    reward: 60,
    sections: [
      {
        h: "1) 가격을 움직이는 힘",
        body: "사고 싶은 사람이 많으면 가격↑, 팔고 싶은 사람이 많으면 가격↓.",
        example: "신제품이 대박이면 모두 사고 싶어져서 가격이 오를 수 있어요.",
        mission: "오늘 뉴스에서 ‘상승/하락’ 키워드 찾아보기."
      },
      {
        h: "2) 그래프 읽기 기초",
        body: "왼쪽이 과거, 오른쪽이 현재·미래. 위로 갈수록 가격이 비싸요.",
        example: "계단처럼 오르내리는 선을 보며 추세(전반적 방향)를 확인해요.",
        mission: "내가 좋아하는 회사 1곳의 1년 그래프를 찾아보고 느낀 점 적기."
      },
      {
        h: "3) 변동성 다루기",
        body: "매일 흔들려도, 좋은 회사를 오래 들고 가는 ‘장기투자’가 있어요.",
        example: "롤러코스터 같은 날도 있지만 전체적으로는 성장할 수 있어요.",
        mission: "가격이 떨어졌을 때의 장점 1가지를 말해보기."
      },
    ]
  },
  {
    id: 3,
    title: "용돈 투자 계획 세우기",
    tags: ["습관", "목표"],
    reward: 80,
    sections: [
      {
        h: "1) 목표 세우기",
        body: "무엇을 위해 모을까요? 새 자전거? 겨울 캠프? 목표가 있으면 꾸준해져요.",
        example: "6개월 안에 3만 코인 모으기!",
        mission: "내 목표 1개와 기간을 정해 노트에 쓰기."
      },
      {
        h: "2) 분산투자",
        body: "한 바구니에만 담지 않기! 여러 회사에 나눠 담으면 위험이 줄어요.",
        example: "음료·게임·장난감·기술처럼 서로 다른 분야를 섞어요.",
        mission: "내가 관심 있는 분야 3개를 고르고 이유 쓰기."
      },
      {
        h: "3) 자동으로 꾸준히",
        body: "정해진 날마다 같은 금액을 투자하면 마음이 덜 흔들려요(정기적립).",
        example: "매주 200코인씩!",
        mission: "나만의 요일/금액을 정해보기."
      },
    ]
  },
];

// 레슨 카드 미리보기(진도는 상태에서 관리)
const lessonCards = LESSONS.map(l => ({ id: l.id, title: l.title, chips: l.tags, progress: 0 }));

/* ----------------------------- 퀴즈 (확장) ------------------------------- */
const quizDeck = [
  { q: "주식 한 주를 사면 무엇을 가지게 될까요?", choices: ["쿠폰", "회사 소유권의 일부", "게임 아이템"], correct: 1, tip: "주식=회사 조각!" },
  { q: "가격이 떨어졌을 때 꼭 나쁠까요?", choices: ["무조건 나빠요", "싸게 살 기회일 수 있어요", "가격이 고장났어요"], correct: 1, tip: "같은 돈으로 더 살 수도" },
  { q: "분산투자가 좋은 이유는?", choices: ["심심하니까", "한 바구니에만 담지 않아요", "멋져보여서"], correct: 1, tip: "여러 곳에 나눠 담기" },
  { q: "복리는 무엇일까요?", choices: ["이자가 또 이자를 낳는 것", "한 번만 이자", "이자 없음"], correct: 0, tip: "시간이 길수록 효과↑" },
  { q: "그래프에서 오른쪽으로 갈수록 의미는?", choices: ["과거", "현재/미래", "모름"], correct: 1, tip: "왼쪽 과거, 오른쪽 현재/미래" },
  { q: "가격을 올리는 힘은 대체로?", choices: ["팔고 싶은 사람 많을 때", "사고 싶은 사람 많을 때", "비밀"], correct: 1, tip: "수요↑ → 가격↑" },
  { q: "장기투자의 장점은?", choices: ["매일 거래로 수수료↑", "흔들림을 줄이고 성장에 집중", "심심함"], correct: 1, tip: "큰 흐름 보자" },
  { q: "저축과 투자의 차이는?", choices: ["같다", "저축=안전, 투자=성장기회", "투자=무조건 위험"], correct: 1, tip: "성격이 달라요" },
  { q: "목표를 세우면 좋은 점은?", choices: ["금방 포기", "꾸준히 행동하기 쉬움", "돈이 줄어듦"], correct: 1, tip: "동기부여!" },
  { q: "정기적립 방식은?", choices: ["그때그때 마음대로", "정해진 날 같은 금액", "없음"], correct: 1, tip: "꾸준함이 힘" },
  { q: "분산투자 예시는?", choices: ["한 회사만 몰빵", "여러 분야로 나눔", "현금만 보유"], correct: 1, tip: "음료/게임/기술 등" },
  { q: "배당은?", choices: ["회사 이익 나눔", "세금", "대출이자"], correct: 0, tip: "주주에게 이익 배분" },
  { q: "가격이 흔들려도 할 일은?", choices: ["공포에 즉시 매도", "계획대로 장기 전략 점검", "모두 대출"], correct: 1, tip: "계획이 우선" },
  { q: "그래프 읽기 기본은?", choices: ["색깔 보기만", "전반적 추세 파악", "감으로만"], correct: 1, tip: "방향을 보자" },
  { q: "용돈에서 투자 비율을 정하는 이유는?", choices: ["재미", "흔들림 줄이고 습관 형성", "친구따라"], correct: 1, tip: "규칙 만들기" },
  { q: "좋은 회사의 특징은?", choices: ["제품·서비스가 사랑받음", "비밀회사", "주주 미소"], correct: 0, tip: "실적/브랜드/성장" },
  { q: "시장 전체가 오르는 날, 개별 주식은?", choices: ["항상 반대", "같이 오를 가능성↑", "모름"], correct: 1, tip: "상관관계가 있어요" },
  { q: "가격 하락의 장점?", choices: ["없음", "더 낮은 가격에 매수 기회", "그래프가 예쁨"], correct: 1, tip: "기회가 될 수도" },
];

/* ----------------------------- 용어 ------------------------------------- */
const glossaryData = [
  { term: "주식", def: "회사 소유권의 조각." },
  { term: "배당", def: "이익을 주주에게 나눠주는 돈." },
  { term: "PER", def: "주가를 1주당 이익으로 나눈 값." },
];

/* ----------------------------- 탭/주식 초기값 ---------------------------- */
const boardTiles = [
  { key: "home", label: "홈", icon: Home },
  { key: "lesson", label: "수업", icon: BookOpen },
  { key: "quiz", label: "퀴즈", icon: HelpCircle },
  { key: "invest", label: "모의투자", icon: LineChart },
  { key: "glossary", label: "용어", icon: Library },
  { key: "settings", label: "설정", icon: Settings },
];

const STOCKS_30 = [
  { symbol: "KO", name: "코카콜라", desc: "전세계적으로 사랑받는 음료 회사" },
  { symbol: "PEP", name: "펩시콜라", desc: "콜라 전쟁의 또다른 주인공" },
  { symbol: "MCD", name: "맥도날드", desc: "빅맥으로 유명한 햄버거 체인" },
  { symbol: "BKG", name: "버거킹", desc: "와퍼로 유명한 글로벌 패스트푸드" },
  { symbol: "KFC", name: "KFC", desc: "치킨하면 떠오르는 패스트푸드" },
  { symbol: "SBUX", name: "스타벅스", desc: "세계 최대 커피 체인" },
  { symbol: "DUNK", name: "던킨도너츠", desc: "도넛과 커피 브랜드" },
  { symbol: "CRIS", name: "크리스피도넛", desc: "달콤한 도넛으로 유명" },
  { symbol: "DIS", name: "디즈니", desc: "미키마우스와 디즈니랜드" },
  { symbol: "MARV", name: "마블", desc: "아이언맨, 스파이더맨 등 슈퍼히어로" },
  { symbol: "DC", name: "DC코믹스", desc: "배트맨, 슈퍼맨의 세계" },
  { symbol: "SONY", name: "소니", desc: "플레이스테이션의 주인공" },
  { symbol: "NIN", name: "닌텐도", desc: "마리오, 젤다 시리즈" },
  { symbol: "LEGO", name: "레고", desc: "아이들이 사랑하는 블록 장난감" },
  { symbol: "MAT", name: "마텔", desc: "바비인형의 주인공" },
  { symbol: "HAS", name: "해즈브로", desc: "트랜스포머, 보드게임 회사" },
  { symbol: "POKE", name: "포켓몬", desc: "피카츄와 친구들" },
  { symbol: "PIKA", name: "피카츄", desc: "포켓몬의 아이콘" },
  { symbol: "DORA", name: "도라에몽", desc: "일본 국민 캐릭터" },
  { symbol: "CRAY", name: "짱구", desc: "짱구는 못말려" },
  { symbol: "TOY", name: "토이스토리", desc: "픽사의 대표작" },
  { symbol: "SPON", name: "스폰지밥", desc: "바닷속의 노란 캐릭터" },
  { symbol: "AAPL", name: "애플", desc: "아이폰의 주인공" },
  { symbol: "GOOG", name: "구글", desc: "세상의 정보를 정리하는 회사" },
  { symbol: "005930.KQ", name: "삼성전자", desc: "대한민국의 반도체 자랑" },
  { symbol: "005380.KQ", name: "현대자동차", desc: "자동차 메이커" },
  { symbol: "KAKAO", name: "카카오", desc: "카톡의 회사" },
  { symbol: "NAVER", name: "네이버", desc: "검색과 웹툰 플랫폼" },
  { symbol: "NFLX", name: "넷플릭스", desc: "드라마, 영화 스트리밍" },
];

const initialStocks = STOCKS_30.map((s) => {
  const price = 50 + Math.floor(Math.random() * 50);
  return { ...s, price, history: [price] };
});

const newsPool = [
  { title: "코카콜라 신제품 흥행!", effect: { KO: +0.05 } },
  { title: "펩시 원가 상승으로 수익성 악화", effect: { PEP: -0.04 } },
  { title: "맥도날드 전세계 매출 호조", effect: { MCD: +0.03 } },
  { title: "닌텐도 마리오 신작 대히트", effect: { NIN: +0.06 } },
  { title: "애플 신규 기기 발표 기대", effect: { AAPL: +0.05 } },
  { title: "구글 AI 서비스 이슈", effect: { GOOG: +0.04 } },
  { title: "삼성전자 반도체 호황", effect: { "005930.KQ": +0.06 } },
  { title: "현대차 신모델 인기", effect: { "005380.KQ": +0.04 } },
  { title: "카카오 플랫폼 점검 이슈", effect: { KAKAO: -0.03 } },
  { title: "네이버 웹툰 흥행", effect: { NAVER: +0.03 } },
  { title: "넷플릭스 오리지널 흥행", effect: { NFLX: +0.05 } },
  { title: "세계 경기침체 우려로 전체 시장 하락", effect: "marketDown" },
  { title: "기술주 랠리, 시장 전체 상승", effect: "marketUp" },
];

/* ----------------------------- 루트 앱 ----------------------------------- */
export default function KidsStockApp() {
  const [tab, setTab] = useState("home");
  const [coins, setCoins] = useState(STARTING_COINS);
  const [streak, setStreak] = useState(3);

  // 강의 진행/선택
  const [lessonProgress, setLessonProgress] = useState(() =>
    Object.fromEntries(LESSONS.map(l => [l.id, 0]))
  );
  const [activeLessonId, setActiveLessonId] = useState(null);

  // 모의투자 전역 상태
  const [stocks, setStocks] = useState(initialStocks);
  const [portfolio, setPortfolio] = useState({}); // symbol -> { qty, avg }
  const [day, setDay] = useState(1);
  const [news, setNews] = useState(null);

  // 알림 & 모달
  const [alert, setAlert] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  // 알림 2.5초 후 자동 닫힘
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 2500);
    return () => clearTimeout(t);
  }, [alert]);

  // 루트 지수 (헤더 표시용)
  const marketIndex = avgIndex(stocks);
  const usIndex = avgIndex(stocks, US_SYMBOLS);
  const krIndex = avgIndex(stocks, KR_SYMBOLS);

  // 탭 매핑
  const VIEW_MAP = {
    home: HomeBoard,
    lesson: LessonRouter,
    quiz: QuizView,
    invest: InvestView,
    glossary: GlossaryView,
    settings: SettingsView,
  };

  const viewProps = {
    home: {
      onNavigate: (key) => setTab(key),
      onStartLesson: (id) => { setActiveLessonId(id); setTab("lesson"); }
    },
    lesson: {
      lessons: LESSONS,
      progressMap: lessonProgress,
      onOpen: (id) => setActiveLessonId(id),
      activeLessonId,
      onBackList: () => setActiveLessonId(null),
      onComplete: (lessonId, reward) => {
        setLessonProgress((m) => ({ ...m, [lessonId]: 100 }));
        setCoins((c) => c + reward);
        setAlert(`축하해요! 레슨 완료 보상 +${reward} 코인`);
      }
    },
    quiz: {
      onCorrect: () => { setCoins((c) => c + 30); setStreak((s) => s + 1); }
    },
    invest: {
      coins, setCoins, stocks, setStocks, portfolio, setPortfolio,
      day, setDay, news, setNews, setAlert, setSelectedStock
    },
    glossary: {},
    settings: {},
  };

  const View = VIEW_MAP[tab] || HomeBoard;
  const props = viewProps[tab] || {};

  return (
    <div className={appBg}>
      {/* 상단바 */}
      <header className="sticky top-0 z-40 px-4 py-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-slate-950/55">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 ${goldRing}`}>
              <Coins className="h-5 w-5 text-amber-300" />
            </motion.div>
            <div>
              <div className="text-xs text-slate-300">코인</div>
              <div className={`-mt-0.5 font-bold ${goldText}`}>{coins.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[13px] text-slate-300">어린이 주식 모험</div>
            <div className="text-lg font-bold tracking-wide text-slate-50">개미 투자 캠프</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-300/20">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> 오늘의 보상+10%
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-300/20">
              <Trophy className="mr-1 h-3.5 w-3.5" /> 연속 {streak}일
            </Badge>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-2 text-[11px] text-slate-400">
          시장지수 {marketIndex} · US {usIndex} · KR {krIndex}
        </div>
      </header>

      {/* 알림 */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-900/90 ring-1 ring-white/10 px-4 py-2 text-sm"
          >
            {alert}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6">
        <div className="grid gap-4 sm:gap-6">
          <div className="text-xs text-slate-400">현재 탭: {tab}</div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <View {...props} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 하단 탭 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-6xl">
        <div className={`m-3 ${panel} p-2 ${goldRing} bg-slate-900/70 pointer-events-auto`}>
          <div className="grid grid-cols-6 gap-1">
            {boardTiles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`group flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 ${tab === key ? "bg-amber-400/15 ring-1 ring-amber-300/40" : "hover:bg-white/5"} transition`}
                style={{ background: "transparent" }}
              >
                <Icon className={`h-5 w-5 ${tab === key ? "text-amber-300" : "text-slate-300 group-hover:text-slate-200"}`} />
                <span className={`mt-1 text-[11px] ${tab === key ? "text-amber-200" : "text-slate-300/80"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 종목 모달 */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className={`${panel} p-6 max-w-lg w-full relative`}
              initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}>
              <button className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded" onClick={()=>setSelectedStock(null)}>
                <X className="text-slate-200" />
              </button>
              <h2 className="text-xl font-bold mb-2">{selectedStock.name}</h2>
              <p className="text-slate-400 mb-4">{selectedStock.desc}</p>

              {/* 실제 history 기반 미니 라인차트 (SVG) */}
              <svg viewBox="0 0 260 90" className="w-full h-24 bg-slate-900/70 rounded ring-1 ring-white/10">
                {(() => {
                  const hist = selectedStock.history;
                  const min = Math.min(...hist);
                  const max = Math.max(...hist);
                  const points = hist.map((v,i)=>{
                    const x = (i/(hist.length-1))*260;
                    const y = 90 - ((v-min)/((max-min)||1))*90;
                    return `${x},${y}`;
                  }).join(" ");
                  return <polyline fill="none" stroke="#4bc0c0" strokeWidth="2" points={points} />;
                })()}
              </svg>

              {/* 해당 종목 관련 뉴스 */}
              <div className="mt-4 text-sm text-slate-300">
                관련 뉴스: {
                  newsPool.filter(n => typeof n.effect === "object" && n.effect[selectedStock.symbol])
                          .slice(0,2)
                          .map(n=>n.title)
                          .join(" · ") || "없음"
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- Home ------------------------------------- */
function HomeBoard({ onNavigate, onStartLesson }) {
  return (
    <motion.section
      key="home"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <BoardTile
        title="오늘의 미션"
        subtitle="3가지를 완료하면 보너스 코인!"
        right={<Badge className="bg-amber-400/20 text-amber-200 border border-amber-400/30">+50</Badge>}
      >
        <ul className="space-y-2 text-sm text-slate-200/90">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> 수업 1개 듣기</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> 퀴즈 3문제 풀기</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> 모의투자 1회 실행</li>
        </ul>
        <Button
          variant="solid"
          className="mt-4"
          onClick={() => onStartLesson(1)}
        >
          수업 듣기 & 코인 받기
        </Button>
      </BoardTile>

      <MenuTile icon={BookOpen} label="수업" onClick={() => onNavigate("lesson")} />
      <MenuTile icon={HelpCircle} label="퀴즈" onClick={() => onNavigate("quiz")} />
      <MenuTile icon={LineChart} label="모의투자" onClick={() => onNavigate("invest")} />
      <MenuTile icon={Library} label="용어사전" onClick={() => onNavigate("glossary")} />
      <MenuTile icon={Settings} label="설정" onClick={() => onNavigate("settings")} />
    </motion.section>
  );
}
function BoardTile({ title, subtitle, right, children }) {
  return (
    <div className={`${panel} ${goldRing} p-5 ${tileGrad}`}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-50">{title}</h3>
          {subtitle && <p className="text-sm text-slate-300/90">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
function MenuTile({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`group ${panel} ${goldRing} p-5 text-left transition hover:translate-y-[-2px] pointer-events-auto`} style={{ background: "transparent" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-white/10">
          <Icon className="h-6 w-6 text-amber-300" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-100">{label}</div>
          <div className="text-xs text-slate-300/80">보드판에서 이동해 볼까요?</div>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 text-slate-400 opacity-0 transition group-hover:opacity-100" />
      </div>
    </button>
  );
}

/* ----------------------------- Lesson Router/List/Detail ----------------- */
function LessonRouter({ lessons, progressMap, activeLessonId, onOpen, onBackList, onComplete }) {
  if (activeLessonId) {
    const lesson = lessons.find(l => l.id === activeLessonId);
    return (
      <LessonDetailView
        lesson={lesson}
        progress={progressMap[activeLessonId] ?? 0}
        onBack={onBackList}
        onComplete={() => onComplete(lesson.id, lesson.reward)}
      />
    );
  }
  return <LessonListView lessons={lessons} progressMap={progressMap} onOpen={onOpen} />;
}

function LessonListView({ lessons, progressMap, onOpen }) {
  return (
    <motion.section
      key="lesson-list"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {lessons.map((l) => (
        <Card key={l.id} className={`${panel} ${goldRing}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-50">
              {l.title}
              <div className="space-x-2">
                {l.tags.map((t) => (
                  <Badge key={t} className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">{t}</Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-300/90">
              총 {l.sections.length}개 섹션 · 완료 보상 {l.reward} 코인
            </div>
            <Progress value={progressMap[l.id] || 0} className="h-2 bg-slate-800" />
            <div className="text-xs text-slate-400">진도 {progressMap[l.id] || 0}%</div>
            <Button variant="solid" className="w-full" onClick={() => onOpen(l.id)}>
              <Play className="inline -mt-0.5 mr-1 h-4 w-4" /> 수업 듣기
            </Button>
          </CardContent>
        </Card>
      ))}
    </motion.section>
  );
}

function LessonDetailView({ lesson, progress, onBack, onComplete }) {
  const [idx, setIdx] = useState(0);
  const isLast = idx >= lesson.sections.length - 1;

  const next = () => {
    if (!isLast) setIdx((v) => v + 1);
  };

  const finish = () => {
    onComplete();
    onBack();
  };

  const s = lesson.sections[idx];

  return (
    <motion.section
      key={`lesson-${lesson.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="mx-auto grid max-w-3xl gap-4"
    >
      <div className={`${panel} p-5 ${goldRing} ${tileGrad}`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-50">{lesson.title}</h2>
          <Badge className="bg-amber-400/20 text-amber-100 border border-amber-400/30">
            <Award className="h-3.5 w-3.5 mr-1" /> 완료 보상 {lesson.reward}
          </Badge>
        </div>

        <div className="text-sm text-slate-300/90">섹션 {idx + 1} / {lesson.sections.length}</div>
        <Progress value={Math.round(((idx) / lesson.sections.length) * 100)} className="my-2" />

        <div className="mt-2 rounded-xl bg-slate-900/60 ring-1 ring-white/10 p-4 space-y-2">
          <div className="text-base font-semibold text-slate-50">{s.h}</div>
          <p className="text-slate-300/90 leading-relaxed">{s.body}</p>
          <div className="rounded-lg bg-slate-800/60 ring-1 ring-white/10 p-3 text-sm">
            <span className="font-semibold text-amber-200">예시: </span>
            <span className="text-slate-200">{s.example}</span>
          </div>
          <div className="rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/20 p-3 text-sm">
            <span className="font-semibold text-indigo-200">미니 미션: </span>
            <span className="text-slate-200">{s.mission}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="dark" onClick={onBack}><BookOpenCheck className="inline mr-1 h-4 w-4" /> 목록으로</Button>
          {!isLast ? (
            <Button variant="indigo" onClick={next}>다음 섹션 ▶</Button>
          ) : (
            <Button variant="solid" onClick={finish}>수업 완료하고 보상 받기 🎉</Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/* ----------------------------- Quiz ------------------------------------- */
function QuizView({ onCorrect }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const card = quizDeck[index % quizDeck.length];

  const choose = (i) => {
    if (status === "correct") return;
    setSelected(i);
    if (i === card.correct) { setStatus("correct"); onCorrect && onCorrect(); }
    else { setStatus("wrong"); }
  };
  const next = () => { setIndex((v) => v + 1); setSelected(null); setStatus("idle"); };

  return (
    <motion.section key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mx-auto grid max-w-2xl gap-4">
      <div className={`${panel} ${goldRing} ${tileGrad} p-6`}>
        <div className="mb-2 text-xs uppercase tracking-wide text-amber-200">Quiz</div>
        <div className="text-xl font-semibold text-slate-50">{card.q}</div>
        <div className="mt-4 grid gap-2">
          {card.choices.map((ch, i) => {
            const isSel = selected === i;
            const isCorrect = status !== "idle" && i === card.correct;
            const isWrongSel = status === "wrong" && isSel;
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className={`rounded-xl px-4 py-3 text-left ring-1 transition bg-transparent ${isCorrect ? "bg-emerald-500/20 ring-emerald-300/30 text-emerald-200" : ""} ${isWrongSel ? "bg-rose-500/20 ring-rose-300/30 text-rose-200" : ""} ${!isCorrect && !isWrongSel ? "bg-slate-900/60 ring-white/10 hover:bg-white/5" : ""}`}
                style={{ WebkitAppearance: "none" }}
              >
                {ch}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-slate-300 min-h-[1.5rem]">
          {status === "correct" && (<span className="text-emerald-200">정답이에요! <Star className="inline h-4 w-4" /> 코인 +30</span>)}
          {status === "wrong" && (<span className="text-rose-200">앗, 다시 생각해볼까요? 힌트: {card.tip}</span>)}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="indigo" className={`${status !== "correct" ? "opacity-50 cursor-not-allowed" : ""}`} disabled={status !== "correct"} onClick={next}>다음 문제 ▶</Button>
          <Button variant="dark" onClick={() => { setSelected(null); setStatus("idle"); }}>다시 고르기</Button>
        </div>
      </div>
    </motion.section>
  );
}

/* ----------------------------- Invest ----------------------------------- */
function InvestView({ coins, setCoins, stocks, setStocks, portfolio, setPortfolio, day, setDay, news, setNews, setAlert, setSelectedStock }) {
  // 전일 스냅샷(지수 비교용)
  const [prevStocks, setPrevStocks] = useState(stocks);

  // 지수 및 전일 대비
  const usIndex = avgIndex(stocks, US_SYMBOLS);
  const krIndex = avgIndex(stocks, KR_SYMBOLS);
  const prevUS = avgIndex(prevStocks, US_SYMBOLS);
  const prevKR = avgIndex(prevStocks, KR_SYMBOLS);
  const usDelta = deltaStats(usIndex, prevUS);
  const krDelta = deltaStats(krIndex, prevKR);

  // 총 자산
  const holdingsValue = useMemo(() => Object.entries(portfolio).reduce((sum, [sym, { qty }]) => {
    const p = stocks.find((s) => s.symbol === sym)?.price || 0;
    return sum + qty * p;
  }, 0), [portfolio, stocks]);
  const totalValue = coins + holdingsValue;
  const totalReturnPct = ((totalValue - STARTING_COINS) / STARTING_COINS) * 100;

  const buy = (s) => {
    if (coins < s.price) { setAlert("코인이 부족합니다!"); return; }
    setCoins((c) => c - s.price);
    setPortfolio((p) => {
      const prev = p[s.symbol] || { qty: 0, avg: 0 };
      const newQty = prev.qty + 1;
      const newAvg = prev.qty > 0 ? (prev.avg * prev.qty + s.price) / newQty : s.price;
      return { ...p, [s.symbol]: { qty: newQty, avg: newAvg } };
    });
  };
  const sell = (s) => {
    const held = portfolio[s.symbol];
    if (!held || held.qty <= 0) { setAlert("보유 주식이 없습니다!"); return; }
    setCoins((c) => c + s.price);
    setPortfolio((p) => ({ ...p, [s.symbol]: { ...held, qty: held.qty - 1 } }));
  };

  const nextDay = () => {
    const nextNews = newsPool[Math.floor(Math.random() * newsPool.length)];
    setNews(nextNews);
    setDay((d) => d + 1);
    setPrevStocks(stocks.map((s) => ({ ...s })));

    setStocks((arr) => arr.map((s) => {
      let factor = (Math.random() - 0.5) * 0.1; // ±5%
      if (nextNews.effect) {
        if (typeof nextNews.effect === "object" && nextNews.effect[s.symbol]) factor += nextNews.effect[s.symbol];
        if (nextNews.effect === "marketDown") factor -= 0.05;
        if (nextNews.effect === "marketUp") factor += 0.05;
      }
      const newPrice = Math.max(1, Math.round(s.price * (1 + factor)));
      const newHist = (s.history.length > 59) ? [...s.history.slice(-59), newPrice] : [...s.history, newPrice];
      return { ...s, price: newPrice, history: newHist };
    }));
  };

  // 도넛 파이차트 (conic-gradient)
  const pie = useMemo(() => {
    const entries = Object.entries(portfolio).filter(([_, v]) => v.qty > 0);
    if (entries.length === 0) return { style: {}, legend: [] };
    const totals = entries.map(([sym, { qty }]) => {
      const st = stocks.find((s) => s.symbol === sym);
      return { sym, name: st?.name || sym, value: qty * (st?.price || 0) };
    }).filter(v => v.value > 0);
    const sum = totals.reduce((a,b)=>a+b.value,0) || 1;
    let cur = 0;
    const slices = totals.map((t, i) => {
      const angle = (t.value / sum) * 360;
      const start = cur;
      const end = cur + angle;
      cur = end;
      return { ...t, start, end, color: PIE_COLORS[i % PIE_COLORS.length] };
    });
    const gradient = slices.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(", ");
    return {
      style: { background: `conic-gradient(${gradient})` },
      legend: slices
    };
  }, [portfolio, stocks]);

  return (
    <motion.section
      key="invest"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 lg:grid-cols-3"
    >
      {/* 좌: 뉴스 + 지수 + 종목 */}
      <div className="space-y-4 lg:col-span-2">
        {/* 신문풍 뉴스 카드 */}
        {news && (
          <div className="border border-slate-700 bg-slate-50 text-slate-900 shadow-inner p-6 font-serif">
            <div className="text-3xl font-extrabold tracking-wider border-b-4 border-slate-800 pb-2">THE KIDS TIMES</div>
            <div className="mt-1 text-xs text-slate-600 italic">Day {day} Edition</div>
            <div className="mt-4 text-xl font-bold leading-snug">{news.title}</div>
          </div>
        )}

        {/* 지수 카드 */}
        <div className={`${panel} p-4 grid grid-cols-2 gap-4`}>
          {[{ name: "KidzDAQ", idx: usIndex, d: usDelta }, { name: "KOSPI Jr", idx: krIndex, d: krDelta }].map(({ name, idx, d }) => (
            <div key={name} className="rounded-xl bg-slate-900/50 p-3 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">{name}</div>
              <div className="text-2xl font-bold">{idx}</div>
              <div className={`text-sm ${d.diff >= 0 ? "text-rose-300" : "text-emerald-300"}`}>{d.diff >= 0 ? "+" : ""}{d.diff.toFixed(0)} ({d.pct.toFixed(1)}%)</div>
            </div>
          ))}
        </div>

        {/* 종목 리스트 */}
        <div className={`${panel} p-4`}>
          <h2 className="font-bold mb-2">종목</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {stocks.map((s) => {
              const held = portfolio[s.symbol]?.qty || 0;
              const avg = portfolio[s.symbol]?.avg || 0;
              const profit = held > 0 && avg > 0 ? ((s.price - avg) / avg) * 100 : 0;
              return (
                <div key={s.symbol} className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3 ring-1 ring-white/10">
                  <div className="min-w-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedStock(s)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedStock(s)}
                      className="text-left cursor-pointer rounded-md px-2 py-1 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                      style={{ background: "transparent" }}
                    >
                      <div className="font-semibold truncate">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.price} 코인</div>
                      {held > 0 && (
                        <div className="text-[11px] text-slate-400">보유 {held}주 · 수익률 {profit.toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="success" onClick={() => buy(s)}>사자</Button>
                    <Button variant="danger" onClick={() => sell(s)}>팔자</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 우: 포트폴리오 + 요약 + 다음날 */}
      <div className="space-y-4">
        {/* 총합 요약 */}
        <div className={`${panel} p-4`}>
          <HoldingsSummary coins={coins} holdingsValue={holdingsValue} totalValue={totalValue} totalReturnPct={totalReturnPct} />
        </div>

        {/* 포트폴리오 테이블 + CSS 도넛 파이 */}
        <div className={`${panel} p-4`}>
          <h2 className="font-bold mb-2">내 포트폴리오</h2>
          <PortfolioTable portfolio={portfolio} stocks={stocks} />
          {pie.legend.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-40 w-40 rounded-full" style={pie.style}>
                <div className="absolute inset-4 rounded-full bg-slate-950 flex items-center justify-center text-xs text-slate-400 ring-1 ring-white/10">
                  보유 비중
                </div>
              </div>
              <div className="grid gap-1 text-xs">
                {pie.legend.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded" style={{ background: s.color }} />
                    <span className="truncate max-w-[180px]">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button variant="indigo" onClick={nextDay}>다음날 ▶</Button>
        </div>
      </div>
    </motion.section>
  );
}

function HoldingsSummary({ coins, holdingsValue, totalValue, totalReturnPct }) {
  return (
    <>
      <div className="text-sm text-slate-400">총 자산</div>
      <div className="text-2xl font-extrabold">{totalValue.toLocaleString()} 코인</div>
      <div className={`text-sm ${totalReturnPct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>총 수익률 {totalReturnPct.toFixed(1)}%</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-900/50 p-2 ring-1 ring-white/10">현금: {coins}</div>
        <div className="rounded-lg bg-slate-900/50 p-2 ring-1 ring-white/10">보유자산: {holdingsValue}</div>
      </div>
    </>
  );
}

function PortfolioTable({ portfolio, stocks }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-slate-400">
          <th className="text-left">종목</th>
          <th>수량</th>
          <th>평단</th>
          <th>현재가</th>
          <th>수익률</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(portfolio).map(([sym, { qty, avg }]) => {
          if (qty <= 0) return null;
          const stock = stocks.find((s) => s.symbol === sym);
          const cur = stock?.price ?? 0;
          const profit = avg > 0 ? ((cur - avg) / avg) * 100 : 0;
          return (
            <tr key={sym}>
              <td className="py-1">{stock?.name || sym}</td>
              <td className="text-center">{qty}</td>
              <td className="text-center">{avg.toFixed(1)}</td>
              <td className="text-center">{cur}</td>
              <td className={`text-center ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {profit.toFixed(1)}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ----------------------------- Glossary --------------------------------- */
function GlossaryView() {
  return (
    <motion.section
      key="glossary"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {glossaryData.map((g) => (
        <div key={g.term} className={`${panel} ${goldRing} p-5 ${tileGrad}`}>
          <div className="text-base font-bold text-slate-50">{g.term}</div>
          <div className="mt-1 text-sm text-slate-300/90">{g.def}</div>
        </div>
      ))}
    </motion.section>
  );
}

/* ----------------------------- Settings --------------------------------- */
function SettingsView() {
  const [sound, setSound] = useState(true);
  const [hints, setHints] = useState(true);
  return (
    <motion.section
      key="settings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className={`${panel} ${goldRing} p-5 ${tileGrad}`}>
        <h3 className="text-lg font-bold text-slate-50">설정</h3>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            효과음 켜기
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
            학습 힌트 표시
          </label>
        </div>
        <div className="mt-4 text-xs text-slate-400">변경 사항은 즉시 적용됩니다.</div>
      </div>
    </motion.section>
  );
}
