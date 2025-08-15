import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  url: string
  email: string
}

export const MagicLinkEmail = ({ url, email }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>ミタスケアへのログインリンク</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>ミタスケア</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>こんにちは、</Text>
            <Text style={paragraph}>ミタスケアへのログインリンクをお送りします。</Text>
            <Text style={paragraph}>下記のボタンをクリックしてログインしてください：</Text>

            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                ログインする
              </Button>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>重要:</strong> このリンクは10分間有効です。
                期限が切れた場合は、再度ログインをお試しください。
              </Text>
            </Section>

            <Text style={smallText}>
              このメールに心当たりがない場合は、無視していただいて構いません。
            </Text>

            <Text style={smallText}>
              ボタンが機能しない場合は、以下のリンクをブラウザにコピー＆ペーストしてください：
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© 2025 ミタスケア</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

MagicLinkEmail.PreviewProps = {
  url: 'https://care-app.jp/auth/verify?token=example-token',
  email: 'user@example.com',
} as MagicLinkEmailProps

export default MagicLinkEmail

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#3b82f6',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0',
}

const content = {
  padding: '32px 24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '24px 0',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0 8px',
}

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #eeeeee',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}
