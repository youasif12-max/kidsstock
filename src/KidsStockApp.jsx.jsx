import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  HelpCircle,
  LineChart,
  Library,
  Settings,
  Coins,
  Sparkles,
  Star,
  Trophy,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/**
 * Kids Stock App — Boardgame UI Mock
 * --------------------------------------------------------------
 * Design goals
 *  - Sleek board-game vibe (navy + gold accents, subtle textures)
 *  - Big, tappable cards/buttons for kids on tablets/phones
 *  - Gamified loop: 수업 ▶ 퀴즈 ▶ 모의투자 ▶ 보상
 *  - Minimal logic; focus on look & feel and interaction micro-animations
 *
 * Tech
 *  - React (single-file component)
 *  - TailwindCSS for styling
 *  - shadcn/ui for primitives (Card, Button, Badge, Progress)
 *  - Framer Motion for delightful animations
 *  - lucide-react icons
 */

// --- Palette helpers -------------------------------------------------------
const appBg =
  "min-h-screen w-full bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(255,255,255,0.08),transparent)] bg-slate-950 text-slate-100";
const panel =
  "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]";
const goldText = "text-amber-300";
const goldRing = "ring-1 ring-amber-400/30";
const tileGrad =
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]";

// --- Demo data -------------------------------------------------------------
const lessonCards = [
  {
    id: 1,
    title: "주식이 뭐예요?",
    chips: ["기초", "용어"],
    progress: 70,
  },
  { id: 2, title: "왜 투자할까?", chips: ["마인드"], progress: 40 },
  { id: 3, title: "가격과 가치", chips: ["핵심"], progress: 10 },
];

const quizDeck = [
  {
    q: "배당이란 무엇일까요?",
    a: "회사가 벌어들인 이익을 주주에게 나눠주는 것",
  },
  { q: "PER가 낮다는 건?", a: "이익 대비 주가가 상대적으로 낮을 수 있음" },
  { q: "분산투자의 장점은?", a: "위험을 줄일 수 있음" },
];

const glossary = [
  { term: "주식", def: "회사 소유권의 조각." },
  { term: "배당", def: "이익을 주주에게 나눠주는 돈." },
  { term: "PER", def: "주가를 1주당 이익으로 나눈 값." },
];

const boardTiles = [
  { key: "home", label: "홈", icon: Home },
  { key: "lesson", label: "수업", icon: BookOpen },
  { key: "quiz", label: "퀴즈", icon: HelpCircle },
  { key: "invest", label: "모의투자", icon: LineChart },
  { key: "glossary", label: "용어", icon: Library },
  { key: "settings", label: "설정", icon: Settings },
];

