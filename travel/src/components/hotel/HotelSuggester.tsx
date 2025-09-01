'use client'
import { trackEvent } from '../../lib/analytics'

const HotelSuggester = () => {
  const handleClick = () => {
    trackEvent('affiliate_link_clicked', { service: 'rakuten_hotel' })
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <a
        href="https://travel.rakuten.co.jp/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="text-blue-600 underline"
      >
        楽天トラベルでホテルを探す
      </a>
    </div>
  )
}

export default HotelSuggester
