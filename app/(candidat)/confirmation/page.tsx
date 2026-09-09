export default function ConfirmationPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#58B746', color: 'white', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>OK</div>
      <h1 style={{ color: '#022753', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Votre candidature a ete enregistree avec succes</h1>
      <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>Elle sera examinee par l&apos;equipe du CFP-MBS. Vous recevrez un email des qu&apos;une decision aura ete prise concernant votre profil de formateur.</p>
      <a href="/candidature/completer" style={{ color: '#3A62AA', fontSize: 13, marginTop: 16, textDecoration: 'underline' }}>Completer mon profil avec mes competences pedagogiques (facultatif)</a>
    </div>
  )
}