// --- Root component --------------------------------------------------------
export default function KidsInvestBoardUI() {
  const [tab, setTab] = useState("home");
  const [coins, setCoins] = useState(1200);
  const [streak, setStreak] = useState(3);

  const ActiveView = useMemo(() => {
    switch (tab) {
      case "lesson":
        return <LessonView onReward={() => setCoins((c) => c + 20)} />;
      case "quiz":
        return (
          <QuizView
            onCorrect={() => {
              setCoins((c) => c + 30);
              setStreak((s) => s + 1);
            }}
          />
        );
      case "invest":
        return <InvestView onGain={() => setCoins((c) => c + 25)} />;
      case "glossary":
        return <GlossaryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeBoard onNavigate={setTab} />;
    }
  }, [tab]);

  return (
    <div className={appBg}>
      {/* App chrome */}
      <header className="sticky top-0 z-40 px-4 py-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-slate-950/55">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 ${goldRing}`}>
              <Coins className="h-5 w-5 text-amber-300" />
            </motion.div>
            <div>
              <div className="text-xs text-slate-300">코인</div>
              <div className={`-mt-0.5 font-bold ${goldText}`}>{coins.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[13px] text-slate-300">어린이 주식 모험</div>
            <div className="text-lg font-bold tracking-wide text-slate-50">
              개미 투자 캠프
            </div>
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
      </header>

      {/* Main content container */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6">
        <div className="grid gap-4 sm:gap-6">
          <AnimatePresence mode="wait">{ActiveView}</AnimatePresence>
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-6xl">
        <div className={`m-3 ${panel} p-2 ${goldRing} bg-slate-900/70`}>
          <div className="grid grid-cols-6 gap-1">
            {boardTiles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`group flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 ${
                  tab === key ? "bg-amber-400/15 ring-1 ring-amber-300/40" : "hover:bg-white/5"
                } transition`}
              >
                <Icon className={`h-5 w-5 ${tab === key ? "text-amber-300" : "text-slate-300 group-hover:text-slate-200"}`} />
                <span className={`mt-1 text-[11px] ${tab === key ? "text-amber-200" : "text-slate-300/80"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

// --- Views -----------------------------------------------------------------
function HomeBoard({ onNavigate }: { onNavigate: (t: string) => void }) {
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
        <Button className="mt-4 bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={() => onNavigate("lesson")}>시작하기</Button>
      </BoardTile>

      <MenuTile icon={BookOpen} label="수업" onClick={() => onNavigate("lesson")} />
      <MenuTile icon={HelpCircle} label="퀴즈" onClick={() => onNavigate("quiz")} />
      <MenuTile icon={LineChart} label="모의투자" onClick={() => onNavigate("invest")} />
      <MenuTile icon={Library} label="용어사전" onClick={() => onNavigate("glossary")} />
      <MenuTile icon={Settings} label="설정" onClick={() => onNavigate("settings")} />
    </motion.section>
  );
}

function BoardTile({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
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

function MenuTile({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`group ${panel} ${goldRing} p-5 text-left transition hover:translate-y-[-2px]`}> 
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

function LessonView({ onReward }: { onReward: () => void }) {
  return (
    <motion.section
      key="lesson"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {lessonCards.map((c) => (
        <Card key={c.id} className={`${panel} ${goldRing}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-50">
              {c.title}
              <div className="space-x-2">
                {c.chips.map((t) => (
                  <Badge key={t} className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">{t}</Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-300/90">카드를 눌러 수업을 시작해요. 끝까지 들으면 코인을 받을 수 있어요!</div>
            <Progress value={c.progress} className="h-2 bg-slate-800" />
            <div className="text-xs text-slate-400">진도 {c.progress}%</div>
            <Button
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300"
              onClick={onReward}
            >
              수업 듣기 & 코인 받기
            </Button>
          </CardContent>
        </Card>
      ))}
    </motion.section>
  );
}

function QuizView({ onCorrect }: { onCorrect: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = quizDeck[index % quizDeck.length];

  return (
    <motion.section
      key="quiz"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="mx-auto grid max-w-2xl gap-4"
    >
      <div className="text-center text-sm text-slate-300">카드를 눌러서 뒤집어 정답을 확인해보세요!</div>
      <motion.div
        className={`relative ${panel} ${goldRing} ${tileGrad} h-64 cursor-pointer select-none rounded-2xl p-6 [transform-style:preserve-3d]`}
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front */}
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
          <div className="px-6 text-center">
            <div className="mb-2 text-xs uppercase tracking-wide text-amber-200">Quiz</div>
            <div className="text-xl font-semibold text-slate-50">{card.q}</div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 grid rotate-y-180 place-items-center [backface-visibility:hidden]">
          <div className="px-6 text-center">
            <div className="mb-2 text-xs uppercase tracking-wide text-emerald-200">Answer</div>
            <div className="text-xl font-semibold text-emerald-200">{card.a}</div>
            <Button
              className="mt-4 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              onClick={(e) => {
                e.stopPropagation();
                onCorrect();
                setFlipped(false);
                setIndex((i) => i + 1);
              }}
            >
              정답 확인! 다음 문제 ▶
            </Button>
          </div>
        </div>
      </motion.div>

      <div className={`${panel} ${goldRing} p-4 text-center text-sm text-slate-300`}>
        <Star className="mr-1 inline h-4 w-4 text-amber-300" /> 정답 보너스 코인 +30, 연속 정답 시 추가 보너스!
      </div>
    </motion.section>
  );
}

function InvestView({ onGain }: { onGain: () => void }) {
  const [price, setPrice] = useState(100);
  const [pos, setPos] = useState(0);

  // Simple playful walk on a 12-tile mini board; gain when landing on gold tile
  const tiles = new Array(12).fill(0).map((_, i) => i);
  const goldTile = 8;

  function roll() {
    const step = Math.floor(Math.random() * 3) + 1; // 1~3
    const next = (pos + step) % tiles.length;
    setPos(next);
    const delta = Math.floor(Math.random() * 11) - 5; // -5 ~ +5
    setPrice((p) => Math.max(80, p + delta));
    if (next === goldTile) onGain();
  }

  return (
    <motion.section
      key="invest"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className={`${panel} ${goldRing} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-300">가격</div>
            <div className="text-2xl font-bold text-slate-50">{price} 코인</div>
          </div>
          <Badge className="bg-amber-400/20 text-amber-200 border border-amber-400/30">보너스 타일 = {goldTile + 1}</Badge>
        </div>
        {/* Mini board */}
        <div className="grid grid-cols-6 gap-2">
          {tiles.map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl border border-white/10 ${
                i === goldTile ? "bg-amber-500/15" : "bg-slate-800/50"
              } ${tileGrad} relative overflow-hidden`}
            >
              <div className="absolute inset-x-0 top-1 text-center text-[10px] text-slate-400">{i + 1}</div>
              {pos === i && (
                <motion.div
                  layoutId="token"
                  className="absolute inset-0 grid place-items-center"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  <div className="h-8 w-8 rounded-full bg-amber-300 shadow-inner ring-2 ring-amber-200/70" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-300">주사위를 굴려 이동해요. 황금 타일에 서면 보상!</div>
          <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={roll}>
            굴리기 (1~3)
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className={`${panel} ${goldRing}`}>
          <CardHeader>
            <CardTitle className="text-slate-50">간단 포트폴리오</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300/90">
            <div className="flex items-center justify-between"><span>코인</span><span>800</span></div>
            <div className="flex items-center justify-between"><span>현금</span><span>400</span></div>
            <div className="flex items-center justify-between"><span>총자산</span><span>1,200</span></div>
            <div className="pt-2 text-xs text-slate-400">* 실제 시세가 아닌 교육용 데모 화면</div>
          </CardContent>
        </Card>

        <Card className={`${panel} ${goldRing}`}>
          <CardHeader>
            <CardTitle className="text-slate-50">투자 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300/90">
            <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" /> 분산투자를 통해 위험을 줄여요.</div>
            <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" /> 장기투자로 복리 효과를 노려요.</div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}

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
      {glossary.map((g) => (
        <div key={g.term} className={`${panel} ${goldRing} p-5`}>
          <div className="text-sm uppercase tracking-wide text-amber-200">{g.term}</div>
          <div className="mt-1 text-base text-slate-100">{g.def}</div>
        </div>
      ))}
    </motion.section>
  );
}

function SettingsView() {
  return (
    <motion.section
      key="settings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-4 lg:grid-cols-2"
    >
      <div className={`${panel} ${goldRing} p-5`}>
        <h3 className="text-lg font-bold text-slate-50">부모님 모드</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-300/90">
          <div className="flex items-center justify-between">
            <span>학습 시간 제한</span>
            <Badge className="bg-slate-800 text-slate-200 border border-white/10">30분</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>난이도</span>
            <Badge className="bg-slate-800 text-slate-200 border border-white/10">보통</Badge>
          </div>
        </div>
      </div>

      <div className={`${panel} ${goldRing} p-5`}>
        <h3 className="text-lg font-bold text-slate-50">테마</h3>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { name: "Navy Gold", cls: "from-slate-900 to-indigo-900" },
            { name: "Forest", cls: "from-emerald-900 to-teal-900" },
            { name: "Candy", cls: "from-pink-900 to-purple-900" },
          ].map((t) => (
            <div key={t.name} className="space-y-2">
              <div className={`h-14 rounded-xl bg-gradient-to-br ${t.cls} ring-1 ring-white/10`} />
              <div className="text-center text-xs text-slate-300/80">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
