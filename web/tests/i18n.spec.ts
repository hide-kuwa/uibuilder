import { getLocale, setLocale, t } from '@/lib/i18n/i18n'

it('switches locale and reflects labels', () => {
  setLocale('ja'); expect(getLocale()).toBe('ja'); expect(t('copyCss')).toMatch(/CSSをコピー/)
  setLocale('en'); expect(t('copyCss')).toBe('Copy CSS')
})

