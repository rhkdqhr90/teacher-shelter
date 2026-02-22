'use client';

import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { MainLayout } from '@/components/layout';

const faqs = [
  {
    category: '회원가입/로그인',
    questions: [
      {
        q: '회원가입은 어떻게 하나요?',
        a: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 이메일, 비밀번호, 닉네임을 입력하면 가입할 수 있습니다. 가입 후 이메일 인증을 완료해야 서비스를 정상적으로 이용할 수 있습니다.',
      },
      {
        q: '소셜 로그인을 사용할 수 있나요?',
        a: '네, Google, 카카오, 네이버 계정으로 간편하게 로그인할 수 있습니다. 소셜 로그인 시 별도의 이메일 인증 절차는 필요하지 않습니다.',
      },
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 페이지에서 "비밀번호 찾기"를 클릭하고, 가입 시 사용한 이메일을 입력하시면 비밀번호 재설정 링크가 발송됩니다.',
      },
      {
        q: '회원 탈퇴는 어떻게 하나요?',
        a: '프로필 설정 > 계정 관리에서 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 작성한 게시글과 댓글은 삭제되지 않으며, 익명 처리됩니다.',
      },
    ],
  },
  {
    category: '게시판 이용',
    questions: [
      {
        q: '익명 게시판은 정말 익명인가요?',
        a: '네, 익명 게시판에 작성한 글과 댓글은 다른 회원에게 작성자 정보가 공개되지 않습니다. 단, 법적 문제 발생 시 수사기관의 적법한 요청에 따라 정보가 제공될 수 있습니다.',
      },
      {
        q: '게시글에 이미지를 첨부할 수 있나요?',
        a: '네, 게시글 작성 시 에디터를 통해 이미지를 첨부할 수 있습니다. 개인정보가 포함된 이미지는 모자이크 처리 후 업로드해 주세요.',
      },
      {
        q: '부적절한 게시글을 발견했어요.',
        a: '게시글 우측 상단의 신고 버튼을 클릭하여 신고해 주세요. 관리자가 검토 후 커뮤니티 가이드라인에 따라 조치합니다.',
      },
      {
        q: '내 글이 삭제되었어요. 왜 그런가요?',
        a: '커뮤니티 가이드라인을 위반한 게시글은 관리자에 의해 삭제될 수 있습니다. 자세한 사유는 알림 또는 이메일로 안내됩니다.',
      },
    ],
  },
  {
    category: '교사 인증',
    questions: [
      {
        q: '교사 인증은 꼭 해야 하나요?',
        a: '교사 인증은 선택 사항입니다. 다만 인증을 완료하면 프로필에 인증 뱃지가 표시되어 신뢰도가 높아지고, 일부 게시판에서 우선 노출 등의 혜택을 받을 수 있습니다.',
      },
      {
        q: '인증에 어떤 서류가 필요한가요?',
        a: '재직증명서 또는 교원자격증 이미지를 제출해 주시면 됩니다. 개인정보(주민번호 뒷자리 등)는 가려서 제출해 주세요.',
      },
      {
        q: '인증 심사는 얼마나 걸리나요?',
        a: '제출 후 영업일 기준 1-3일 내에 심사가 완료됩니다. 심사 결과는 이메일과 알림으로 안내됩니다.',
      },
      {
        q: '인증이 거부되었어요. 어떻게 하나요?',
        a: '거부 사유를 확인하시고, 문제를 수정한 후 다시 제출해 주세요. 서류가 불명확하거나 개인정보가 제대로 가려지지 않은 경우 거부될 수 있습니다.',
      },
    ],
  },
  {
    category: '구인공고',
    questions: [
      {
        q: '구인공고는 누가 등록할 수 있나요?',
        a: '원장/센터장으로 등록된 회원 또는 교사 인증을 완료한 회원이 구인공고를 등록할 수 있습니다.',
      },
      {
        q: '지원서는 어떻게 확인하나요?',
        a: '내가 등록한 공고의 상세 페이지에서 지원자 목록을 확인할 수 있습니다. 지원자의 프로필과 제출한 정보를 확인하고 연락할 수 있습니다.',
      },
      {
        q: '구인공고 수정/삭제는 어떻게 하나요?',
        a: '내가 등록한 공고의 상세 페이지에서 수정 또는 삭제할 수 있습니다. 이미 지원자가 있는 공고는 삭제 시 지원자에게 안내 알림이 발송됩니다.',
      },
    ],
  },
  {
    category: '기타',
    questions: [
      {
        q: '알림은 어떻게 설정하나요?',
        a: '프로필 설정에서 알림 수신 여부를 설정할 수 있습니다. 댓글, 좋아요, 공지사항 등 원하는 알림만 선택적으로 받을 수 있습니다.',
      },
      {
        q: '다크 모드를 지원하나요?',
        a: '네, 화면 우측 상단의 테마 토글 버튼을 클릭하여 라이트/다크 모드를 전환할 수 있습니다.',
      },
      {
        q: '모바일에서도 이용할 수 있나요?',
        a: '네, 교사쉼터는 반응형 웹으로 제작되어 모바일 브라우저에서도 편리하게 이용할 수 있습니다.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-1.5 py-4 text-left"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`text-muted-foreground h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="text-muted-foreground pb-4 pl-2 text-sm">{answer}</div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="mx-auto max-w-4xl">
        {/* 페이지 타이틀 */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <HelpCircle className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">자주 묻는 질문</h1>
            <p className="text-muted-foreground text-sm">궁금한 점을 빠르게 해결하세요</p>
          </div>
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-8">
          {faqs.map((category) => (
            <section key={category.category}>
              <h2 className="text-primary mb-4 p-1.5 text-lg font-semibold">{category.category}</h2>
              <div className="bg-card rounded-lg border">
                {category.questions.map((faq, index) => (
                  <FAQItem key={index} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 문의 안내 */}
        <div className="bg-muted/50 mt-12 rounded-lg p-6 text-center">
          <h3 className="mb-2 font-semibold">원하는 답변을 찾지 못하셨나요?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            문의하기를 통해 직접 질문해 주시면 빠르게 답변 드리겠습니다.
          </p>
          <Link
            href="/support"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
          >
            문의하기
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
