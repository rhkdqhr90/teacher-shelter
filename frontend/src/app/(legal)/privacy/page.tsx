import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '교사쉼터 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h1>개인정보처리방침</h1>
          <p className="text-muted-foreground">시행일: 2025년 1월 1일</p>

          <p>
            교사쉼터(이하 &quot;회사&quot;)는 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
            관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
            다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2>제1조 (개인정보의 수집 항목 및 수집 방법)</h2>

            <h3>1. 수집하는 개인정보 항목</h3>
            <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>

            <h4>필수항목</h4>
            <ul>
              <li>회원가입: 이메일 주소, 비밀번호, 닉네임</li>
              <li>소셜 로그인(Google, 카카오, 네이버): 이메일 주소, 이름, 프로필 사진 URL</li>
            </ul>

            <h4>선택항목</h4>
            <ul>
              <li>프로필 정보: 직종, 경력, 자기소개, 프로필 이미지</li>
              <li>교사 인증: 재직증명서 또는 자격증 이미지</li>
            </ul>

            <h4>서비스 이용 과정에서 자동 생성되는 정보</h4>
            <ul>
              <li>서비스 이용 기록, 접속 로그, 접속 IP 정보, 쿠키</li>
              <li>기기 정보 (OS, 브라우저 종류)</li>
            </ul>

            <h3>2. 개인정보 수집 방법</h3>
            <ul>
              <li>홈페이지 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
              <li>소셜 로그인 서비스를 통한 제공</li>
              <li>서비스 이용 과정에서 자동으로 생성·수집</li>
            </ul>
          </section>

          <section>
            <h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
            <ol>
              <li>
                <strong>회원 관리</strong>
                <ul>
                  <li>회원제 서비스 이용에 따른 본인확인</li>
                  <li>회원자격 유지·관리</li>
                  <li>서비스 부정이용 방지</li>
                  <li>각종 고지·통지</li>
                </ul>
              </li>
              <li>
                <strong>서비스 제공</strong>
                <ul>
                  <li>커뮤니티 서비스 제공 (게시글 작성, 댓글, 좋아요 등)</li>
                  <li>구인공고 서비스 제공</li>
                  <li>알림 서비스 제공</li>
                  <li>맞춤형 서비스 제공</li>
                </ul>
              </li>
              <li>
                <strong>서비스 개선</strong>
                <ul>
                  <li>신규 서비스 개발 및 기존 서비스 개선</li>
                  <li>서비스 이용 통계 분석</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
            <p>
              회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관련 법령에 의해 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관합니다.
            </p>

            <h3>1. 회사 내부 방침에 의한 정보 보유</h3>
            <ul>
              <li>부정이용 기록: 1년</li>
            </ul>

            <h3>2. 관련 법령에 의한 정보 보유</h3>
            <ul>
              <li>
                <strong>전자상거래 등에서의 소비자보호에 관한 법률</strong>
                <ul>
                  <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                </ul>
              </li>
              <li>
                <strong>통신비밀보호법</strong>
                <ul>
                  <li>서비스 이용 기록, 접속 로그, 접속 IP 정보: 3개월</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2>제4조 (개인정보의 제3자 제공)</h2>
            <p>
              회사는 이용자의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며,
              이용자의 사전 동의 없이 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
            </p>
            <p>다만, 다음의 경우에는 개인정보를 제3자에게 제공할 수 있습니다.</p>
            <ul>
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2>제5조 (개인정보 처리의 위탁)</h2>
            <p>
              회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
            </p>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2">수탁업체</th>
                  <th className="border p-2">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">이메일 발송 서비스</td>
                  <td className="border p-2">이메일 인증, 알림 발송</td>
                </tr>
                <tr>
                  <td className="border p-2">클라우드 서비스</td>
                  <td className="border p-2">데이터 저장 및 서버 운영</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>제6조 (이용자 및 법정대리인의 권리와 행사 방법)</h2>
            <p>이용자는 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ol>
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ol>
            <p>
              위 권리 행사는 서비스 내 &quot;프로필 설정&quot; 메뉴를 통해 직접 처리하거나,
              고객센터를 통해 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2>제7조 (개인정보의 파기)</h2>
            <h3>1. 파기 절차</h3>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>

            <h3>2. 파기 방법</h3>
            <ul>
              <li>전자적 파일 형태의 정보: 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section>
            <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ol>
              <li>
                <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육
              </li>
              <li>
                <strong>기술적 조치</strong>: 개인정보 암호화, 접근권한 관리, 보안프로그램 설치
              </li>
              <li>
                <strong>물리적 조치</strong>: 전산실, 자료보관실 등의 접근통제
              </li>
            </ol>
          </section>

          <section>
            <h2>제9조 (쿠키의 설치·운영 및 거부)</h2>
            <h3>1. 쿠키란?</h3>
            <p>
              쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보로,
              이용자의 컴퓨터 또는 모바일 기기 내에 저장됩니다.
            </p>

            <h3>2. 쿠키 사용 목적</h3>
            <ul>
              <li>로그인 상태 유지</li>
              <li>서비스 이용 기록 분석</li>
              <li>맞춤형 서비스 제공</li>
            </ul>

            <h3>3. 쿠키 설정 거부 방법</h3>
            <p>
              이용자는 웹브라우저의 설정을 통해 쿠키 저장을 거부할 수 있습니다.
              다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2>제10조 (개인정보 보호책임자)</h2>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 이용자의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <ul>
              <li>개인정보 보호책임자: 운영팀</li>
              <li>이메일: privacy@teacher-shelter.com</li>
            </ul>
            <p>
              이용자는 서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을
              개인정보 보호책임자에게 문의하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2>제11조 (권익침해 구제방법)</h2>
            <p>
              이용자는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
              한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <ul>
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
              <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
            </ul>
          </section>

          <section>
            <h2>제12조 (개인정보 처리방침 변경)</h2>
            <p>
              이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다.
              이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.
            </p>
            <ul>
              <li>현재 버전: 2025년 1월 1일 시행</li>
            </ul>
          </section>

          <hr className="my-8" />

          <p className="text-sm text-muted-foreground">
            본 개인정보처리방침에 대한 문의사항이 있으시면{' '}
            <Link href="/support" className="text-primary hover:underline">
              고객센터
            </Link>
            로 연락해 주세요.
          </p>
        </article>
      </div>
    </div>
  );
}
