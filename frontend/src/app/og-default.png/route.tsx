import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, marginBottom: 16 }}>
          교사쉼터
        </div>
        <div style={{ fontSize: 28, opacity: 0.9 }}>
          특수교사 · 보육교사를 위한 커뮤니티
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
