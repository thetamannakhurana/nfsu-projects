// Save as: components/NFSUFooter.tsx
export default function NFSUFooter() {
  return (
    <p className="text-center text-xs text-gray-400 py-4">
      © {new Date().getFullYear()} National Forensic Sciences University · Created &amp; Managed by{' '}
      <a
        href="https://tamannakhurana.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium hover:underline transition-colors"
        style={{ color: '#E8A820' }}
      >
        Tamanna Khurana
      </a>
    </p>
  )
}