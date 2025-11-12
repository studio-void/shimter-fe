import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Camera,
  Droplets,
  Sun,
  Thermometer,
  Wifi,
  Bluetooth,
  Brain,
  BarChart3,
  Leaf,
  Users,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden h-full w-full max-w-[55vw] lg:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,119,255,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-6 py-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_minmax(0,420px)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-2 text-sm font-medium text-brand-dark shadow-sm backdrop-blur">
                <Leaf className="h-4 w-4" />
                도시형 스마트 가든 플랫폼
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                심터와 함께
                <span className="block text-brand-dark">
                  데이터로 배우는 재배 경험
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 md:text-xl">
                센서와 AI 분석을 결합한 학습형 스마트팜으로, 사용자 맞춤 재배와
                교육 경험을 동시에 제공합니다.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 text-white bg-brand hover:bg-brand-dark"
                  >
                    대시보드 시작하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="rounded-full bg-gray-100 px-4 py-2 font-medium">
                    #키우면서_배우는
                  </span>
                  <span className="rounded-full bg-gray-100 px-4 py-2 font-medium">
                    #맞춤형스마트팜
                  </span>
                  <span className="rounded-full bg-gray-100 px-4 py-2 font-medium">
                    #도시농업혁신
                  </span>
                </div>
              </div>
            </div>
            <div className="relative rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur">
              <div className="absolute inset-x-8 -top-6 z-0 h-24 rounded-3xl bg-brand/10 blur-2xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      실시간 환경 모니터링
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      온도·습도·조도 데이터를 실시간으로 수집하고 대시보드에
                      시각화합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI 기반 생육 분석
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      촬영된 이미지를 분석해 작물 상태를 진단하고 개선 방향을
                      제안합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      함께 성장하는 학습 경험
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      데이터 기반 인사이트와 맞춤형 가이드를 통해 재배를 배우고
                      확장합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background & Motivation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              배경 및 동기
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-xl mb-6 font-semibold text-gray-900">
                심터는 사용자 환경에 딱 맞는 소형 스마트팜 솔루션을 통해 스스로
                작물을 기를 수 있도록 돕습니다.
              </p>
              <p className="mb-4">
                최근 도시화가 가속화되면서 도시농업 시장은 커지고 있는 반면,
                생활 속에서 농업에 대해 이해하고 경험할 기회는 점점 줄어들고
                있습니다. 학교와 가정에서는 식물 재배를 통해 생태와 과학 원리를
                배우려는 시도가 늘고 있지만, 실제로는 관리의 어려움과 전문
                지식의 부족으로 지속적으로 운영하는데 현실적인 어려움이
                존재합니다.
              </p>
              <p className="mb-4">
                특히, 소형 교육용 스마트팜은 대부분 단순한 환경 제어에 그치며,
                사용자가 스스로 재배 방법을 학습하거나 문제를 분석할 수 있는
                기능이 부족합니다. 이러한 문제의식을 바탕으로, 저희는{" "}
                <strong>"소형·개인 맞춤형 스마트 가든, 심터"</strong>를
                개발하였습니다.
              </p>
              <p>
                심터는 단순한 자동화 시스템이 아닌, 사용자가 직접 작물의 생장
                데이터를 관찰하고, 어떤 의사결정을 내릴지 배울 수 있는{" "}
                <strong>학습형 플랫폼</strong>입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Shimter Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
              심터 소개
            </h2>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Hardware */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-brand-20">
                    <Thermometer className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">하드웨어</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  심터의 하드웨어는 온·습도, 조도, 카메라 센서를 탑재하고,
                  블루투스 및 와이파이를 통해 실시간 데이터를 전송하여
                  대시보드에 시각화합니다.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 text-brand" />
                    <p className="text-sm font-medium">온도</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Droplets className="h-8 w-8 mx-auto mb-2 text-brand" />
                    <p className="text-sm font-medium">습도</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Sun className="h-8 w-8 mx-auto mb-2 text-brand" />
                    <p className="text-sm font-medium">조도</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="h-4 w-4" />
                    <span>블루투스</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>와이파이</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>카메라</span>
                  </div>
                </div>
              </div>

              {/* Software */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-brand-20">
                    <Brain className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    소프트웨어
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">
                  카메라로 촬영된 이미지는 AI 모델로 전송되어 작물의 질병 여부를
                  판단하고, 개선이 필요한 사항을 사용자에게 제안합니다.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Brain className="h-5 w-5 text-brand" />
                    <span className="text-sm font-medium">
                      AI 기반 질병 진단
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-brand" />
                    <span className="text-sm font-medium">
                      데이터 통합 분석
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-brand" />
                    <span className="text-sm font-medium">
                      맞춤형 재배 조언
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                사용자는 식물의 환경 상태를 직관적으로 관찰하며 재배 과정에서
                일어나는 변화를 스스로 학습합니다. 시스템은 온·습도, 조도, 위치
                기반 날씨 데이터를 함께 통합적으로 분석하여 보다 정밀한 피드백을
                제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                심터는 단순히 '식물을 키우는 도구'가 아닌, 사용자가 식물과 함께
                성장하며 배우는 <strong>학습형 스마트 가든</strong>입니다.
                저희는 이를 통해 도시 속에서도 자연을 이해하고, 데이터와 과학을
                기반으로 생태적 감수성을 키울 수 있는 새로운 교육 경험을
                제공하고자 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
              우리의 과정
            </h2>
            <div className="flex flex-nowrap justify-center items-start gap-2 md:gap-3 lg:gap-4 overflow-x-auto pb-4">
              {[
                {
                  step: 1,
                  title: "센서와 카메라를 통한 데이터 수집",
                  icon: Camera,
                },
                {
                  step: 2,
                  title: "앱/웹과 장치 연결",
                  icon: Wifi,
                },
                {
                  step: 3,
                  title: "카메라 데이터 비전 분석",
                  icon: Brain,
                },
                {
                  step: 4,
                  title: "작물별 생육 조건 및 센서 데이터 비교",
                  icon: BarChart3,
                },
                {
                  step: 5,
                  title: "재배 방식에 대한 조언 및 개선점 제공 → 학습 효과",
                  icon: GraduationCap,
                },
              ].map((item, index, array) => (
                <div key={item.step} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand text-white flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <div className="mt-3 md:mt-4 w-36 md:w-40 lg:w-44 text-center">
                      <item.icon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 text-brand" />
                      <p className="text-xs md:text-sm font-medium text-gray-700 leading-tight">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  {index < array.length - 1 && (
                    <ArrowRight className="hidden md:block mx-1 md:mx-2 lg:mx-3 h-5 w-5 md:h-6 md:w-6 text-gray-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 text-white bg-linear-to-br from-brand-dark via-brand to-brand-light">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-white">
              심터의 비전
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-xl mb-6 text-center text-white/90">
                "누구나 쉽게 배우고, 스스로 성장하는 도시형 스마트 농업 생태계"
              </p>
              <p className="mb-4">
                심터는 단순히 작물을 재배하는 도구를 넘어 인공지능과
                사물인터넷을 결합한 교육 플랫폼으로서 도시농업의 패러다임을
                새롭게 정의하고자 합니다.
              </p>
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">가정</h3>
                  </div>
                  <p className="text-white/90">
                    아이와 부모가 함께 식물의 생장 원리를 배우며 과학적 호기심을
                    키울 수 있습니다.
                  </p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">교실</h3>
                  </div>
                  <p className="text-white/90">
                    학생들이 데이터를 분석하고 실험하며 생명과 환경 분야의
                    교육을 경험할 수 있습니다.
                  </p>
                </div>
              </div>
              <p className="mb-4">
                더 나아가, 축적되는 사용자 데이터는 단일 사용자에 제한되지 않는
                확장된 인사이트로 발전하여, AI가 작물별 최적 재배 모델을
                구축하고 다양한 환경에서 적용 가능한 가이드라인을 제시하는{" "}
                <strong>"지능형 도시 농업 지식 생태계"</strong>로 확장할
                것입니다.
              </p>
              <p>
                심터는 궁극적으로 개인 학습용을 넘어 학교, 공공기관, 지역
                커뮤니티 가든까지 확장되어, 데이터 기반의 도시농업 네트워크를
                구축하는 것을 목표로 합니다. 이를 통해 저희 VO!D는 기술과 자연,
                그리고 교육이 조화를 이루는 지속가능한 도시 농업 문화를
                실현하고자 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Leaf className="h-16 w-16 mx-auto mb-6 text-brand" />
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              심터와 함께 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              식물과 함께 성장하며 배우는 새로운 경험을 시작해보세요
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="text-lg px-8 py-6 text-white bg-brand hover:bg-brand-dark"
              >
                대시보드 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg font-semibold mb-2">Powered by VO!D</p>
            <p className="text-gray-400 mb-4">From void, to!</p>
            <p className="text-sm text-gray-500">
              <a
                href="https://www.wevoid.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.wevoid.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
